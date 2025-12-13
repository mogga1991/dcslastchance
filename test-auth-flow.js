const { createClient } = require('@supabase/supabase-js');

// Use environment variables
const supabaseUrl = 'https://clxqdctofuxqjjonvytm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNseHFkY3RvZnV4cWpqb252eXRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0OTY4NDMsImV4cCI6MjA4MTA3Mjg0M30.q1ZImJx4NnkZiXG3m-_cFlRPHbiGtPHU_qJHEBUYN5g';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 Testing Supabase Auth Flow\n');
console.log('='.repeat(50));

async function testAuthFlow() {
  // Test 1: Check Supabase connection
  console.log('\n1️⃣ Testing Supabase connection...');
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('❌ Session check error:', error.message);
    } else {
      console.log('✅ Connection successful!');
      console.log('Current session:', data.session ? 'Logged in' : 'Not logged in');
    }
  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    return;
  }

  // Test 2: Try to sign up
  console.log('\n2️⃣ Testing email/password signup...');
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';
  const testName = 'Test User';

  console.log('Test credentials:');
  console.log('  Email:', testEmail);
  console.log('  Password:', testPassword);
  console.log('  Name:', testName);

  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        data: {
          name: testName
        }
      }
    });

    console.log('\nSignup response:');
    console.log('  Error:', error);
    console.log('  User:', data.user ? {
      id: data.user.id,
      email: data.user.email,
      created_at: data.user.created_at
    } : null);
    console.log('  Session:', data.session ? 'Created' : 'Not created');

    if (error) {
      console.error('\n❌ Signup failed:', error.message);
      console.error('Error details:', JSON.stringify(error, null, 2));
    } else if (data.user) {
      console.log('\n✅ Signup successful!');
      console.log('User ID:', data.user.id);

      // Check if email confirmation is required
      if (!data.session) {
        console.log('\n⚠️ Email confirmation required (session not created)');
        console.log('This means email confirmation is ENABLED in Supabase');
      } else {
        console.log('\n✅ Session created immediately (email confirmation disabled)');
      }
    }
  } catch (err) {
    console.error('\n❌ Unexpected error:', err);
    console.error('Stack:', err.stack);
  }

  // Test 3: Check Google OAuth setup
  console.log('\n3️⃣ Checking Google OAuth configuration...');
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'http://localhost:3003/auth/callback',
        skipBrowserRedirect: true
      }
    });

    if (error) {
      console.error('❌ Google OAuth error:', error.message);
    } else {
      console.log('✅ Google OAuth configured!');
      console.log('OAuth URL:', data.url ? 'Generated' : 'Not generated');
    }
  } catch (err) {
    console.error('❌ OAuth test failed:', err.message);
  }

  console.log('\n' + '='.repeat(50));
  console.log('Test complete!\n');
}

testAuthFlow();
