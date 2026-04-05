import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Package, Calendar, MapPin, IndianRupee, ArrowRight, ArrowLeft } from "lucide-react";
import { format } from "date-fns";

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
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your orders...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumb / Back Navigation */}
          <Link
            to="/profile"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Package className="w-8 h-8 text-primary" />
              My Orders
            </h1>
            <Badge variant="secondary" className="w-fit text-sm">
              {orders.length} {orders.length === 1 ? 'Order' : 'Orders'} Total
            </Badge>
          </div>

          {orders.length === 0 ? (
            <Card className="text-center py-16 border-dashed">
              <CardContent>
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No orders found</h3>
                <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                  Looks like you haven't placed any orders yet. Start exploring our designs and materials!
                </p>
                <Button asChild>
                  <Link to="/materials">
                    Shop Raw Materials
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const parsedItems = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                const itemsList = Array.isArray(parsedItems) ? parsedItems : [];
                const parsedAddress = typeof order.delivery_address === 'string' ? JSON.parse(order.delivery_address) : order.delivery_address;

                return (
                  <Card key={order.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="bg-secondary/50 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-muted-foreground">Order ID:</span>
                          <span className="font-mono text-sm">{order.id.slice(0, 8).toUpperCase()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(order.created_at), "MMM dd, yyyy 'at' hh:mm a")}
                        </div>
                      </div>
                      
                      <Badge 
                        variant={
                          order.status === 'completed' ? 'default' :
                          order.status === 'pending' ? 'secondary' :
                          order.status === 'cancelled' ? 'destructive' : 'outline'
                        }
                        className="w-fit capitalize"
                      >
                        {order.status}
                      </Badge>
                    </div>

                    <CardContent className="p-6">
                      <div className="grid md:grid-cols-[2fr,1fr] gap-8">
                        {/* Items Section */}
                        <div className="space-y-4">
                          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Items</h4>
                          <div className="space-y-4">
                            {itemsList.map((item: any, idx: number) => (
                              <div key={idx} className="flex gap-4 items-start">
                                <div className="w-16 h-16 rounded-md bg-secondary overflow-hidden shrink-0 border">
                                  {item.image ? (
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <Package className="w-8 h-8 m-4 text-muted-foreground/50" />
                                  )}
                                </div>
                                <div className="flex-1 space-y-1">
                                  <h5 className="font-medium line-clamp-1">{item.name}</h5>
                                  <p className="text-xs tracking-wider text-muted-foreground uppercase">{item.brand}</p>
                                  <div className="flex items-center justify-between mt-2">
                                    <div className="text-sm">
                                      Qty: <span className="font-medium">{item.quantity}</span>
                                    </div>
                                    <div className="font-medium">
                                      ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Order Details Column */}
                        <div className="space-y-6 md:border-l pl-0 md:pl-8">
                          {/* Shipping */}
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Delivery To</h4>
                            <div className="text-sm space-y-1 bg-secondary/30 p-3 rounded-lg border">
                              <p className="font-medium">{parsedAddress?.name || "N/A"}</p>
                              <div className="flex items-start gap-1.5 text-muted-foreground mt-1">
                                <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                                <p className="leading-tight">
                                  {parsedAddress?.address}<br/>
                                  {parsedAddress?.city}, {parsedAddress?.state} {parsedAddress?.pincode}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Summary */}
                          <div className="space-y-2">
                            <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Order Summary</h4>
                            <div className="flex items-center justify-between text-lg font-bold">
                              <span>Total Amount</span>
                              <span className="text-primary">
                                ₹{(order.total || 0).toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Orders;
