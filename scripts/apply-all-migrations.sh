#!/bin/bash

# Apply all FedSpace migrations to new Supabase project
# Usage: bash scripts/apply-all-migrations.sh

SUPABASE_URL="https://xgeigainkrobwgwapego.supabase.co"
SQL_EDITOR_URL="https://supabase.com/dashboard/project/xgeigainkrobwgwapego/sql/new"

echo "════════════════════════════════════════════════════════════════"
echo "  FedSpace Database Migration Script"
echo "════════════════════════════════════════════════════════════════"
echo ""
echo "This script will guide you through applying all migrations"
echo "to your new Supabase project."
echo ""
echo "Project URL: $SUPABASE_URL"
echo ""
echo "────────────────────────────────────────────────────────────────"
echo ""

# List of migration files in order
MIGRATIONS=(
  "20251214150000_create_broker_listings.sql"
  "20251214140000_create_company_profiles.sql"
  "20251214130000_create_saved_opportunities.sql"
  "20251214141000_create_opportunity_inquiries.sql"
  "20251216000000_create_fedspace_tables.sql"
  "20251220000000_create_property_matches.sql"
  "20251223000000_create_cache_cleanup_function.sql"
  "20251227000000_create_opportunity_chat_history.sql"
)

echo "📋 Migrations to apply (${#MIGRATIONS[@]} files):"
echo ""
for migration in "${MIGRATIONS[@]}"; do
  echo "  ✓ $migration"
done
echo ""
echo "────────────────────────────────────────────────────────────────"
echo ""
echo "INSTRUCTIONS:"
echo ""
echo "1. Open the Supabase SQL Editor:"
echo "   $SQL_EDITOR_URL"
echo ""
echo "2. For each migration below, copy the SQL and run it:"
echo ""

# Combine all migrations
COMBINED_FILE="supabase/migrations/combined_migration.sql"
> "$COMBINED_FILE"  # Clear file

echo "-- Combined FedSpace Migrations" >> "$COMBINED_FILE"
echo "-- Generated: $(date)" >> "$COMBINED_FILE"
echo "" >> "$COMBINED_FILE"

for migration in "${MIGRATIONS[@]}"; do
  MIGRATION_PATH="supabase/migrations/$migration"

  if [ -f "$MIGRATION_PATH" ]; then
    echo "-- ═══════════════════════════════════════════════════════════" >> "$COMBINED_FILE"
    echo "-- Migration: $migration" >> "$COMBINED_FILE"
    echo "-- ═══════════════════════════════════════════════════════════" >> "$COMBINED_FILE"
    echo "" >> "$COMBINED_FILE"
    cat "$MIGRATION_PATH" >> "$COMBINED_FILE"
    echo "" >> "$COMBINED_FILE"
    echo "" >> "$COMBINED_FILE"
  else
    echo "⚠️  Warning: Migration file not found: $MIGRATION_PATH"
  fi
done

echo "✅ Combined migration file created: $COMBINED_FILE"
echo ""
echo "────────────────────────────────────────────────────────────────"
echo ""
echo "📝 NEXT STEPS:"
echo ""
echo "  1. Open: $SQL_EDITOR_URL"
echo "  2. Copy the contents of: $COMBINED_FILE"
echo "  3. Paste into SQL Editor and click 'Run'"
echo ""
echo "────────────────────────────────────────────────────────────────"
echo ""
echo "Or run this command to view the SQL:"
echo ""
echo "  cat $COMBINED_FILE"
echo ""
