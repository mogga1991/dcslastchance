-- Create uploads storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads',
  'uploads',
  true,
  52428800, -- 50MB
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow authenticated users to upload files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
    AND policyname = 'Authenticated users can upload files'
  ) THEN
    CREATE POLICY "Authenticated users can upload files"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'uploads'
    );
  END IF;
END $$;

-- Policy: Allow public read access to uploaded files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
    AND policyname = 'Public can view uploaded files'
  ) THEN
    CREATE POLICY "Public can view uploaded files"
    ON storage.objects
    FOR SELECT
    TO public
    USING (
      bucket_id = 'uploads'
    );
  END IF;
END $$;

-- Policy: Allow authenticated users to update their own files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
    AND policyname = 'Authenticated users can update their files'
  ) THEN
    CREATE POLICY "Authenticated users can update their files"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'uploads'
    );
  END IF;
END $$;

-- Policy: Allow authenticated users to delete their own files
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
    AND policyname = 'Authenticated users can delete their files'
  ) THEN
    CREATE POLICY "Authenticated users can delete their files"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'uploads'
    );
  END IF;
END $$;
