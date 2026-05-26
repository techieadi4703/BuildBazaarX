// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// In-memory cache & rate limiting (Note: clears on isolate restart)
const cache = new Map<string, { valid: boolean; name?: string; timestamp: number }>();
const rateLimits = new Map<string, { count: number; windowStart: number }>();

const RATE_LIMIT_WINDOW_MS = 60000; // 1 minute
const MAX_CALLS_PER_MIN = 5;
const CACHE_TTL_MS = 600000; // 10 minutes

const PSP_HANDLES = new Set([
  "airtel", "airtelpay", "amazon", "apl", "axl", "barodampay", "dbs", "fbl", 
  "freecharge", "hdfcbank", "ibl", "icici", "idfcbank", "jupiteraxis", "kbl", 
  "kotak", "okaxis", "okhdfcbank", "okicici", "oksbi", "paytm", "postbank", 
  "ptaxis", "pthdfc", "ptsbi", "ptyes", "rapl", "sbi", "superyes", "unionbank", 
  "upi", "yapl", "ybl"
]);

const UPI_REGEX = /^([a-zA-Z0-9._-]{2,256})@([a-zA-Z][a-zA-Z0-9]{1,64})$/;

function validateUpiFormat(upi: string) {
  if (!upi) return { valid: false, reason: "Empty input" };
  const trimmed = upi.trim().toLowerCase();
  const match = trimmed.match(UPI_REGEX);
  
  if (!match) return { valid: false, reason: "Invalid format" };
  
  const [, username, handle] = match;
  if (!PSP_HANDLES.has(handle)) {
    return { valid: false, reason: `@${handle} is not recognized` };
  }
  return { valid: true };
}

async function hashString(str: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method Not Allowed" }), { 
        status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // Rate Limiting by IP (fallback to a default if header is missing)
    const ip = req.headers.get("x-forwarded-for") || "unknown-ip";
    const now = Date.now();
    let rlRecord = rateLimits.get(ip);
    
    if (!rlRecord || now - rlRecord.windowStart > RATE_LIMIT_WINDOW_MS) {
      rlRecord = { count: 0, windowStart: now };
    }
    
    if (rlRecord.count >= MAX_CALLS_PER_MIN) {
      return new Response(JSON.stringify({ error: "Too Many Requests" }), { 
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }
    
    rlRecord.count++;
    rateLimits.set(ip, rlRecord);

    // Parse Body
    const body = await req.json();
    const { upi } = body;

    if (!upi || typeof upi !== "string") {
      return new Response(JSON.stringify({ error: "Missing or invalid 'upi' field" }), { 
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    const hashedUpi = await hashString(upi);
    console.log(`[UPI Verify] Attempting to verify VPA hash: ${hashedUpi}`);

    // Layer 1 Validation on Server
    const formatCheck = validateUpiFormat(upi);
    if (!formatCheck.valid) {
      console.log(`[UPI Verify] Failed Layer 1: ${formatCheck.reason}`);
      return new Response(JSON.stringify({ valid: false, reason: formatCheck.reason }), { 
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // Check Cache
    const cachedResult = cache.get(upi);
    if (cachedResult && now - cachedResult.timestamp < CACHE_TTL_MS) {
      console.log(`[UPI Verify] Serving from cache for hash: ${hashedUpi}`);
      return new Response(JSON.stringify({ valid: cachedResult.valid, name: cachedResult.name }), { 
        status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    // Identify Aggregator from Env
    const razorpayKey = Deno.env.get("RAZORPAY_KEY_ID");
    const cashfreeAppId = Deno.env.get("CASHFREE_APP_ID");
    const payuKey = Deno.env.get("PAYU_KEY");
    const paytmMid = Deno.env.get("PAYTM_MID");

    let result = { valid: false, name: "", reason: "" };

    // TODO: Implement actual aggregator logic using fetch().
    // For now, if no keys are provided, we mock the success response.
    if (!razorpayKey && !cashfreeAppId && !payuKey && !paytmMid) {
      console.log(`[UPI Verify] No aggregator keys found. Mocking successful response for hash: ${hashedUpi}`);
      
      // MOCK LOGIC: We assume any well-formed UPI (that passed Layer 1) is valid in the mock
      // Except one specific test case to simulate a Layer 2 failure
      if (upi.startsWith("nonexistent999999@")) {
         result = { valid: false, name: "", reason: "VPA does not exist" };
      } else {
         result = { valid: true, name: "TEST USER", reason: "" };
      }
    } else {
      // If we had keys, we would call the aggregator API here.
      console.log(`[UPI Verify] Aggregator keys found. Calling aggregator API... (mocking success)`);
      result = { valid: true, name: "VERIFIED USER", reason: "" };
    }

    // Store in Cache
    cache.set(upi, { ...result, timestamp: now });

    return new Response(JSON.stringify(result), { 
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });

  } catch (err: any) {
    console.error("Error processing UPI verification:", err);
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }
});
