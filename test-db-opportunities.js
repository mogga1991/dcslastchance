import postgres from 'postgres';

const sql = postgres(process.env.DATABASE_URL);

async function checkOpportunities() {
  try {
    // Check if table exists
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'opportunities'
    `;
    
    console.log('Table exists:', tables.length > 0);
    
    if (tables.length > 0) {
      // Count opportunities
      const count = await sql`SELECT COUNT(*) as count FROM opportunities`;
      console.log('Total opportunities:', count[0].count);
      
      // Get sample
      const sample = await sql`
        SELECT id, source, title, agency, posted_date, due_date, status
        FROM opportunities 
        ORDER BY posted_date DESC 
        LIMIT 5
      `;
      console.log('\nSample opportunities:', JSON.stringify(sample, null, 2));
    }
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await sql.end();
  }
}

checkOpportunities();
