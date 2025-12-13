require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function testConnection() {
  try {
    console.log('Testing database connection...');
    const result = await sql`SELECT current_database(), current_user, version()`;
    console.log('✅ Database connected successfully!');
    console.log('Database:', result[0].current_database);
    console.log('User:', result[0].current_user);
    
    // Check if user table exists
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;
    
    console.log('\n📊 Tables in database:');
    tables.forEach(t => console.log('  -', t.table_name));
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
