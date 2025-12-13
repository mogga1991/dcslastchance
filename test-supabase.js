const { createClient } = require('@supabase/supabase-js');

// Test Supabase connection
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://clxqdctofuxqjjonvytm.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNseHFkY3RvZnV4cWpqb252eXRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0OTY4NDMsImV4cCI6MjA4MTA3Mjg0M30.q1ZImJx4NnkZiXG3m-_cFlRPHbiGtPHU_qJHEBUYN5g';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);
console.log('Key (first 20 chars):', supabaseKey.substring(0, 20) + '...');

async function testConnection() {
  try {
    // Test basic connection
    const { data, error } = await supabase.from('users').select('count').limit(1);

    if (error) {
      console.error('❌ Connection error:', error.message);
    } else {
      console.log('✅ Connection successful!');
    }

    // Test auth signup with a test email
    console.log('\nTesting auth.signUp...');
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'test-' + Date.now() + '@example.com',
      password: 'testpassword123',
      options: {
        data: {
          name: 'Test User'
        }
      }
    });

    if (authError) {
      console.error('❌ Auth error:', authError.message);
    } else {
      console.log('✅ Auth signup successful!');
      console.log('User ID:', authData.user?.id);
    }

  } catch (err) {
    console.error('❌ Unexpected error:', err);
  }
}

testConnection();
