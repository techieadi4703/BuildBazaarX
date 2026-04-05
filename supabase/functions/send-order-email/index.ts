import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderEmailPayload {
  customerEmail: string;
  customerName: string;
  orderId: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  deliveryAddress: {
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const payload: OrderEmailPayload = await req.json();
    const { customerEmail, customerName, orderId, items, total, deliveryAddress } = payload;

    // Build HTML email body
    const itemRows = items
      .map(
        (item) =>
          `<tr>
            <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;">${item.name}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center;">${item.quantity}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:right;">&#8377;${(item.price * item.quantity).toLocaleString("en-IN")}</td>
          </tr>`
      )
      .join("");

    const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f6f6f6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f6f6f6;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);padding:40px 40px 32px;text-align:center;">
            <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:700;">BuildBazaarX</h1>
            <p style="color:#a0aec0;margin:8px 0 0;font-size:14px;">Your order is confirmed! &#127881;</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px 0;">
            <h2 style="margin:0 0 8px;font-size:20px;color:#1a202c;">Hi ${customerName},</h2>
            <p style="margin:0;color:#718096;font-size:15px;line-height:1.6;">
              Thank you for your order! We've received it and our team will contact you shortly to confirm delivery.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px 0;">
            <div style="background:#f7fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px 20px;">
              <span style="font-size:12px;color:#a0aec0;text-transform:uppercase;letter-spacing:1px;">Order ID</span>
              <p style="margin:4px 0 0;font-size:14px;font-weight:600;color:#2d3748;font-family:monospace;">${orderId}</p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px 0;">
            <h3 style="margin:0 0 12px;font-size:16px;color:#2d3748;">Order Items</h3>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
              <thead>
                <tr style="background:#f7fafc;">
                  <th style="padding:10px 12px;text-align:left;font-size:12px;color:#718096;font-weight:600;">ITEM</th>
                  <th style="padding:10px 12px;text-align:center;font-size:12px;color:#718096;font-weight:600;">QTY</th>
                  <th style="padding:10px 12px;text-align:right;font-size:12px;color:#718096;font-weight:600;">PRICE</th>
                </tr>
              </thead>
              <tbody>${itemRows}</tbody>
              <tfoot>
                <tr style="background:#f7fafc;">
                  <td colspan="2" style="padding:12px;font-weight:700;color:#2d3748;">Total</td>
                  <td style="padding:12px;text-align:right;font-weight:700;color:#667eea;font-size:16px;">&#8377;${total.toLocaleString("en-IN")}</td>
                </tr>
              </tfoot>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px 0;">
            <h3 style="margin:0 0 12px;font-size:16px;color:#2d3748;">Delivery Address</h3>
            <div style="background:#f7fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px 20px;">
              <p style="margin:0;color:#4a5568;font-size:14px;line-height:1.8;">
                ${deliveryAddress.address}<br>
                ${deliveryAddress.city}${deliveryAddress.state ? ", " + deliveryAddress.state : ""} &mdash; ${deliveryAddress.pincode}
              </p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px 40px;text-align:center;">
            <p style="margin:0;color:#a0aec0;font-size:13px;line-height:1.6;">
              Questions? Contact us at<br>
              <a href="mailto:support@buildbazaarx.com" style="color:#667eea;">support@buildbazaarx.com</a>
            </p>
            <p style="margin:16px 0 0;color:#cbd5e0;font-size:12px;">&#169; 2025 BuildBazaarX. All rights reserved.</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    // Send via Brevo (formerly Sendinblue) HTTP API — works for ANY recipient, no domain verification needed
    const brevoApiKey = Deno.env.get("BREVO_API_KEY");
    if (!brevoApiKey) {
      throw new Error("BREVO_API_KEY is not configured");
    }

    const senderEmail = Deno.env.get("SENDER_EMAIL") ?? "buildbazaarx@gmail.com";
    const senderName = Deno.env.get("SENDER_NAME") ?? "BuildBazaarX";

    const emailRes = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": brevoApiKey,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: customerEmail, name: customerName }],
        subject: `Order Confirmed — #${orderId.slice(0, 8).toUpperCase()}`,
        htmlContent: htmlBody,
      }),
    });

    if (!emailRes.ok) {
      const err = await emailRes.json();
      throw new Error(`Brevo error: ${JSON.stringify(err)}`);
    }

    const data = await emailRes.json();
    return new Response(
      JSON.stringify({ success: true, messageId: data.messageId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("send-order-email error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
