-- Create opportunity_documents table to track PDF processing
-- Vectors are stored in Pinecone, this table stores metadata only

CREATE TABLE IF NOT EXISTS public.opportunity_documents (
  id TEXT PRIMARY KEY,
  opportunity_id TEXT NOT NULL,
  url TEXT NOT NULL,
  title TEXT,
  page_count INTEGER,
  chunk_count INTEGER,
  processing_status TEXT NOT NULL DEFAULT 'pending',
  processing_error TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX idx_opportunity_documents_opportunity_id
  ON public.opportunity_documents(opportunity_id);

CREATE INDEX idx_opportunity_documents_status
  ON public.opportunity_documents(processing_status);

-- Enable RLS
ALTER TABLE public.opportunity_documents ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can view documents for any opportunity
-- (More restrictive policies can be added later based on org membership)
CREATE POLICY "Users can view all opportunity documents"
  ON public.opportunity_documents
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- RLS Policy: Authenticated users can insert/update documents
-- (In production, you may want to restrict this to service role only)
CREATE POLICY "Service role can manage documents"
  ON public.opportunity_documents
  FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_opportunity_documents_updated_at
  BEFORE UPDATE ON public.opportunity_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE public.opportunity_documents IS
  'Tracks PDF documents processed for GSA opportunities. Vectors stored in Pinecone.';

COMMENT ON COLUMN public.opportunity_documents.processing_status IS
  'Status: pending, processing, completed, failed';
