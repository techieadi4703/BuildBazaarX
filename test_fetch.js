import { createClient } from '@supabase/supabase-js';

const supabase = createClient('https://iymwxolcoemdayahabou.supabase.co', 'sb_publishable_1375glaHX0kiv6LpVZZ1uw_C90agsHl');

async function run() {
  const { data, error } = await supabase
    .from("orders")
    .select("*, profiles(full_name, phone, email)")
    .order("created_at", { ascending: false });
  console.log("Data:", data, "Error:", error);
}
run();
