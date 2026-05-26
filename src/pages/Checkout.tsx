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
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  ShoppingBag, CreditCard, Smartphone, Banknote,
  ArrowLeft, Minus, Plus, Trash2, CheckCircle2, Lock, Sparkles, ShieldCheck,
  MapPin
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal, RevealItem } from "@/components/shared/Reveal";
import { validateUpiFormat, UpiValidationResult } from "@/lib/upi/validateFormat";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

  const [upiId, setUpiId] = useState("");
  const [upiValidation, setUpiValidation] = useState<UpiValidationResult | null>(null);
  const [showUpiConfirmModal, setShowUpiConfirmModal] = useState(false);
  const [verifiedUpiName, setVerifiedUpiName] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      if (upiId) setUpiValidation(validateUpiFormat(upiId));
      else setUpiValidation(null);
    }, 300);
    return () => clearTimeout(handler);
  }, [upiId]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
      setUserEmail(session?.user?.email ?? "");
      
      if (session?.user) {
        supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => {
            const profile = data as any;
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
    loadRazorpayScript();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

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

  const insertOrder = async (status: string = "pending") => {
    console.log("DB: Starting order insertion...");
    console.log("DB: Target Supplier ID:", items[0]?.supplier_id);
    
    const insertPromise = supabase
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

    const timeoutPromise = new Promise<{ data: null, error: Error }>((_, reject) => 
      setTimeout(() => reject(new Error("Database insertion timed out")), 10000)
    );

    const result = await Promise.race([insertPromise, timeoutPromise]) as any;
    if (result.error) throw new Error(result.error.message);
    console.log("DB: Order inserted successfully with ID:", result.data.id);
    return result.data.id as string;
  };

  const handleCOD = async () => {
    console.log("Processing COD order...");
    const orderId = await insertOrder("pending");
    sendConfirmationEmail(orderId);
    toast({
      title: "Order Placed! 🎉",
      description: form.email ? "Confirmation email is on its way!" : "We'll contact you shortly.",
    });
    clearCart();
    navigate("/");
  };

  const handleRazorpayPayment = async () => {
    console.log("1. Loading Razorpay script...");
    const loaded = await loadRazorpayScript();
    if (!loaded || !window.Razorpay) {
      throw new Error("Failed to load Razorpay SDK. Please check your connection.");
    }

    console.log("2. Creating Razorpay order via Edge Function...");
    const createOrderPromise = supabase.functions.invoke(
      "create-razorpay-order",
      { body: { amount: totalPrice, currency: "INR" } }
    );
    
    const timeoutPromise = new Promise<{ data: null, error: Error }>((_, reject) => 
      setTimeout(() => reject(new Error("Payment gateway request timed out")), 15000)
    );

    let result;
    try {
      result = await Promise.race([createOrderPromise, timeoutPromise]);
    } catch (err) {
      console.error("Razorpay order creation timeout/error:", err);
      throw new Error("Payment initialization timed out. Please try again.");
    }
    
    const { data: rzpOrder, error: rzpErr } = result as any;
    console.log("3. Razorpay order result:", { rzpOrder, rzpErr });
    
    if (rzpErr || !rzpOrder?.id) {
      throw new Error("Could not create payment order. Please try again.");
    }

    console.log("4. Inserting pending order into database...");
    const dbOrderId = await insertOrder("pending");

    console.log("5. Opening Razorpay modal...");
    await new Promise<void>((resolve, reject) => {
      try {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || import.meta.env.VITE_RAZORPAY_KEY_ID_TEST || import.meta.env.VITE_RAZORPAY_KEY_ID_LIVE,
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
          theme: { color: "#735c00" },
          modal: {
            ondismiss: () => {
              console.log("Razorpay modal dismissed by user");
              reject(new Error("Payment cancelled by user"));
            },
          },
          handler: async (response: any) => {
            console.log("6. Payment authorized, verifying signature...");
            try {
              const { error: verifyErr } = await supabase.functions.invoke("process-payment", {
                body: {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  order_db_id: dbOrderId,
                },
              });
              if (verifyErr) throw new Error("Payment verification failed.");
              console.log("7. Payment verified successfully!");
              sendConfirmationEmail(dbOrderId);
              resolve();
            } catch (err) {
              console.error("Payment verification error:", err);
              reject(err);
            }
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } catch (err) {
        console.error("Error opening Razorpay modal:", err);
        reject(err);
      }
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
    
    if (paymentMethod === "upi" && (!upiValidation || !upiValidation.valid)) {
      toast({
        title: "Invalid UPI ID",
        description: upiValidation?.reason || "Please enter a valid UPI ID.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (paymentMethod === "cod") {
        await handleCOD();
        setIsSubmitting(false);
      } else if (paymentMethod === "upi") {
        const { data, error } = await supabase.functions.invoke("upi-verify", {
          body: { upi: upiId }
        });
        
        if (error) throw new Error("Verification service unavailable.");
        if (!data.valid) {
          toast({
            title: "Verification Failed",
            description: data.reason || "This UPI ID does not exist or could not be verified.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        setVerifiedUpiName(data.name || "Verified User");
        setShowUpiConfirmModal(true);
        setIsSubmitting(false);
      } else {
        await handleRazorpayPayment();
        toast({
          title: "Payment Successful! 🎉",
          description: form.email ? "Confirmation email is on its way!" : "Your order is confirmed.",
        });
        clearCart();
        navigate("/");
        setIsSubmitting(false);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      if (!message.includes("cancelled")) {
        toast({ title: "Order Failed", description: message, variant: "destructive" });
      }
      setIsSubmitting(false);
    }
  };

  const handleConfirmUpiAndPay = async () => {
    setShowUpiConfirmModal(false);
    setIsSubmitting(true);
    try {
      await handleRazorpayPayment();
      toast({
        title: "Payment Successful! 🎉",
        description: form.email ? "Confirmation email is on its way!" : "Your order is confirmed.",
      });
      clearCart();
      navigate("/");
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      if (!message.includes("cancelled")) {
        toast({ title: "Payment Failed", description: message, variant: "destructive" });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-32 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-24 h-24 bg-secondary rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <ShoppingBag className="w-12 h-12 text-muted-foreground/40" />
          </motion.div>
          <h1 className="text-4xl font-black text-foreground mb-4 tracking-tight">Your cart is feeling light</h1>
          <p className="text-muted-foreground mb-10 text-lg">Add some premium products to your cart before checking out.</p>
          <Button size="lg" className="rounded-2xl h-14 px-10 font-bold text-lg" onClick={() => navigate("/materials")}>
            Explore Catalogues
          </Button>
        </div>
      </Layout>
    );
  }

  const isCOD = paymentMethod === "cod";

  return (
    <Layout>
      <div className="min-h-screen bg-secondary/10 py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="mb-10"
            >
              <Button variant="outline" className="bg-white/80 border-border/40 shadow-sm hover:shadow-md rounded-full font-bold text-foreground/70 hover:text-primary transition-all group px-6" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back to Shopping
              </Button>
            </motion.div>

            <Reveal width="100%" direction="up">
              <h1 className="text-4xl md:text-5xl font-black text-foreground mb-12 tracking-tight">Complete Your Order</h1>
            </Reveal>

            <div className="grid lg:grid-cols-12 gap-10">
              {/* Left Column: Forms */}
              <div className="lg:col-span-7 space-y-10">
                {/* 1. Shipping Details */}
                <Reveal width="100%" direction="up" delay={0.1}>
                  <Card className="border-border/50 shadow-[0_10px_40px_rgba(0,0,0,0.05)] bg-background/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                    <div className="bg-primary/5 px-10 py-6 border-b border-border/50 flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl font-black uppercase tracking-widest text-primary/80">Shipping Details</h2>
                    </div>
                    <CardContent className="p-10">
                      <form className="grid sm:grid-cols-2 gap-8" onSubmit={handleOrder}>
                        <RevealItem>
                          <div className="space-y-3">
                            <Label htmlFor="name" className="text-sm font-bold uppercase tracking-widest text-[#0B132B]/70 ml-1">Full Name</Label>
                            <Input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Required" required className="h-14 rounded-2xl bg-white/90 border-black/5 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-medium placeholder:text-black/40" />
                          </div>
                        </RevealItem>
                        <RevealItem>
                          <div className="space-y-3">
                            <Label htmlFor="phone" className="text-sm font-bold uppercase tracking-widest text-[#0B132B]/70 ml-1">Phone Number</Label>
                            <Input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+91 XXXX" required className="h-14 rounded-2xl bg-white/90 border-black/5 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-medium placeholder:text-black/40" />
                          </div>
                        </RevealItem>
                        <RevealItem>
                          <div className="space-y-3">
                            <Label htmlFor="email" className="text-sm font-bold uppercase tracking-widest text-[#0B132B]/70 ml-1">Email Address</Label>
                            <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" className="h-14 rounded-2xl bg-white/90 border-black/5 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-medium placeholder:text-black/40" />
                          </div>
                        </RevealItem>
                        <RevealItem>
                          <div className="space-y-3">
                            <Label htmlFor="pincode" className="text-sm font-bold uppercase tracking-widest text-[#0B132B]/70 ml-1">Pincode</Label>
                            <Input id="pincode" name="pincode" value={form.pincode} onChange={handleChange} placeholder="6-digit" required className="h-14 rounded-2xl bg-white/90 border-black/5 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-medium placeholder:text-black/40" />
                          </div>
                        </RevealItem>
                        <RevealItem className="sm:col-span-2">
                          <div className="space-y-3">
                            <Label htmlFor="address" className="text-sm font-bold uppercase tracking-widest text-[#0B132B]/70 ml-1">Complete Address</Label>
                            <Textarea id="address" name="address" value={form.address} onChange={handleChange} placeholder="House/Flat No., Street, Landmark..." rows={3} required className="rounded-2xl bg-white/90 border-black/5 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-medium min-h-[120px] pt-4 placeholder:text-black/40" />
                          </div>
                        </RevealItem>
                        <RevealItem>
                          <div className="space-y-3">
                            <Label htmlFor="city" className="text-sm font-bold uppercase tracking-widest text-[#0B132B]/70 ml-1">City</Label>
                            <Input id="city" name="city" value={form.city} onChange={handleChange} placeholder="City name" required className="h-14 rounded-2xl bg-white/90 border-black/5 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-medium placeholder:text-black/40" />
                          </div>
                        </RevealItem>
                        <RevealItem>
                          <div className="space-y-3">
                            <Label htmlFor="state" className="text-sm font-bold uppercase tracking-widest text-[#0B132B]/70 ml-1">State</Label>
                            <Input id="state" name="state" value={form.state} onChange={handleChange} placeholder="State name" className="h-14 rounded-2xl bg-white/90 border-black/5 focus:bg-background focus:ring-2 focus:ring-primary/20 transition-all font-medium placeholder:text-black/40" />
                          </div>
                        </RevealItem>
                      </form>
                    </CardContent>
                  </Card>
                </Reveal>

                {/* 2. Payment Selector */}
                <Reveal width="100%" direction="up" delay={0.2}>
                  <Card className="border-border/50 shadow-[0_10px_40px_rgba(0,0,0,0.05)] bg-background/80 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                    <div className="bg-primary/5 px-10 py-6 border-b border-border/50 flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl font-black uppercase tracking-widest text-primary/80">Secure Payment</h2>
                    </div>
                    <CardContent className="p-10">
                      <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                          { value: "upi", label: "Instant UPI", sub: "GPay, PhonePe", icon: Smartphone },
                          { value: "card", label: "Debit/Credit", sub: "Visa / Master", icon: CreditCard },
                          { value: "cod", label: "Pay on Arrival", sub: "Cash / UPI", icon: Banknote },
                        ].map((method) => (
                          <label
                            key={method.value}
                            className={`flex flex-col items-center text-center gap-4 p-8 rounded-3xl border-2 cursor-pointer transition-all ${
                              paymentMethod === method.value
                                ? "border-primary bg-primary/5 shadow-xl scale-105"
                                : "border-border/50 hover:border-primary/20 hover:bg-secondary/20"
                            }`}
                          >
                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${paymentMethod === method.value ? "bg-primary text-white" : "bg-secondary text-muted-foreground"}`}>
                              <method.icon className="w-7 h-7" />
                            </div>
                            <div className="space-y-1">
                              <span className="block font-black text-foreground">{method.label}</span>
                              <span className="block text-xs font-bold text-[#0B132B]/60 uppercase tracking-widest">{method.sub}</span>
                            </div>
                            <RadioGroupItem value={method.value} className="sr-only" />
                          </label>
                        ))}
                      </RadioGroup>

                      <AnimatePresence mode="wait">
                        {paymentMethod === "upi" && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-8 space-y-3"
                          >
                            <Label htmlFor="upi-id" className="text-sm font-bold uppercase tracking-widest text-[#0B132B]/70 ml-1">Verify UPI ID</Label>
                            <div className="relative">
                              <Input 
                                id="upi-id" 
                                value={upiId} 
                                onChange={(e) => setUpiId(e.target.value)} 
                                placeholder="e.g. username@bank" 
                                className={`h-14 rounded-2xl bg-white/90 border-black/5 focus:bg-background focus:ring-2 transition-all font-medium placeholder:text-black/40 ${upiId && upiValidation?.valid ? 'focus:ring-green-500/50 border-green-200' : upiId && !upiValidation?.valid ? 'focus:ring-red-500/50 border-red-200' : 'focus:ring-primary/20'}`} 
                              />
                            </div>
                            <AnimatePresence>
                              {upiId && upiValidation && (
                                <motion.p 
                                  initial={{ opacity: 0, y: -5 }} 
                                  animate={{ opacity: 1, y: 0 }} 
                                  className={`text-sm flex items-center gap-1.5 ml-1 ${upiValidation.valid ? 'text-green-600 font-semibold' : 'text-red-500'}`}
                                >
                                  {upiValidation.valid ? (
                                    <><CheckCircle2 className="w-4 h-4" /> Looks good, we'll verify on payment</>
                                  ) : (
                                    upiValidation.reason
                                  )}
                                </motion.p>
                              )}
                            </AnimatePresence>
                          </motion.div>
                        )}
                        {!isCOD && paymentMethod !== "upi" && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center gap-4 text-sm text-[#0B132B]/80 bg-secondary/40 rounded-2xl p-4 mt-8 border border-border/30"
                          >
                            <div className="w-10 h-10 bg-background rounded-xl flex items-center justify-center shrink-0">
                              <ShieldCheck className="w-6 h-6 text-green-600" />
                            </div>
                            <p className="font-medium leading-tight">
                              Your transaction is encrypted and secured by <strong className="text-foreground">Razorpay</strong>. No card details are ever shared with us.
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </Reveal>
              </div>

              {/* Right Column: Summary */}
              <div className="lg:col-span-5">
                <Reveal direction="left" distance={30} delay={0.3}>
                  <Card className="sticky top-24 border-border/50 shadow-[0_30px_90px_rgba(0,0,0,0.1)] bg-background rounded-[3rem] overflow-hidden">
                    <CardContent className="p-0">
                      <div className="p-10 bg-secondary/20">
                        <h2 className="text-2xl font-black mb-8 tracking-tight">Order Summary</h2>
                        <div className="space-y-6 max-h-[350px] overflow-y-auto pr-4 custom-scrollbar">
                          {items.map((item) => (
                            <motion.div 
                              key={item.id} 
                              layout
                              className="flex gap-5 group"
                              whileHover={{ x: 5 }}
                            >
                              <div className="relative w-24 h-24 rounded-[1.5rem] bg-white overflow-hidden shrink-0 border border-border/50">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" decoding="async" />
                                <div className="absolute inset-0 bg-black/5" />
                              </div>
                              <div className="flex-1 py-1 flex flex-col justify-between">
                                <div>
                                  <p className="text-[10px] font-black uppercase text-primary tracking-widest mb-1">{item.brand}</p>
                                  <p className="text-sm font-bold text-foreground line-clamp-1 leading-tight">{item.name}</p>
                                  <p className="text-[10px] font-medium text-[#0B132B]/60 mt-1">{item.specs}</p>
                                </div>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3 bg-secondary/50 rounded-full px-2 py-1 border border-border/30">
                                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 flex items-center justify-center hover:bg-background rounded-full transition-colors">
                                      <Minus className="w-3 h-3" />
                                    </button>
                                    <span className="w-4 text-center text-xs font-black">{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 flex items-center justify-center hover:bg-background rounded-full transition-colors">
                                      <Plus className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <div className="flex flex-col items-end">
                                    <span className="text-lg font-black text-foreground">₹{(item.price * item.quantity).toLocaleString()}</span>
                                    <button onClick={() => removeFromCart(item.id)} className="text-[10px] font-black uppercase tracking-tighter text-[#0B132B]/70 hover:text-destructive flex items-center gap-1 transition-colors">
                                      <Trash2 className="w-3 h-3" /> Remove
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      <div className="p-10 space-y-8">
                        <div className="space-y-4">
                          <div className="flex justify-between items-center text-sm font-bold">
                            <span className="text-[#0B132B]/70 uppercase tracking-widest">Bag Total</span>
                            <span className="text-foreground">₹{totalPrice.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm font-bold">
                            <span className="text-[#0B132B]/70 uppercase tracking-widest">Delivery Charge</span>
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground line-through">₹499</span>
                              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none rounded-full">FREE</Badge>
                            </div>
                          </div>
                          <Separator className="bg-border/50" />
                          <div className="flex justify-between items-end">
                            <div>
                              <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">Total Payable</p>
                              <p className="text-3xl font-black text-primary tracking-tighter">₹{totalPrice.toLocaleString()}</p>
                            </div>
                            <div className="bg-accent/5 p-3 rounded-2xl border border-accent/20">
                              <Sparkles className="w-6 h-6 text-accent animate-pulse" />
                            </div>
                          </div>
                        </div>

                        <Button
                          className="w-full h-20 rounded-[1.5rem] font-black text-xl shadow-2xl shadow-primary/30 relative overflow-hidden group"
                          onClick={handleOrder}
                          disabled={isSubmitting}
                        >
                          <AnimatePresence mode="wait">
                            {isSubmitting ? (
                              <motion.span 
                                key="submitting"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                className="flex items-center gap-3"
                              >
                                <span className="h-6 w-6 animate-spin rounded-full border-4 border-background/20 border-t-background" />
                                {isCOD ? "Placing Order..." : "Opening Payment Gate..."}
                              </motion.span>
                            ) : (
                              <motion.span 
                                key="idle"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                className="flex flex-col items-center gap-1"
                              >
                                <span className="flex items-center gap-2">
                                  {isCOD ? <CheckCircle2 className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                                  {isCOD ? "Place COD Order" : "Proceed to Pay"}
                                </span>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Verified Security</span>
                              </motion.span>
                            )}
                          </AnimatePresence>
                          <motion.div 
                            className="absolute inset-0 bg-primary-foreground/10"
                            initial={{ x: "-100%" }}
                            whileHover={{ x: "100%" }}
                            transition={{ duration: 0.5 }}
                          />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Reveal>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={showUpiConfirmModal} onOpenChange={setShowUpiConfirmModal}>
        <DialogContent className="sm:max-w-md border-0 bg-white shadow-2xl rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-center tracking-tight">Confirm Payment</DialogTitle>
            <DialogDescription className="text-center text-base pt-2">
              Sending payment to:
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center py-6 space-y-2 bg-secondary/30 rounded-2xl border border-border/50">
            <span className="text-xl font-black text-primary">{verifiedUpiName}</span>
            <span className="text-sm font-semibold text-muted-foreground">{upiId}</span>
          </div>
          <DialogFooter className="sm:justify-between flex-row gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1 rounded-2xl h-12 font-bold" onClick={() => setShowUpiConfirmModal(false)}>
              Edit
            </Button>
            <Button type="button" className="flex-1 rounded-2xl h-12 font-bold bg-primary text-white hover:bg-primary/90" onClick={handleConfirmUpiAndPay}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Checkout;
