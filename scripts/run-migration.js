#!/usr/bin/env node
/**
 * Migration Runner - Applies SQL migrations to Neon database
 */

const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
require('dotenv').config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function runMigration(filename) {
  console.log(`📦 Reading migration: ${filename}`);
  
  const migrationSQL = fs.readFileSync(filename, 'utf8');
  
  // Split by $$ delimiters to preserve function bodies
  const parts = migrationSQL.split('$$');
  const statements = [];
  
  for (let i = 0; i < parts.length; i += 2) {
    // Even indices are outside functions
    const outsideParts = parts[i].split(';').map(s => s.trim()).filter(Boolean);
    statements.push(...outsideParts);
    
    // Odd indices are inside functions (if they exist)
    if (i + 1 < parts.length) {
      // Reconstruct the function with its delimiters
      let prevStatement = statements.pop() || '';
      const nextPart = parts[i + 2] ? parts[i + 2].split(';')[0] : '';
      statements.push(prevStatement + '$$' + parts[i + 1] + '$$' + nextPart);
      
      // Remove the used part from next iteration
      if (i + 2 < parts.length) {
        parts[i + 2] = parts[i + 2].substring(nextPart.length + 1);
      }
    }
  }
  
  console.log(`📋 Found ${statements.length} SQL statements`);
  console.log(`🚀 Executing migration...\n`);

  let successCount = 0;
  let failureCount = 0;

  for (const statement of statements) {
    if (!statement.trim()) continue;
    
    try {
      await sql.unsafe(statement);
      successCount++;
      
      // Log major operations
      if (statement.includes('CREATE TABLE')) {
        const match = statement.match(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?(\w+)/i);
        if (match) console.log(`  ✅ Created table: ${match[1]}`);
      } else if (statement.includes('CREATE OR REPLACE FUNCTION')) {
        const match = statement.match(/CREATE OR REPLACE FUNCTION\s+(\w+)/i);
        if (match) console.log(`  ✅ Created function: ${match[1]}()`);
      } else if (statement.includes('CREATE INDEX')) {
        const match = statement.match(/CREATE INDEX\s+(\w+)/i);
        if (match) console.log(`  ✅ Created index: ${match[1]}`);
      }
      
    } catch (error) {
      if (error.message.includes('already exists')) {
        successCount++;
      } else {
        console.error(`  ❌ Error:`, error.message.substring(0, 100));
        failureCount++;
      }
    }
  }

  console.log(`\n✅ Migration complete: ${successCount} success, ${failureCount} failed`);
  return failureCount === 0;
}

const filename = process.argv[2] || 'supabase/migrations/20251216000000_create_fedspace_tables.sql';

runMigration(filename)
  .then(success => process.exit(success ? 0 : 1))
  .catch(error => {
    console.error('\n💥 Fatal error:', error);
    process.exit(1);
  });
