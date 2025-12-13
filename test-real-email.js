const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://clxqdctofuxqjjonvytm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNseHFkY3RvZnV4cWpqb252eXRtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0OTY4NDMsImV4cCI6MjA4MTA3Mjg0M30.q1ZImJx4NnkZiXG3m-_cFlRPHbiGtPHU_qJHEBUYN5g';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWithRealEmail() {
  console.log('Testing with real email domain (gmail.com)...\n');

  // Try with a gmail address
  const testEmail = `georgemogga1@gmail.com`;
  const testPassword = 'TestPassword123!';

  console.log('Attempting signup with:', testEmail);

  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: {
        name: 'George Mogga'
      }
    }
  });

  if (error) {
    console.error('❌ Error:', error.message);
    console.error('Error code:', error.code);
    console.error('Error status:', error.status);
  } else {
    console.log('✅ Success!');
    console.log('User:', data.user ? data.user.id : 'No user');
    console.log('Session:', data.session ? 'Created' : 'No session (email confirmation may be enabled)');
  }
}

testWithRealEmail();
