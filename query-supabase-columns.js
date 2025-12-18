/**
 * Query Supabase to get actual column names
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function queryColumns() {
  console.log('Querying Supabase for properties table columns...\n')

  // Query information_schema to get column details
  const { data, error } = await supabase
    .rpc('exec_sql', {
      query: `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'properties'
        ORDER BY ordinal_position;
      `
    })

  if (error) {
    console.log('RPC error (expected if function doesn\'t exist):', error.message)
    console.log('\nTrying direct query instead...')

    // Try a simple query to list tables
    const { data: tables, error: tablesError } = await supabase
      .from('properties')
      .select('*')
      .limit(0)

    if (tablesError) {
      console.log('Error:', tablesError.message)
    }
  } else {
    console.log('Columns in properties table:')
    data.forEach(col => {
      console.log(`  ${col.column_name} (${col.data_type}) ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`)
    })
  }
}

queryColumns()
