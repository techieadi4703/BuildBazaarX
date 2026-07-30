import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { Redis } from "https://esm.sh/@upstash/redis@1.28.0";

const redisUrl = Deno.env.get("UPSTASH_REDIS_REST_URL");
const redisToken = Deno.env.get("UPSTASH_REDIS_REST_TOKEN");
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const token = authHeader.replace("Bearer ", "");
    
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    );

    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Invalid session" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const rawBody = await req.json();

    const CartItemSchema = z.object({
      product_id: z.string().or(z.number()),
      quantity: z.number().positive(),
      seller_id: z.string().optional()
    });
    
    const OrderSchema = z.object({
      cartItems: z.array(CartItemSchema).min(1, "Cart is empty")
    });

    const parsed = OrderSchema.safeParse(rawBody);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Invalid cart data", details: parsed.error.format() }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    const { cartItems } = parsed.data;

    const keyId = Deno.env.get("RAZORPAY_KEY_ID");
    const keySecret = Deno.env.get("RAZORPAY_KEY_SECRET");

    if (!keyId || !keySecret) {
      throw new Error("Razorpay credentials not configured");
    }

    // Rate Limiting by User ID
    if (redis) {
      const rlKey = `rl:create_order:${user.id}`;
      const requests = await redis.incr(rlKey);
      if (requests === 1) {
        await redis.expire(rlKey, 60); // 1 minute window
      }
      if (requests > 10) { // Max 10 order creation attempts per minute
        return new Response(JSON.stringify({ error: "Too Many Requests. Please wait before creating another order." }), { 
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } 
        });
      }
    }

    const productIds = cartItems.map((item: any) => item.product_id);
    const { data: products, error: productsError } = await supabaseAdmin
      .from("products")
      .select("id, price, name, stock_quantity, is_active")
      .in("id", productIds);

    if (productsError || !products) {
      throw new Error("Failed to fetch products");
    }

    let totalPaise = 0;
    const cartSnapshot: any[] = [];

    for (const item of cartItems) {
      const product = products.find((p: any) => p.id === String(item.product_id));
      if (!product) throw new Error(`Product ${item.product_id} not found`);
      if (!product.is_active) throw new Error(`Product "${product.name}" is no longer available`);
      if (product.stock_quantity < item.quantity) throw new Error(`Insufficient stock for "${product.name}"`);

      const lineTotal = Math.round(product.price * item.quantity * 100);
      totalPaise += lineTotal;

      cartSnapshot.push({
        product_id: product.id,
        name: product.name,
        quantity: item.quantity,
        unit_price_paise: Math.round(product.price * 100),
        line_total_paise: lineTotal,
        seller_id: item.seller_id,
      });
    }

    if (totalPaise < 100) throw new Error("Minimum order amount is ₹1");

    const credentials = btoa(`${keyId}:${keySecret}`);
    const receipt = `bbx_${user.id.slice(0, 8)}_${Date.now()}`;

    const rzpResponse = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: totalPaise,
        currency: "INR",
        receipt: receipt,
      }),
    });

    if (!rzpResponse.ok) {
      const err = await rzpResponse.json();
      throw new Error(`Razorpay error: ${JSON.stringify(err)}`);
    }

    const rzpOrder = await rzpResponse.json();

    const { error: insertError } = await supabaseAdmin.from("orders").insert({
      order_id: rzpOrder.id,
      razorpay_order_id: rzpOrder.id,
      user_id: user.id,
      cart_snapshot: cartSnapshot,
      total: totalPaise,
      currency: "INR",
      status: "created",
    });

    if (insertError) {
      throw new Error("Failed to persist payment record: " + insertError.message);
    }

    return new Response(JSON.stringify({
      orderId: rzpOrder.id,
      amount: totalPaise,
      currency: "INR",
      keyId: keyId,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("create-razorpay-order error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
