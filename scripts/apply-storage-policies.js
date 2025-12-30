import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyStoragePolicies() {
  console.log('Applying storage policies to database...');
  console.log('Project:', supabaseUrl);
  console.log('');

  const policies = [
    {
      name: 'Authenticated users can upload files',
      sql: `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies
            WHERE schemaname = 'storage'
            AND tablename = 'objects'
            AND policyname = 'Authenticated users can upload files'
          ) THEN
            CREATE POLICY "Authenticated users can upload files"
            ON storage.objects
            FOR INSERT
            TO authenticated
            WITH CHECK (bucket_id = 'uploads');
          END IF;
        END $$;
      `
    },
    {
      name: 'Public can view uploaded files',
      sql: `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies
            WHERE schemaname = 'storage'
            AND tablename = 'objects'
            AND policyname = 'Public can view uploaded files'
          ) THEN
            CREATE POLICY "Public can view uploaded files"
            ON storage.objects
            FOR SELECT
            TO public
            USING (bucket_id = 'uploads');
          END IF;
        END $$;
      `
    },
    {
      name: 'Authenticated users can update their files',
      sql: `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies
            WHERE schemaname = 'storage'
            AND tablename = 'objects'
            AND policyname = 'Authenticated users can update their files'
          ) THEN
            CREATE POLICY "Authenticated users can update their files"
            ON storage.objects
            FOR UPDATE
            TO authenticated
            USING (bucket_id = 'uploads');
          END IF;
        END $$;
      `
    },
    {
      name: 'Authenticated users can delete their files',
      sql: `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM pg_policies
            WHERE schemaname = 'storage'
            AND tablename = 'objects'
            AND policyname = 'Authenticated users can delete their files'
          ) THEN
            CREATE POLICY "Authenticated users can delete their files"
            ON storage.objects
            FOR DELETE
            TO authenticated
            USING (bucket_id = 'uploads');
          END IF;
        END $$;
      `
    }
  ];

  for (const policy of policies) {
    console.log(`Applying policy: ${policy.name}...`);

    try {
      const { data, error } = await supabase.rpc('exec', {
        sql: policy.sql
      });

      if (error) {
        console.log(`  ⚠️  Could not apply via RPC (${error.message})`);
        console.log(`  ℹ️  Policy may need to be applied manually via Supabase Dashboard`);
      } else {
        console.log('  ✅ Applied successfully');
      }
    } catch (err) {
      console.log(`  ⚠️  Error: ${err.message}`);
      console.log(`  ℹ️  Policy may already exist or need manual application`);
    }
  }

  console.log('');
  console.log('✅ Storage policy application complete!');
  console.log('');
  console.log('If policies were not applied automatically, please:');
  console.log('1. Go to https://supabase.com/dashboard/project/xgeigainkrobwgwapego/sql/new');
  console.log('2. Run the SQL from: supabase/migrations/20251212010425_setup_storage_bucket.sql');
}

applyStoragePolicies();
