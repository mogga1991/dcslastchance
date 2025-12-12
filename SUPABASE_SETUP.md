# Supabase Setup - Complete

Supabase CLI has been successfully configured for this project. Below is a summary of what was set up and how to use it.

## What Was Configured

### 1. Supabase CLI Installation & Linking
- ✅ Supabase CLI v2.47.2 installed and verified
- ✅ Project linked to remote Supabase instance: `ologic` (clxqdctofuxqjjonvytm)
- ✅ Migrations pulled from remote database

### 2. Storage Bucket Setup
- ✅ Created `uploads` storage bucket with the following configuration:
  - **Public Access**: Enabled
  - **File Size Limit**: 50MB
  - **Allowed MIME Types**: image/jpeg, image/png, image/gif, image/webp, image/svg+xml

### 3. Security Policies (Row Level Security)
- ✅ Authenticated users can upload files to the `uploads` bucket
- ✅ Public read access to all uploaded files
- ✅ Authenticated users can update/delete their own files

### 4. TypeScript Types
- ✅ Generated TypeScript types from database schema
- ✅ Saved to: `lib/supabase-types.ts`

### 5. Environment Variables
- ✅ Created `.env.local` with Supabase credentials:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `SUPABASE_ACCESS_TOKEN` (for CLI operations)

### 6. Client Utilities
- ✅ Created `lib/supabase.ts` with:
  - `supabase`: Client-side instance (uses anon key)
  - `supabaseAdmin`: Server-side instance (uses service role key)
- ✅ Updated `lib/upload-image.ts` to use the new client utilities

---

## Project Structure

```
dcslasttry/
├── supabase/
│   ├── config.toml                              # Supabase CLI configuration
│   └── migrations/
│       ├── 20251212005935_remote_schema.sql     # Initial remote schema
│       └── 20251212010425_setup_storage_bucket.sql # Storage bucket setup
├── lib/
│   ├── supabase.ts                              # Supabase client utilities
│   ├── supabase-types.ts                        # Auto-generated TypeScript types
│   └── upload-image.ts                          # Image upload helper (updated)
└── .env.local                                   # Environment variables (gitignored)
```

---

## Common Supabase CLI Commands

### Database Operations

```bash
# Pull latest schema from remote
supabase db pull

# Push local migrations to remote
supabase db push

# Create a new migration
supabase migration new <migration_name>

# List migrations
supabase migration list

# Reset local database (requires local instance)
supabase db reset
```

### TypeScript Types

```bash
# Generate TypeScript types from remote database
supabase gen types typescript --linked > lib/supabase-types.ts
```

### Storage Operations

```bash
# List buckets (requires --experimental flag)
supabase storage ls --experimental --linked

# Note: For storage operations, it's easier to use the Supabase dashboard:
# https://supabase.com/dashboard/project/clxqdctofuxqjjonvytm/storage/buckets
```

### Project Info

```bash
# List all projects
supabase projects list

# Get API keys
supabase projects api-keys --project-ref clxqdctofuxqjjonvytm
```

---

## Usage Examples

### Client-Side Upload (Browser)

```typescript
import { supabase } from "@/lib/supabase";

async function uploadFile(file: File) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(fileName, file);

  if (error) throw error;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('uploads')
    .getPublicUrl(fileName);

  return publicUrl;
}
```

### Server-Side Upload (API Route)

```typescript
import { supabaseAdmin } from "@/lib/supabase";

// In your API route
export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${Date.now()}_${file.name}`;

  const { data, error } = await supabaseAdmin.storage
    .from('uploads')
    .upload(fileName, buffer);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const { data: { publicUrl } } = supabaseAdmin.storage
    .from('uploads')
    .getPublicUrl(fileName);

  return Response.json({ url: publicUrl });
}
```

---

## Important Notes

### Environment Variables
- **Never commit** `.env.local` to git
- The `.env.example` file shows what variables are needed
- `SUPABASE_ACCESS_TOKEN` is only needed for CLI operations, not for runtime

### Security
- **Client-side** (`supabase`): Uses anon key, respects RLS policies
- **Server-side** (`supabaseAdmin`): Uses service role key, bypasses RLS - use carefully!

### Storage Bucket Access
- Files in the `uploads` bucket are **publicly accessible**
- Anyone with the URL can view uploaded files
- Authenticated users can upload/modify/delete files
- Consider adding user-specific paths like `{userId}/{fileName}` for better organization

---

## Supabase Dashboard

Access your Supabase project dashboard:
- **URL**: https://supabase.com/dashboard/project/clxqdctofuxqjjonvytm
- **Storage**: https://supabase.com/dashboard/project/clxqdctofuxqjjonvytm/storage/buckets/uploads

---

## Next Steps

### If You Need Database Tables

Create a new migration:
```bash
supabase migration new create_tables
```

Then edit the migration file to add your tables, e.g.:
```sql
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Add policies
CREATE POLICY "Anyone can read posts" ON posts
  FOR SELECT USING (true);
```

Push to remote:
```bash
supabase db push
```

Regenerate types:
```bash
supabase gen types typescript --linked > lib/supabase-types.ts
```

### If You Need Authentication

Supabase has built-in authentication. Update your `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://clxqdctofuxqjjonvytm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Then use in your app:
```typescript
import { supabase } from "@/lib/supabase";

// Sign up
await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password'
});

// Sign in
await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// Get current user
const { data: { user } } = await supabase.auth.getUser();
```

---

## Troubleshooting

### CLI Commands Fail with "Access token not provided"
Export the token before running commands:
```bash
export SUPABASE_ACCESS_TOKEN=sbp_e006194037d8ae8051892dd89915bd627ad37861
```

Or add it to your shell profile (~/.bashrc, ~/.zshrc):
```bash
echo 'export SUPABASE_ACCESS_TOKEN=sbp_e006194037d8ae8051892dd89915bd627ad37861' >> ~/.zshrc
```

### Types Not Updating
After making schema changes, regenerate types:
```bash
supabase gen types typescript --linked > lib/supabase-types.ts
```

### Storage Upload Fails
Check:
1. Bucket exists: Visit dashboard or run migration again
2. File size is under 50MB
3. MIME type is in allowed list (images only)
4. User is authenticated (for upload/update/delete operations)

---

## Support

- **Supabase Docs**: https://supabase.com/docs
- **CLI Reference**: https://supabase.com/docs/reference/cli
- **Storage Docs**: https://supabase.com/docs/guides/storage
- **Auth Docs**: https://supabase.com/docs/guides/auth

---

✅ **Setup Complete!** Your Supabase integration is ready to use.
