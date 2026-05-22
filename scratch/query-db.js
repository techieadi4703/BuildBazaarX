const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env
dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Supabase URL or Key is missing from environment variables.");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, count, error } = await supabase
    .from('supplier_products')
    .select('*', { count: 'exact' });

  if (error) {
    console.error("Error fetching supplier products:", error);
    return;
  }

  console.log(`Total supplier products in DB: ${count}`);
  console.log("Products:");
  data.forEach((p, idx) => {
    console.log(`${idx + 1}. ID: ${p.id}, Name: ${p.name}, Category: ${p.category}, Published: ${p.is_published}`);
  });
}

main();
