/**
 * Check Supabase properties table schema
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkSchema() {
  console.log('Checking Supabase properties table schema...\n')

  // Try to get one row to see the columns
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .limit(1)

  if (error) {
    console.log('Error:', error.message)
  } else {
    if (data && data.length > 0) {
      console.log('Columns in Supabase properties table:')
      Object.keys(data[0]).forEach(col => console.log(`  - ${col}`))
    } else {
      console.log('Table exists but is empty.')
      console.log('Trying to insert a test row to discover schema...')

      // Try inserting a minimal row
      const { error: insertError } = await supabase
        .from('properties')
        .insert([{
          address: 'Test',
          city: 'Test',
          state: 'TX',
          total_sf: 1000,
          available_sf: 1000
        }])

      if (insertError) {
        console.log('Insert error:', insertError.message)
        console.log('Details:', insertError.details)
        console.log('Hint:', insertError.hint)
      }
    }
  }
}

checkSchema()
