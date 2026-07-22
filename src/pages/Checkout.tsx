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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  ShoppingBag, CreditCard, Smartphone, Banknote,
  ArrowLeft, Minus, Plus, Trash2, CheckCircle2, Lock, Sparkles, ShieldCheck,
  MapPin
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal, RevealItem } from "@/components/shared/Reveal";
import { trackEvent } from "@/lib/umami";

import { useRazorpayCheckout } from "@/hooks/useRazorpayCheckout";

// Razorpay handled by hook

const Checkout = () => {
  const { items, totalPrice, updateQuantity, removeFromCart, clearCart } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { initiatePayment } = useRazorpayCheckout();
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState("");
  const [form, setForm] = useState({
    name: "", phone: "", email: "", address: "", city: "", state: "", pincode: "",
  });
  const [isEditingAddress, setIsEditingAddress] = useState(true);

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
              if (profile.address && profile.city && profile.pincode && profile.full_name) {
                setIsEditingAddress(false);
              }
            }
          });
      }
    });
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
    console.log("1. Creating order in DB (pending)...");
    const dbOrderId = await insertOrder("pending");

    console.log("2. Initiating Razorpay Secure Checkout...");
    const cartItemsForPayment = items.map((item) => ({
      product_id: item.id,
      quantity: item.quantity,
      seller_id: item.supplier_id,
    }));

    const result = await initiatePayment(cartItemsForPayment, {
      name: form.name,
      email: form.email || userEmail,
      phone: form.phone,
    });

    if (result.success) {
      console.log("3. Payment successful!");
      sendConfirmationEmail(dbOrderId);
      // Let handleOrder redirect to success page
      return result;
    }
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

    trackEvent("checkout-start", { total: totalPrice, items: items.length });

    setIsSubmitting(true);

    try {
      if (paymentMethod === "cod") {
        await handleCOD();
        setIsSubmitting(false);
      } else {
        const result = await handleRazorpayPayment();
        clearCart();
        navigate(`/payment/success?payment_id=${result?.paymentId}`);
        setIsSubmitting(false);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "An unexpected error occurred.";
      if (message.includes("cancelled")) {
        toast({ title: "Payment Cancelled", description: "You cancelled the payment.", variant: "default" });
      } else {
        navigate(`/payment/failed?reason=${encodeURIComponent(message)}`);
      }
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
      <div className="min-h-screen bg-secondary/10 py-5 md:py-8">
        <div className="w-full px-2 sm:px-4 md:px-6">
          <div className="w-full">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6 md:mb-8">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Button variant="outline" className="bg-[var(--bg-surface)] hover:bg-[var(--bg-card)] border-[var(--border-subtle)] shadow-sm hover:shadow-md rounded-full font-bold text-[var(--text-primary)] transition-all group px-5 h-10" onClick={() => navigate(-1)}>
                  <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> Back
                </Button>
              </motion.div>
              <Reveal width="fit-content" direction="up">
                <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight m-0">Complete Your Order</h1>
              </Reveal>
            </div>

            <div className="grid lg:grid-cols-12 gap-6 sm:gap-10">
              {/* Left Column: Forms */}
              <div className="lg:col-span-7 space-y-6 sm:space-y-10">
                {/* 1. Shipping Details */}
                <Reveal width="100%" direction="up" delay={0.1}>
                  <Card className="bg-[#C5A572] dark:bg-[#1C2333] p-5 md:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.3)] border border-white/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-black/5 dark:bg-white/5 rounded-bl-[4rem] flex items-center justify-center border-l border-b border-black/10 dark:border-white/10">
                      <span className="font-mono text-[10px] rotate-90 tracking-[0.5em] opacity-20 text-black dark:text-white uppercase">Form_Asset</span>
                    </div>
                    <div className="flex items-center gap-4 mb-8 relative z-10 border-b border-black/10 dark:border-white/10 pb-6">
                      <div className="w-10 h-10 bg-white/20 dark:bg-black/20 rounded-xl flex items-center justify-center text-black dark:text-white shrink-0">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl font-bold tracking-tight text-black dark:text-white">Shipping Details</h2>
                    </div>
                    <CardContent className="p-0 relative z-10">
                      {!isEditingAddress ? (
                        <div className="bg-[#E5DACE] dark:bg-[#20293A] rounded-2xl p-4 sm:p-6 relative border border-transparent dark:border-white/10 shadow-sm">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            type="button"
                            className="absolute top-4 right-4 sm:top-6 sm:right-6 rounded-xl text-xs font-bold bg-white dark:bg-black/20 hover:bg-white/80"
                            onClick={() => setIsEditingAddress(true)}
                          >
                            Change
                          </Button>
                          <div className="space-y-1 pr-20">
                            <h3 className="font-black text-lg text-foreground mb-2">{form.name}</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">{form.address}</p>
                            <p className="text-muted-foreground text-sm font-bold">{form.city}, {form.state} - {form.pincode}</p>
                            <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/10 flex items-center gap-2 text-sm font-bold text-foreground">
                              <Smartphone className="w-4 h-4" /> {form.phone}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <form className="grid sm:grid-cols-2 gap-4 sm:gap-8" onSubmit={handleOrder}>
                        <RevealItem>
                          <div className="space-y-2 sm:space-y-3">
                            <Label htmlFor="name" className="text-[10px] uppercase font-mono tracking-widest text-black/60 dark:text-white/60 ml-1">Full Name</Label>
                            <Input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Required" required className="h-11 sm:h-14 w-full rounded-2xl bg-[#E5DACE] dark:bg-[#20293A] border-transparent focus:bg-white dark:focus:bg-[#2a364a] transition-all text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 shadow-sm px-5" />
                          </div>
                        </RevealItem>
                        <RevealItem>
                          <div className="space-y-2 sm:space-y-3">
                            <Label htmlFor="phone" className="text-[10px] uppercase font-mono tracking-widest text-black/60 dark:text-white/60 ml-1">Phone Number</Label>
                            <Input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} placeholder="+91 XXXX" required className="h-11 sm:h-14 w-full rounded-2xl bg-[#E5DACE] dark:bg-[#20293A] border-transparent focus:bg-white dark:focus:bg-[#2a364a] transition-all text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 shadow-sm px-5" />
                          </div>
                        </RevealItem>
                        <RevealItem>
                          <div className="space-y-2 sm:space-y-3">
                            <Label htmlFor="email" className="text-[10px] uppercase font-mono tracking-widest text-black/60 dark:text-white/60 ml-1">Email Address</Label>
                            <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="your@email.com" className="h-11 sm:h-14 w-full rounded-2xl bg-[#E5DACE] dark:bg-[#20293A] border-transparent focus:bg-white dark:focus:bg-[#2a364a] transition-all text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 shadow-sm px-5" />
                          </div>
                        </RevealItem>
                        <RevealItem>
                          <div className="space-y-2 sm:space-y-3">
                            <Label htmlFor="pincode" className="text-[10px] uppercase font-mono tracking-widest text-black/60 dark:text-white/60 ml-1">Pincode</Label>
                            <Input id="pincode" name="pincode" value={form.pincode} onChange={handleChange} placeholder="6-digit" required className="h-11 sm:h-14 w-full rounded-2xl bg-[#E5DACE] dark:bg-[#20293A] border-transparent focus:bg-white dark:focus:bg-[#2a364a] transition-all text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 shadow-sm px-5" />
                          </div>
                        </RevealItem>
                        <RevealItem className="sm:col-span-2">
                          <div className="space-y-2 sm:space-y-3">
                            <Label htmlFor="address" className="text-[10px] uppercase font-mono tracking-widest text-black/60 dark:text-white/60 ml-1">Complete Address</Label>
                            <Textarea id="address" name="address" value={form.address} onChange={handleChange} placeholder="House/Flat No., Street, Landmark..." required className="min-h-[80px] sm:min-h-[120px] py-3 sm:py-4 w-full rounded-2xl bg-[#E5DACE] dark:bg-[#20293A] border-transparent focus:bg-white dark:focus:bg-[#2a364a] transition-all text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 shadow-sm px-5 resize-y" />
                          </div>
                        </RevealItem>
                        <RevealItem>
                          <div className="space-y-2 sm:space-y-3">
                            <Label htmlFor="city" className="text-[10px] uppercase font-mono tracking-widest text-black/60 dark:text-white/60 ml-1">City</Label>
                            <Input id="city" name="city" value={form.city} onChange={handleChange} placeholder="City name" required className="h-11 sm:h-14 w-full rounded-2xl bg-[#E5DACE] dark:bg-[#20293A] border-transparent focus:bg-white dark:focus:bg-[#2a364a] transition-all text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 shadow-sm px-5" />
                          </div>
                        </RevealItem>
                        <RevealItem>
                          <div className="space-y-2 sm:space-y-3">
                            <Label htmlFor="state" className="text-[10px] uppercase font-mono tracking-widest text-black/60 dark:text-white/60 ml-1">State</Label>
                            <Input id="state" name="state" value={form.state} onChange={handleChange} placeholder="State name" className="h-11 sm:h-14 w-full rounded-2xl bg-[#E5DACE] dark:bg-[#20293A] border-transparent focus:bg-white dark:focus:bg-[#2a364a] transition-all text-black dark:text-white placeholder:text-black/40 dark:placeholder:text-white/40 shadow-sm px-5" />
                          </div>
                        </RevealItem>
                        <RevealItem className="sm:col-span-2 pt-2">
                          <Button 
                            type="button" 
                            className="w-full sm:w-auto h-12 px-8 rounded-2xl bg-black text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80 font-bold transition-colors shadow-sm"
                            onClick={() => {
                              if(form.name && form.phone && form.address && form.city && form.pincode) {
                                setIsEditingAddress(false);
                              } else {
                                toast({ title: "Incomplete Address", description: "Please fill all required fields.", variant: "destructive" });
                              }
                            }}
                          >
                            Save Address
                          </Button>
                        </RevealItem>
                      </form>
                      )}
                    </CardContent>
                  </Card>
                </Reveal>

                {/* 2. Cart Items Summary Box */}
                <Reveal width="100%" direction="up" delay={0.2}>
                  <Card className="bg-[#C5A572] dark:bg-[#1C2333] p-5 md:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.3)] border border-white/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-black/5 dark:bg-white/5 rounded-bl-[4rem] flex items-center justify-center border-l border-b border-black/10 dark:border-white/10">
                      <span className="font-mono text-[10px] rotate-90 tracking-[0.5em] opacity-20 text-black dark:text-white uppercase">Cart_Asset</span>
                    </div>
                    <div className="flex items-center justify-between gap-4 relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/20 dark:bg-black/20 rounded-xl flex items-center justify-center text-black dark:text-white shrink-0">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold tracking-tight text-black dark:text-white">Your Cart</h2>
                          <p className="text-sm font-medium text-black/60 dark:text-white/60 mt-1">{items.reduce((acc, item) => acc + item.quantity, 0)} Items • ₹{totalPrice.toLocaleString()}</p>
                        </div>
                      </div>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" className="border-black/20 dark:border-white/20 hover:bg-black/10 dark:hover:bg-white/10 text-xs font-bold rounded-xl h-10 px-4 text-black dark:text-white backdrop-blur-sm shadow-sm">
                            View / Edit
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] bg-[#C5A572] dark:bg-[#1C2333] border border-white/20 rounded-[2.5rem] p-6 shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
                          <DialogHeader>
                            <DialogTitle className="text-2xl font-black text-black dark:text-white flex items-center gap-2 mb-4">
                              <ShoppingBag className="w-6 h-6" /> Your Items
                            </DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                            {items.map((item) => (
                              <motion.div 
                                key={item.id} 
                                layout
                                className="flex gap-3 sm:gap-5 group bg-white/40 dark:bg-black/40 backdrop-blur-sm p-3 sm:p-4 rounded-[1.5rem] border border-white/30 dark:border-white/10"
                                whileHover={{ x: 5 }}
                              >
                                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-[1rem] sm:rounded-[1.25rem] bg-white overflow-hidden shrink-0 border border-black/10 dark:border-white/10">
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" loading="lazy" decoding="async" />
                                  <div className="absolute inset-0 bg-black/5" />
                                </div>
                                <div className="flex-1 py-1 flex flex-col justify-between min-w-0">
                                  <div>
                                    <p className="text-[10px] font-black uppercase text-black/60 dark:text-white/60 tracking-widest mb-1">{item.brand}</p>
                                    <p className="text-sm font-bold text-black dark:text-white line-clamp-1 leading-tight">{item.name}</p>
                                    <p className="text-[10px] font-medium text-black/60 dark:text-white/60 mt-1">{item.specs}</p>
                                  </div>
                                  <div className="flex items-center justify-between gap-2 mt-1">
                                    <div className="flex items-center gap-2 sm:gap-3 bg-white dark:bg-black rounded-full px-2 py-1 border border-black/10 dark:border-white/10 shrink-0">
                                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-black dark:text-white">
                                        <Minus className="w-3 h-3" />
                                      </button>
                                      <span className="w-4 text-center text-xs font-black text-black dark:text-white">{item.quantity}</span>
                                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors text-black dark:text-white">
                                        <Plus className="w-3 h-3" />
                                      </button>
                                    </div>
                                    <div className="flex flex-col items-end shrink-0">
                                      <span className="text-base sm:text-lg font-black text-black dark:text-white">₹{(item.price * item.quantity).toLocaleString()}</span>
                                      <button onClick={() => removeFromCart(item.id)} className="text-[10px] font-black uppercase tracking-tighter text-black/40 hover:text-red-500 dark:text-white/40 dark:hover:text-red-400 flex items-center gap-1 transition-colors">
                                        <Trash2 className="w-3 h-3" /> Remove
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </Card>
                </Reveal>

                {/* 3. Payment Selector */}
                <Reveal width="100%" direction="up" delay={0.3}>
                  <Card className="bg-[#C5A572] dark:bg-[#1C2333] p-5 md:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.3)] border border-white/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-black/5 dark:bg-white/5 rounded-bl-[4rem] flex items-center justify-center border-l border-b border-black/10 dark:border-white/10">
                      <span className="font-mono text-[10px] rotate-90 tracking-[0.5em] opacity-20 text-black dark:text-white uppercase">Pay_Asset</span>
                    </div>
                    <div className="flex flex-col gap-6 relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white/20 dark:bg-black/20 rounded-xl flex items-center justify-center text-black dark:text-white shrink-0">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold tracking-tight text-black dark:text-white">Payment Method</h2>
                      </div>
                      
                      <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {[
                          { value: "online", label: "Pay Online", sub: "UPI / Cards / Netbanking", icon: CreditCard },
                          { value: "cod", label: "Pay on Arrival", sub: "Cash / UPI", icon: Banknote },
                        ].map((method) => (
                          <label
                            key={method.value}
                            className={`flex items-center gap-4 p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                              paymentMethod === method.value
                                ? "border-black/50 dark:border-white/50 bg-white/50 dark:bg-black/40 shadow-sm"
                                : "border-transparent hover:bg-white/20 dark:hover:bg-black/20"
                            }`}
                          >
                            <RadioGroupItem value={method.value} className="border-black/50 dark:border-white/50" />
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${paymentMethod === method.value ? "bg-black dark:bg-white text-white dark:text-black" : "bg-black/10 dark:bg-white/10 text-black/60 dark:text-white/60"}`}>
                              <method.icon className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-black dark:text-white text-sm sm:text-base">{method.label}</span>
                              <span className="text-xs font-medium text-black/60 dark:text-white/60">{method.sub}</span>
                            </div>
                          </label>
                        ))}
                      </RadioGroup>
                    </div>
                  </Card>
                </Reveal>
              </div>

              {/* Right Column: Order Summary */}
              <div className="lg:col-span-5 space-y-6 sm:space-y-10">
                <Reveal width="100%" direction="left" distance={30} delay={0.3}>
                  <Card className="bg-[#C5A572] dark:bg-[#1C2333] p-5 md:p-8 rounded-[2rem] sm:rounded-[2.5rem] shadow-[0_40px_100px_rgba(0,0,0,0.3)] border border-white/20 relative overflow-hidden sticky top-24">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-black/5 dark:bg-white/5 rounded-bl-[4rem] flex items-center justify-center border-l border-b border-black/10 dark:border-white/10">
                      <span className="font-mono text-[10px] rotate-90 tracking-[0.5em] opacity-20 text-black dark:text-white uppercase">Order_Asset</span>
                    </div>
                    <div className="flex items-center gap-4 mb-8 relative z-10 border-b border-black/10 dark:border-white/10 pb-6">
                      <div className="w-10 h-10 bg-white/20 dark:bg-black/20 rounded-xl flex items-center justify-center text-black dark:text-white shrink-0">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <h2 className="text-xl font-bold tracking-tight text-black dark:text-white">Order Summary</h2>
                    </div>

                    <CardContent className="p-0 relative z-10 space-y-4 sm:space-y-6">
                      
                      {/* Coupon Box */}
                      <div className="bg-white/40 dark:bg-black/40 backdrop-blur-sm rounded-2xl p-4 border border-white/30 dark:border-white/10">
                        <p className="text-xs font-bold text-black/60 dark:text-white/60 uppercase tracking-widest mb-3">Have a Coupon?</p>
                        <div className="flex gap-2">
                          <Input placeholder="Enter Code" className="bg-white/50 dark:bg-black/50 border-white/20 dark:border-white/10 text-black dark:text-white placeholder:text-black/50 dark:placeholder:text-white/50 h-12 rounded-xl focus-visible:ring-black/20 dark:focus-visible:ring-white/20" />
                          <Button className="h-12 px-5 rounded-xl bg-black text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80 font-bold transition-colors">Apply</Button>
                        </div>
                      </div>

                      {/* Subtotals & Total Block */}
                      <div className="bg-white/40 dark:bg-black/40 backdrop-blur-sm rounded-2xl p-4 sm:p-6 border border-white/30 dark:border-white/10 text-black dark:text-white space-y-4">
                        <div className="flex justify-between items-center text-sm font-bold">
                          <span className="text-black/60 dark:text-white/60 uppercase tracking-widest">Bag Total</span>
                          <span>₹{totalPrice.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-bold">
                          <span className="text-black/60 dark:text-white/60 uppercase tracking-widest">Delivery Charge</span>
                          <div className="flex items-center gap-2">
                            <span className="text-black/40 dark:text-white/40 line-through">₹499</span>
                            <Badge className="bg-green-600 text-white hover:bg-green-700 border-none rounded-full">FREE</Badge>
                          </div>
                        </div>

                        <div className="pt-4 mt-4 border-t border-black/10 dark:border-white/10">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-xs font-black text-black/60 dark:text-white/60 uppercase tracking-[0.2em] mb-1">Total Payable</p>
                              <p className="text-3xl font-black text-black dark:text-white tracking-tighter">₹{totalPrice.toLocaleString()}</p>
                            </div>
                            <div className="bg-white dark:bg-black p-3 rounded-2xl border border-black/10 dark:border-white/10 shadow-sm">
                              <Sparkles className="w-6 h-6 text-black dark:text-white animate-pulse" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <AnimatePresence mode="wait">
                        {paymentMethod === "online" && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center gap-3 text-xs text-green-900 dark:text-green-200 bg-green-500/20 rounded-xl p-3 border border-green-500/30"
                          >
                            <ShieldCheck className="w-5 h-5 text-green-700 dark:text-green-400 shrink-0" />
                            <p className="leading-tight">
                              Your transaction is encrypted and secured by <strong className="text-black dark:text-white">Razorpay</strong>. No card details are ever shared with us.
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>

                        <Button
                          className="w-full h-14 sm:h-20 rounded-[1.5rem] font-black text-base sm:text-xl shadow-2xl shadow-primary/30 relative overflow-hidden group"
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
                    </CardContent>
                  </Card>
                </Reveal>
              </div>
            </div>
          </div>
        </div>
      </div>


    </Layout>
  );
};

export default Checkout;
