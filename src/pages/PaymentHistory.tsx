import React, { useEffect, useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Loader2, Receipt } from "lucide-react";
import { motion } from "framer-motion";

interface Payment {
  id: string;
  razorpay_order_id: string;
  payment_id: string | null;
  total: number;
  status: string;
  created_at: string;
  cart_snapshot: any[];
}

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-green-100 text-green-800 border-green-200",
  created: "bg-yellow-100 text-yellow-800 border-yellow-200",
  failed: "bg-red-100 text-red-800 border-red-200",
  refunded: "bg-blue-100 text-blue-800 border-blue-200",
};

export default function PaymentHistory() {
  const { userId } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    
    supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setPayments(data as Payment[]);
        setLoading(false);
      });
  }, [userId]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-20 max-w-4xl min-h-[70vh]">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <Receipt className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight">Payment History</h1>
            <p className="text-muted-foreground font-medium mt-1">View your past transactions and invoices</p>
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="bg-card border border-border/50 rounded-3xl p-12 text-center shadow-sm">
            <Receipt className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-xl font-bold text-foreground">No payments found</p>
            <p className="text-muted-foreground mt-2">You haven't made any transactions yet.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {payments.map((p, index) => (
              <motion.div 
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card rounded-2xl border border-border/50 p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-2xl font-black text-primary">
                      ₹{(p.total / 100).toLocaleString("en-IN")}
                    </p>
                    <p className="text-sm font-semibold text-muted-foreground mt-1">
                      {format(new Date(p.created_at), "dd MMM yyyy, hh:mm a")}
                    </p>
                  </div>
                  <Badge variant="outline" className={`px-3 py-1.5 text-xs font-black uppercase tracking-widest rounded-full ${STATUS_STYLES[p.status] ?? "bg-gray-100 text-gray-800"}`}>
                    {p.status}
                  </Badge>
                </div>

                <div className="bg-secondary/30 rounded-xl p-4 mb-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Items Ordered</p>
                  <ul className="space-y-2">
                    {p.cart_snapshot?.map((item, i) => (
                      <li key={i} className="flex justify-between text-sm font-medium">
                        <span className="truncate pr-4 text-foreground/80">{item.name}</span>
                        <span className="shrink-0 font-bold">× {item.quantity}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-xs text-muted-foreground font-mono">
                  <div>
                    <span className="font-bold text-foreground/50 uppercase mr-2 tracking-widest">Order ID</span>
                    <span className="bg-secondary px-2 py-1 rounded-md">{p.razorpay_order_id}</span>
                  </div>
                  {p.payment_id && (
                    <div>
                      <span className="font-bold text-foreground/50 uppercase mr-2 tracking-widest">Payment ID</span>
                      <span className="bg-secondary px-2 py-1 rounded-md">{p.payment_id}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
