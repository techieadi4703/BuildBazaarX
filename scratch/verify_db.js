import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTable(tableName, columns) {
  const { data, error } = await supabase.from(tableName).select(columns.join(',')).limit(1);
  if (error) {
    console.log(`[Error] Failed to fetch from ${tableName}:`, error.message);
  } else {
    console.log(`[Success] Table ${tableName} and required columns exist.`);
  }
}

async function run() {
  console.log("Checking PRE-DEPLOYMENT VALIDATION 1 & 4...");
  await checkTable('orders', ['razorpay_order_id', 'payment_id', 'status', 'total', 'user_id']);
  
  console.log("\nChecking PRE-DEPLOYMENT VALIDATION 2 (Profile Trigger)...");
  console.log("Note: Supabase JS client cannot directly inspect database triggers. This must be verified in the Supabase Dashboard, or using a raw SQL connection.");
}

run();
