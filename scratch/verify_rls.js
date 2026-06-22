import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

// Using ANON key to test RLS
const supabaseAnon = createClient(
  process.env.SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

async function checkRLS() {
  console.log("Testing RLS on 'orders' table...");
  const { data: ordersData, error: ordersError } = await supabaseAnon.from('orders').select('*').limit(5);
  
  if (ordersError) {
    console.log("[Orders RLS] Error:", ordersError.message);
  } else {
    if (ordersData.length > 0) {
      console.log("[Orders RLS] WARNING: Retrieved", ordersData.length, "orders using anon key. RLS might be disabled or policy is too permissive.");
    } else {
      console.log("[Orders RLS] PASS: Returned 0 orders for anon user. RLS appears to be active.");
    }
  }

  console.log("Testing RLS on 'profiles' table...");
  const { data: profilesData, error: profilesError } = await supabaseAnon.from('profiles').select('*').limit(5);
  
  if (profilesError) {
    console.log("[Profiles RLS] Error:", profilesError.message);
  } else {
    if (profilesData.length > 0) {
      console.log("[Profiles RLS] WARNING: Retrieved", profilesData.length, "profiles using anon key. RLS might be disabled or policy is too permissive.");
    } else {
      console.log("[Profiles RLS] PASS: Returned 0 profiles for anon user. RLS appears to be active.");
    }
  }
}

checkRLS();
