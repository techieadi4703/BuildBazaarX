import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window.Razorpay !== "undefined") return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function useRazorpayCheckout() {
  const initiatePayment = useCallback(
    async (
      cartItems: { product_id: string | number; quantity: number; seller_id?: string }[],
      customerDetails: { name: string; email: string; phone: string }
    ) => {
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error("Failed to load Razorpay SDK");

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Please log in to continue");

      // Step 1: Create order server-side via Edge Function
      const { data: createData, error: createError } = await supabase.functions.invoke("create-razorpay-order", {
        body: { cartItems },
      });

      if (createError) {
        throw new Error(createError.message || "Failed to create order");
      }
      if (createData.error) {
        throw new Error(createData.error);
      }

      const { orderId, amount, currency, keyId } = createData;

      return new Promise<{ success: boolean; paymentId?: string }>((resolve, reject) => {
        const options = {
          key: keyId || import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount,
          currency,
          name: "BuildBazaarX",
          description: "Order Payment",
          order_id: orderId,
          handler: async (response: {
            razorpay_order_id: string;
            razorpay_payment_id: string;
            razorpay_signature: string;
          }) => {
            // Step 2: Verify payment server-side via Edge Function
            try {
              const { data: verifyData, error: verifyError } = await supabase.functions.invoke("process-payment", {
                body: { ...response },
              });

              if (verifyError || verifyData?.error) {
                reject(new Error(verifyError?.message || verifyData?.error || "Payment verification failed"));
              } else {
                resolve({ success: true, paymentId: response.razorpay_payment_id });
              }
            } catch (e) {
              reject(e);
            }
          },
          prefill: {
            name: customerDetails.name,
            email: customerDetails.email || session.user.email,
            contact: customerDetails.phone,
          },
          theme: { color: "#D4AF37" },
          modal: {
            ondismiss: () => reject(new Error("Payment cancelled by user")),
          },
        };

        const rzp = new window.Razorpay(options);

        rzp.on("payment.failed", (response: any) => {
          reject(new Error(response.error?.description || "Payment failed"));
        });

        rzp.open();
      });
    },
    []
  );

  return { initiatePayment };
}
