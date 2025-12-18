/**
 * Migration Script: Neon → Supabase
 *
 * This script migrates all property listings from Neon database to Supabase.
 * Run with: node migrate-neon-to-supabase.js
 */

import { createClient } from '@supabase/supabase-js'
import pg from 'pg'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const { Pool } = pg

// Neon connection
const neonPool = new Pool({
  connectionString: process.env.DATABASE_URL
})

// Supabase connection - use service role key to bypass RLS
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function migrate() {
  console.log('🚀 Starting migration from Neon to Supabase...\n')

  try {
    // 1. Fetch all properties from Neon
    console.log('📥 Fetching properties from Neon...')
    const { rows: neonProperties } = await neonPool.query('SELECT * FROM property ORDER BY "createdAt" DESC')
    console.log(`   Found ${neonProperties.length} properties in Neon\n`)

    if (neonProperties.length === 0) {
      console.log('❌ No properties found in Neon. Exiting.')
      return
    }

    // 2. Show sample property
    console.log('📋 Sample property from Neon:')
    console.log(`   ${neonProperties[0].property_name || neonProperties[0].address}`)
    console.log(`   ${neonProperties[0].city}, ${neonProperties[0].state}`)
    console.log(`   ${neonProperties[0].available_sf.toLocaleString()} SF available\n`)

    // 3. Check current Supabase count
    const { count: beforeCount } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })
    console.log(`📊 Current properties in Supabase: ${beforeCount || 0}\n`)

    // 4. Transform and insert data
    console.log('🔄 Transforming and inserting properties...')

    const transformedProperties = neonProperties.map(prop => ({
      id: prop.id,
      broker_id: prop.broker_id,
      address: prop.address,
      city: prop.city,
      state: prop.state,
      zip: prop.zip,
      latitude: prop.latitude,
      longitude: prop.longitude,
      property_name: prop.property_name,
      building_class: prop.building_class,
      year_built: prop.year_built,
      year_renovated: prop.year_renovated,
      total_floors: prop.total_floors,
      available_floors: prop.available_floors,
      total_sf: prop.total_sf,
      available_sf: prop.available_sf,
      min_divisible_sf: prop.min_divisible_sf,
      max_contiguous_sf: prop.max_contiguous_sf,
      column_spacing_ft: prop.column_spacing_ft,
      parking_spaces: prop.parking_spaces,
      parking_type: prop.parking_type,
      parking_ratio: prop.parking_ratio,
      has_loading_dock: prop.has_loading_dock,
      has_backup_power: prop.has_backup_power,
      has_raised_floor: prop.has_raised_floor,
      fiber_providers: prop.fiber_providers,
      energy_star_certified: prop.energy_star_certified,
      energy_star_score: prop.energy_star_score,
      leed_certified: prop.leed_certified,
      leed_level: prop.leed_level,
      max_security_level: prop.max_security_level,
      scif_capable: prop.scif_capable,
      asking_rent_per_sf: prop.asking_rent_per_sf,
      cam_per_sf: prop.cam_per_sf,
      ti_allowance_per_sf: prop.ti_allowance_per_sf,
      available_date: prop.available_date,
      lease_term_min_years: prop.lease_term_min_years,
      lease_term_max_years: prop.lease_term_max_years,
      status: prop.status,
      images: prop.images,
      floor_plans: prop.floor_plans,
      brochure_url: prop.brochure_url,
      created_at: prop.createdAt,
      updated_at: prop.updatedAt
    }))

    // Insert in batches of 10 to avoid rate limits
    const batchSize = 10
    let inserted = 0
    let errors = 0

    for (let i = 0; i < transformedProperties.length; i += batchSize) {
      const batch = transformedProperties.slice(i, i + batchSize)

      const { data, error } = await supabase
        .from('properties')
        .upsert(batch, { onConflict: 'id' })

      if (error) {
        console.error(`   ❌ Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error.message)
        errors += batch.length
      } else {
        inserted += batch.length
        console.log(`   ✅ Inserted batch ${Math.floor(i/batchSize) + 1} (${batch.length} properties)`)
      }
    }

    // 5. Verify migration
    const { count: afterCount } = await supabase
      .from('properties')
      .select('*', { count: 'exact', head: true })

    console.log(`\n📊 Migration Summary:`)
    console.log(`   Properties in Neon: ${neonProperties.length}`)
    console.log(`   Successfully inserted: ${inserted}`)
    console.log(`   Errors: ${errors}`)
    console.log(`   Final Supabase count: ${afterCount || 0}`)

    if (afterCount >= neonProperties.length) {
      console.log(`\n✅ Migration completed successfully!`)
    } else {
      console.log(`\n⚠️  Migration incomplete. Some properties may not have transferred.`)
    }

  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await neonPool.end()
  }
}

// Run migration
migrate()
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Fatal error:', error)
    process.exit(1)
  })
