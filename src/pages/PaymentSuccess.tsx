import React, { useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const paymentId = searchParams.get("payment_id");

  useEffect(() => {
    // Auto-redirect to orders page after 5 seconds
    const timer = setTimeout(() => navigate("/orders"), 5000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Layout>
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-background px-4 py-20">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-card rounded-3xl shadow-xl border border-border/50 p-8 text-center"
        >
          {/* Success icon */}
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-100/50">
            <CheckCircle2 className="h-14 w-14 text-green-600" />
          </div>

          <h1 className="text-3xl font-black text-foreground mb-3 tracking-tight">Payment Successful!</h1>
          <p className="text-muted-foreground mb-6 text-lg">
            Your order has been placed and is being processed.
          </p>

          {paymentId && (
            <div className="bg-secondary/50 rounded-xl py-3 px-4 mb-8 text-left border border-border/50">
              <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Payment ID</p>
              <p className="text-sm font-mono text-foreground font-medium">{paymentId}</p>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Button onClick={() => navigate("/orders")} className="w-full h-14 rounded-2xl text-lg font-bold">
              View My Orders
            </Button>
            <Button variant="outline" onClick={() => navigate("/")} className="w-full h-14 rounded-2xl text-lg font-bold bg-white">
              Continue Shopping
            </Button>
          </div>

          <p className="text-xs font-medium text-muted-foreground mt-6 uppercase tracking-widest">
            Redirecting to orders in 5 seconds...
          </p>
        </motion.div>
      </div>
    </Layout>
  );
}
