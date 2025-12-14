-- Create storage bucket for capability documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('capability-documents', 'capability-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the bucket
CREATE POLICY "Users can upload their own capability documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'capability-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own capability documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'capability-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can update their own capability documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'capability-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own capability documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'capability-documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
