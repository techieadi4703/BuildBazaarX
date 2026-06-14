import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function PaymentFailed() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reason = searchParams.get("reason") ?? "Payment was not completed";

  return (
    <Layout>
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-background px-4 py-20">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md w-full bg-card rounded-3xl shadow-xl border border-border/50 p-8 text-center"
        >
          {/* Failure icon */}
          <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-100/50">
            <AlertCircle className="h-14 w-14 text-red-600" />
          </div>

          <h1 className="text-3xl font-black text-foreground mb-3 tracking-tight">Payment Failed</h1>
          <p className="text-muted-foreground mb-8 text-lg font-medium">
            {reason}
          </p>

          <div className="flex flex-col gap-3">
            <Button onClick={() => navigate(-1)} className="w-full h-14 rounded-2xl text-lg font-bold">
              Try Again
            </Button>
            <Button variant="outline" onClick={() => navigate("/checkout")} className="w-full h-14 rounded-2xl text-lg font-bold bg-white">
              Return to Checkout
            </Button>
            <Button variant="link" onClick={() => navigate("/contact")} className="mt-2 text-muted-foreground">
              Contact Support
            </Button>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
