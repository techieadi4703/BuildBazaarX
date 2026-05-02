
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://iymwxolcoemdayahabou.supabase.co'
const supabaseKey = 'sb_publishable_1375glaHX0kiv6LpVZZ1uw_C90agsHl'
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkOrder() {
  const { data, error } = await supabase
    .from('orders')
    .select('id, total, status')
    
  if (error) {
    console.error(error)
    return
  }
  
  const order = data.find(o => o.id.startsWith('18d03b99'))
  console.log(order)
}

checkOrder()
