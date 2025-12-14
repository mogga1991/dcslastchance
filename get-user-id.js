require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getUserId() {
  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error('Error:', error);
    return;
  }

  if (data.users.length > 0) {
    console.log('Found user:', data.users[0].email);
    console.log('User ID:', data.users[0].id);
    return data.users[0].id;
  } else {
    console.log('No users found');
  }
}

getUserId();
