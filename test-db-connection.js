const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://clxqdctofuxqjjonvytm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNseHFkY3RvZnV4cWpqb252eXRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQ5Njg0MywiZXhwIjoyMDgxMDcyODQzfQ.rsFGPYgHdy4SjTjp-pL_0pZdM6s41xkodaAOZMwDCPk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('broker_listings')
      .select('*')
      .limit(1);

    if (error) {
      console.log('Error accessing broker_listings:', error.message);
    } else {
      console.log('Successfully connected to Supabase!');
      console.log('Number of records:', data.length);
      if (data.length > 0) {
        console.log('Sample columns:', Object.keys(data[0]));
      }
    }
  } catch (err) {
    console.error('Connection error:', err);
  }
}

testConnection();
