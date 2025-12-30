-- Storage policies for uploads bucket

-- Policy: Allow authenticated users to upload files
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

-- Policy: Allow public read access
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

-- Policy: Allow authenticated users to update
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

-- Policy: Allow authenticated users to delete
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
