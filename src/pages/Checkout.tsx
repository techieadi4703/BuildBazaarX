import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useCart } from "@/contexts/CartContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  ShoppingBag, CreditCard, Smartphone, Banknote,
  ArrowLeft, Minus, Plus, Trash2, CheckCircle2, Lock,
} from "lucide-react";

// Razorpay window type
declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

// Load Razorpay SDK script dynamically
function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.getElementById("razorpay-sdk")) return resolve(true);
    const script = document.createElement("script");
    script.id = "razorpay-sdk";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const Checkout = () => {
  const { items, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [form, setForm] = useState({
    name: "", phone: "", email: "", address: "", city: "", state: "", pincode: "",
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
      setUserEmail(session?.user?.email ?? "");
      
      if (session?.user) {
        // Pre-fill from profile
        supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
          .then(({ data: profile }) => {
            if (profile) {
              setForm((f) => ({
                ...f,
                name: profile.full_name || "",
                phone: profile.phone || "",
                email: session.user.email || "",
                address: profile.address || "",
                city: profile.city || "",
                state: profile.state || "",
                pincode: profile.pincode || "",
              }));
            }
          });
      }
    });
    // Preload Razorpay script
    loadRazorpayScript();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Send confirmation email (fire-and-forget)
  const sendConfirmationEmail = (orderId: string) => {
    if (!form.email) return;
    supabase.functions
      .invoke("send-order-email", {
        body: {
          customerEmail: form.email,
          customerName: form.name,
          orderId,
          items: items.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
          total: totalPrice,
          deliveryAddress: {
            address: form.address,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
          },
        },
      })
      .catch((err) => console.warn("Email send failed (non-critical):", err));
  };

  // Insert order to DB and return its ID
  const insertOrder = async (status: string = "pending") => {
    const { data, error } = await supabase
      .from("orders")
      .insert({
        user_id: userId,
        items: items as unknown as import("@/integrations/supabase/types").Json,
        total: totalPrice,
        delivery_address: form as unknown as import("@/integrations/supabase/types").Json,
        status,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return data.id as string;
  };

  // Handle COD flow
  const handleCOD = async () => {
    const orderId = await insertOrder("pending");
    sendConfirmationEmail(orderId);
    toast({
      title: "Order Placed! 🎉",
      description: form.email ? "Confirmation email is on its way!" : "We'll contact you shortly.",
    });
    clearCart();
    navigate("/");
  };

  // Handle Razorpay payment flow (UPI / Card)
  const handleRazorpayPayment = async () => {
    // 1. Load SDK
    const loaded = await loadRazorpayScript();
    if (!loaded || !window.Razorpay) {
      throw new Error("Failed to load Razorpay. Check your internet connection.");
    }

    // 2. Create Razorpay order via edge function
    const { data: rzpOrder, error: rzpErr } = await supabase.functions.invoke(
      "create-razorpay-order",
      { body: { amount: totalPrice, currency: "INR" } }
    );
    if (rzpErr || !rzpOrder?.id) {
      throw new Error("Could not create payment order. Please try again.");
    }

    // 3. Insert DB order as "pending"
    const dbOrderId = await insertOrder("pending");

    // 4. Open Razorpay modal — returns via promise
    await new Promise<void>((resolve, reject) => {
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: "BuildBazaarX",
        description: "Order Payment",
        order_id: rzpOrder.id,
        prefill: {
          name: form.name,
          email: form.email || userEmail,
          contact: form.phone,
        },
        theme: { color: "#6366f1" },
        modal: {
          ondismiss: () => reject(new Error("Payment cancelled by user")),
        },
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            // 5. Verify payment server-side
            const { error: verifyErr } = await supabase.functions.invoke("process-payment", {
              body: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                order_db_id: dbOrderId,
              },
            });
            if (verifyErr) throw new Error("Payment verification failed.");

            // 6. Send confirmation email
            sendConfirmationEmail(dbOrderId);
            resolve();
          } catch (err) {
            reject(err);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    });
  };

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address || !form.city || !form.pincode) {
      toast({
        title: "Missing fields",
        description: "Please fill all required fields.",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);

    try {
      if (paymentMethod === "cod") {
        await handleCOD();
      } else {
        await handleRazorpayPayment();
        toast({
          title: "Payment Successful! 🎉",
          description: form.email ? "Confirmation email is on its way!" : "Your order is confirmed.",
        });
        clearCart();
        navigate("/");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      // Don't show error toast for user-dismissed modal
      if (!message.includes("cancelled")) {
        toast({ title: "Order Failed", description: message, variant: "destructive" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add some products before checking out.</p>
          <Button onClick={() => navigate("/materials")}>Browse Products</Button>
        </div>
      </Layout>
    );
  }

  const isCOD = paymentMethod === "cod";

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>

        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left: Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Delivery Address</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="grid sm:grid-cols-2 gap-4" onSubmit={handleOrder}>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Your full name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+91 XXXXX XXXXX" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email (for confirmation)</Label>
                    <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode">Pincode *</Label>
                    <Input id="pincode" name="pincode" value={form.pincode} onChange={handleChange} placeholder="110001" required />
                  </div>
                  <div className="sm:col-span-2 space-y-2">
                    <Label htmlFor="address">Full Address *</Label>
                    <Textarea id="address" name="address" value={form.address} onChange={handleChange} placeholder="House/Flat No., Street, Landmark..." rows={3} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" name="city" value={form.city} onChange={handleChange} placeholder="City" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input id="state" name="state" value={form.state} onChange={handleChange} placeholder="State" />
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                  {[
                    { value: "upi", label: "UPI (GPay, PhonePe, Paytm)", icon: Smartphone, badge: "Instant" },
                    { value: "card", label: "Credit / Debit Card", icon: CreditCard, badge: "Secure" },
                    { value: "cod", label: "Cash on Delivery", icon: Banknote, badge: null },
                  ].map((method) => (
                    <label
                      key={method.value}
                      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === method.value
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border hover:border-primary/30"
                      }`}
                    >
                      <RadioGroupItem value={method.value} />
                      <method.icon className="w-5 h-5 text-primary" />
                      <span className="font-medium text-foreground flex-1">{method.label}</span>
                      {method.badge && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                          {method.badge}
                        </span>
                      )}
                    </label>
                  ))}
                </RadioGroup>

                {/* Razorpay trust badge (shown for UPI/Card) */}
                {!isCOD && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2 mt-2">
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span>Payments are secured & processed by <strong>Razorpay</strong>. Your card details are never stored.</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: Order Summary */}
          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.specs}</p>
                      <div className="flex items-center justify-between mt-1.5">
                        <div className="flex items-center gap-1 border border-border rounded-md">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-muted rounded-l-md transition-colors">
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-medium">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-muted rounded-r-md transition-colors">
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground">₹{(item.price * item.quantity).toLocaleString()}</span>
                          <button onClick={() => removeFromCart(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">₹{totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Delivery</span>
                    <span className="text-green-600 font-medium">Free</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span className="text-foreground">Total</span>
                    <span className="text-primary">₹{totalPrice.toLocaleString()}</span>
                  </div>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleOrder}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                      {isCOD ? "Placing Order..." : "Opening Payment..."}
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      {isCOD ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      {isCOD ? `Place Order — ₹${totalPrice.toLocaleString()}` : `Pay ₹${totalPrice.toLocaleString()} Securely`}
                    </span>
                  )}
                </Button>

                {!isCOD && (
                  <p className="text-xs text-center text-muted-foreground">
                    You'll be redirected to Razorpay's secure payment page
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
