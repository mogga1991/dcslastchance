require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.DATABASE_URL);

async function checkUserTable() {
  try {
    // Check user table structure
    const columns = await sql`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'user'
      ORDER BY ordinal_position
    `;

    console.log('📋 User table structure:');
    columns.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });

    // Check if there are any users
    const users = await sql`SELECT id, email, name, "createdAt" FROM "user" LIMIT 5`;
    console.log(`\n👥 Existing users: ${users.length}`);
    users.forEach(u => console.log(`  - ${u.email} (${u.name || 'no name'})`));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkUserTable();
