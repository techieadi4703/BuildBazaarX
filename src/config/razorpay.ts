export const getRazorpayConfig = () => {
  const isProd = import.meta.env.PROD;
  
  // Use production key if in production mode, otherwise use test key
  // Ideally, define VITE_RAZORPAY_KEY_ID_LIVE and VITE_RAZORPAY_KEY_ID_TEST in .env
  const key = isProd 
    ? (import.meta.env.VITE_RAZORPAY_KEY_ID_LIVE || import.meta.env.VITE_RAZORPAY_KEY_ID) 
    : (import.meta.env.VITE_RAZORPAY_KEY_ID_TEST || import.meta.env.VITE_RAZORPAY_KEY_ID);

  if (!key) {
    console.warn("Razorpay Key ID is not configured properly in environment variables.");
  }

  return {
    key,
    theme: { color: "#E8A317" } // Using the primary brand color from the project
  };
};
