// Quick test to create a user account
// Run: node test-create-user.js

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function createTestUser() {
  const email = 'test@contractor.com';
  const password = 'TestPassword123!';

  console.log('Creating test user...');
  console.log('Email:', email);
  console.log('Password:', password);

  const { data, error } = await supabase.auth.admin.createUser({
    email: email,
    password: password,
    email_confirm: true, // Auto-confirm email
    user_metadata: {
      full_name: 'Test Contractor',
      name: 'Test Contractor',
    },
  });

  if (error) {
    console.error('Error creating user:', error);
    return;
  }

  console.log('\n✅ User created successfully!');
  console.log('\nYou can now sign in with:');
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('\nGo to: http://localhost:3001/sign-in');
}

createTestUser();
