-- Create avatars storage bucket for user profile pictures
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  1048576, -- 1MB limit for profile pictures
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Allow authenticated users to upload their own avatar
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
    AND policyname = 'Users can upload their own avatar'
  ) THEN
    CREATE POLICY "Users can upload their own avatar"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
      bucket_id = 'avatars' AND
      (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;
END $$;

-- Policy: Allow public read access to all avatars
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
    AND policyname = 'Public can view avatars'
  ) THEN
    CREATE POLICY "Public can view avatars"
    ON storage.objects
    FOR SELECT
    TO public
    USING (
      bucket_id = 'avatars'
    );
  END IF;
END $$;

-- Policy: Allow users to update their own avatar
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
    AND policyname = 'Users can update their own avatar'
  ) THEN
    CREATE POLICY "Users can update their own avatar"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
      bucket_id = 'avatars' AND
      (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;
END $$;

-- Policy: Allow users to delete their own avatar
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'objects'
    AND policyname = 'Users can delete their own avatar'
  ) THEN
    CREATE POLICY "Users can delete their own avatar"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
      bucket_id = 'avatars' AND
      (storage.foldername(name))[1] = auth.uid()::text
    );
  END IF;
END $$;
