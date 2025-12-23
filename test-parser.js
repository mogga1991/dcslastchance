const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://clxqdctofuxqjjonvytm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNseHFkY3RvZnV4cWpqb252eXRtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTQ5Njg0MywiZXhwIjoyMDgxMDcyODQzfQ.rsFGPYgHdy4SjTjp-pL_0pZdM6s41xkodaAOZMwDCPk'
);

// Test parser (simulating TypeScript parseOpportunityRequirements)
function extractSquareFootage(description) {
  if (!description) return null;

  // Try range pattern first
  const rangeMatch = description.match(/(\d{1,3}(?:,\d{3})*)\s*(?:to|[-–])\s*(\d{1,3}(?:,\d{3})*)\s*(?:sq\.?\s*ft|SF|RSF|square feet)/i);
  if (rangeMatch) {
    const min = parseInt(rangeMatch[1].replace(/,/g, ''));
    const max = parseInt(rangeMatch[2].replace(/,/g, ''));
    return { min, max, target: Math.round((min + max) / 2) };
  }

  // Try single value patterns
  const pattern = /(\d{1,3}(?:,\d{3})*)\s*(?:sq\.?\s*ft|SF|RSF|square feet)/gi;
  const matches = [...description.matchAll(pattern)];
  const values = matches
    .map(m => parseInt(m[1].replace(/,/g, '')))
    .filter(v => v > 1000 && v < 1000000);

  if (values.length === 0) return null;

  const target = values[0];
  return {
    min: Math.round(target * 0.8),
    max: Math.round(target * 1.2),
    target,
  };
}

(async () => {
  try {
    const { data: opportunities, error } = await supabase
      .from('opportunities')
      .select('*')
      .limit(3);

    if (error) throw error;

    console.log('🧪 Testing Opportunity Parser\n');

    opportunities.forEach((opp, idx) => {
      console.log(`\n${idx + 1}. ${opp.solicitation_number}`);
      console.log(`   Title: ${opp.title}`);
      console.log(`   Description: ${opp.description.substring(0, 100)}...`);

      const sfData = extractSquareFootage(opp.description);
      if (sfData) {
        console.log(`   ✅ Square Footage: ${sfData.min.toLocaleString()} - ${sfData.max.toLocaleString()} SF (target: ${sfData.target.toLocaleString()})`);
      } else {
        console.log(`   ❌ Square Footage: Not found`);
      }

      console.log(`   📍 Location: ${opp.pop_city_name}, ${opp.pop_state_code}`);
      console.log(`   📅 Deadline: ${new Date(opp.response_deadline).toLocaleDateString()}`);
    });

    console.log('\n✅ Parser test complete!');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();
