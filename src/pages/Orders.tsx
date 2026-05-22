import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Package, Calendar, MapPin, ArrowRight, ArrowLeft, ShoppingBag } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { Reveal, RevealItem } from "@/components/shared/Reveal";

export const Orders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate("/auth");
          return;
        }

        const { data, error } = await supabase
          .from("orders")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setOrders(data || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [navigate]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
            }}
          >
            <Loader2 className="w-12 h-12 text-primary" />
          </motion.div>
          <p className="text-xl font-medium text-muted-foreground animate-pulse">Retrieving your order history...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-transparent py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto">
            {/* Header Area */}
            <div className="mb-12">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-8"
              >
                <Link
                  to="/profile"
                  className="inline-flex items-center text-sm font-bold text-foreground/70 hover:text-primary transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full glass flex items-center justify-center mr-3 group-hover:bg-primary group-hover:text-primary-foreground transition-all shadow-sm">
                    <ArrowLeft className="w-4 h-4" />
                  </div>
                  Back to Profile
                </Link>
              </motion.div>

              <Reveal width="100%" direction="up">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight flex items-center gap-4 mb-4 text-foreground">
                      <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-primary-foreground shadow-xl shadow-primary/20">
                        <ShoppingBag className="w-8 h-8" />
                      </div>
                      My Orders
                    </h1>
                    <p className="text-muted-foreground text-lg font-medium">Track and manage your purchases</p>
                  </div>
                  <Badge variant="outline" className="w-fit h-10 px-6 rounded-full text-base font-bold glass-chip border-white/20 text-primary">
                    {orders.length} {orders.length === 1 ? 'Order' : 'Orders'} Total
                  </Badge>
                </div>
              </Reveal>
            </div>

            <AnimatePresence mode="wait">
              {orders.length === 0 ? (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <Card className="text-center py-24 glass-panel border-dashed border-2 border-white/20 shadow-2xl">
                    <CardContent>
                      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
                        <Package className="w-12 h-12 text-primary" />
                      </div>
                      <h3 className="text-3xl font-black mb-4 tracking-tight text-foreground">No orders yet</h3>
                      <p className="text-muted-foreground mb-10 max-w-sm mx-auto text-lg leading-relaxed">
                        Start building your dream home today. Explore our curated collections of designs and premium materials.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button asChild size="lg" className="rounded-2xl px-8 h-14 text-lg font-bold shadow-xl">
                          <Link to="/materials">
                            Shop Materials
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="rounded-2xl px-8 h-14 text-lg font-bold border-2">
                          <Link to="/designs">
                            Browse Designs
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                <Reveal width="100%" staggerChildren={0.1}>
                  <div className="space-y-10">
                    {orders.map((order) => {
                      const parsedItems = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                      const itemsList = Array.isArray(parsedItems) ? parsedItems : [];
                      const parsedAddress = typeof order.delivery_address === 'string' ? JSON.parse(order.delivery_address) : order.delivery_address;

                      return (
                        <RevealItem key={order.id}>
                          <motion.div
                            whileHover={{ y: -5 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Card className="overflow-hidden glass-panel border border-white/20 hover:shadow-[var(--glass-shadow-lg)] transition-all duration-300">
                              {/* Order Header Card */}
                              <div className="bg-white/10 dark:bg-white/5 px-8 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/20">
                                <div className="flex flex-wrap gap-x-10 gap-y-4">
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Order Reference</p>
                                    <p className="font-mono text-sm font-bold bg-white/10 dark:bg-black/20 px-3 py-1 rounded-lg border border-white/25 shadow-sm text-foreground">
                                      #{order.id.slice(0, 8).toUpperCase()}
                                    </p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Placed On</p>
                                    <div className="flex items-center gap-2 font-bold text-sm text-foreground">
                                      <Calendar className="w-4 h-4 text-primary" />
                                      {format(new Date(order.created_at), "MMM dd, yyyy")}
                                    </div>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Status</p>
                                    <Badge 
                                      className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider text-white ${
                                        order.status === 'completed' ? 'bg-green-600 hover:bg-green-700' :
                                        order.status === 'pending' ? 'bg-amber-600 hover:bg-amber-700' :
                                        order.status === 'cancelled' ? 'bg-destructive hover:bg-destructive' : 'bg-primary'
                                      }`}
                                    >
                                      {order.status}
                                    </Badge>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">Total Amount</p>
                                  <p className="text-2xl font-black text-foreground tracking-tight">₹{(order.total || 0).toLocaleString("en-IN")}</p>
                                </div>
                              </div>

                              <CardContent className="p-8">
                                <div className="grid md:grid-cols-[1.5fr,1fr] gap-12">
                                  {/* Items Section */}
                                  <div className="space-y-6">
                                    <h4 className="text-xs font-black text-foreground uppercase tracking-[0.25em] flex items-center gap-2">
                                      <ShoppingBag className="w-4 h-4" />
                                      Ordered Items
                                    </h4>
                                    <div className="space-y-6">
                                      {itemsList.map((item: any, idx: number) => (
                                        <motion.div 
                                          key={idx} 
                                          className="flex gap-6 items-center p-4 rounded-3xl bg-white/5 dark:bg-black/10 border border-transparent hover:border-white/10 hover:bg-white/10 transition-all group/item"
                                          whileHover={{ x: 5 }}
                                        >
                                          <div className="w-20 h-20 rounded-2xl bg-white/10 dark:bg-black/20 overflow-hidden shrink-0 border border-white/20 shadow-sm group-hover/item:border-primary/30 transition-all">
                                            {item.image ? (
                                              <img src={item.image} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110" />
                                            ) : (
                                              <div className="w-full h-full flex items-center justify-center bg-white/5">
                                                <Package className="w-10 h-10 text-muted-foreground/30" />
                                              </div>
                                            )}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.15em] mb-1">{item.brand}</p>
                                            <h5 className="font-bold text-lg text-foreground line-clamp-1 mb-2">{item.name}</h5>
                                            <div className="flex items-center justify-between">
                                              <Badge variant="outline" className="rounded-full px-3 py-0.5 border-white/20 bg-white/10 text-foreground text-xs font-bold">
                                                Qty: {item.quantity}
                                              </Badge>
                                              <div className="font-black text-lg text-foreground">
                                                ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                                              </div>
                                            </div>
                                          </div>
                                        </motion.div>
                                      ))}
                                    </div>
                                  </div>

                                  {/* Order Details Column */}
                                  <div className="space-y-8 md:border-l border-white/10 pl-0 md:pl-10">
                                    {/* Shipping */}
                                    <div className="space-y-4">
                                      <h4 className="text-xs font-black text-muted-foreground uppercase tracking-[0.25em] flex items-center gap-2">
                                        <MapPin className="w-4 h-4" />
                                        Delivery Address
                                      </h4>
                                      <div className="bg-white/5 dark:bg-black/10 p-6 rounded-[2rem] border border-white/10 relative overflow-hidden group/addr">
                                        <p className="font-black text-foreground text-lg mb-4">{parsedAddress?.name || "Customer"}</p>
                                        <div className="space-y-1.5 text-foreground/80 text-sm font-semibold leading-relaxed">
                                          <p>{parsedAddress?.address}</p>
                                          <p className="font-bold text-foreground">
                                            {parsedAddress?.city}, {parsedAddress?.state} {parsedAddress?.pincode}
                                          </p>
                                        </div>
                                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/addr:opacity-20 transition-opacity">
                                          <MapPin className="w-12 h-12 text-foreground" />
                                        </div>
                                      </div>
                                    </div>

                                    {/* Need Help */}
                                    <div className="p-6 rounded-[2rem] bg-primary/10 border border-primary/20">
                                      <p className="text-sm font-bold text-primary mb-2">Need help with this order?</p>
                                      <p className="text-xs text-foreground/80 mb-4">Questions about delivery, quality, or returns?</p>
                                      <Button variant="link" className="p-0 h-auto font-black text-xs uppercase tracking-widest group">
                                        Contact Support
                                        <ArrowRight className="w-3 h-3 ml-2 group-hover:translate-x-1 transition-transform" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        </RevealItem>
                      );
                    })}
                  </div>
                </Reveal>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Orders;
