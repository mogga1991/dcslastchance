const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkTables() {
  const { data, error } = await supabase.rpc('exec_sql', {
    sql_query: `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%org%'
      ORDER BY table_name;
    `
  });

  if (error) {
    console.log('Trying alternative query method...');
    const { data: tables, error: err2 } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .like('table_name', '%org%');
      
    console.log('Tables:', tables);
    console.log('Error:', err2);
  } else {
    console.log('Tables:', data);
  }
}

checkTables();
