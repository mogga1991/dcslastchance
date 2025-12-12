import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const sql = neon(process.env.DATABASE_URL);

async function testConnection() {
  console.log("🔍 Testing Neon Database Connection...\n");

  try {
    // Test basic connection
    console.log("1️⃣ Testing basic connection...");
    const timeResult = await sql`SELECT NOW() as current_time`;
    console.log("✅ Connection successful!");
    console.log("   Server time:", timeResult[0].current_time);

    // Check if tables exist
    console.log("\n2️⃣ Checking database tables...");
    const tables = await sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `;

    if (tables.length === 0) {
      console.log("⚠️  No tables found in database");
      console.log("   You may need to run database migrations");
    } else {
      console.log("✅ Found tables:");
      tables.forEach((table) => {
        console.log(`   - ${table.table_name}`);
      });
    }

    // Test specific tables we need
    console.log("\n3️⃣ Checking required tables...");
    const requiredTables = [
      "company_profile",
      "analysis",
      "credit_transaction",
    ];

    for (const tableName of requiredTables) {
      const exists = tables.find((t) => t.table_name === tableName);
      if (exists) {
        console.log(`   ✅ ${tableName}`);
      } else {
        console.log(`   ❌ ${tableName} - MISSING!`);
      }
    }

    console.log("\n✅ Database test completed successfully!");
  } catch (error) {
    console.error("\n❌ Database connection failed:");
    console.error("   Error:", error.message);
    console.error("\n💡 Tips:");
    console.error("   1. Check your DATABASE_URL in .env.local");
    console.error("   2. Verify your Neon project is active");
    console.error("   3. Ensure database tables are created");
    process.exit(1);
  }
}

testConnection();
