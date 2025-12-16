import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkDatabase() {
  try {
    const { data, error, count } = await supabase
      .from('opportunities')
      .select('*', { count: 'exact' })
      .limit(5);
    
    if (error) {
      console.log('Error:', error.message);
    } else {
      console.log('Total opportunities:', count);
      console.log('Sample data:', JSON.stringify(data, null, 2));
    }
  } catch (e) {
    console.log('Exception:', e.message);
  }
}

checkDatabase();
