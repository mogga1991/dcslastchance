// ============================================================================
// Database Migration Runner
// ============================================================================

import { query, shutdown } from '../lib/db';
import fs from 'fs';
import path from 'path';

async function runMigrations() {
  console.log('🔄 Running database migrations...\n');

  try {
    // Read migration file
    const migrationPath = path.join(__dirname, '../../migrations/001_initial_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Execute migration
    await query(migrationSQL);

    console.log('✅ Migration completed successfully!\n');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await shutdown();
  }
}

runMigrations();
