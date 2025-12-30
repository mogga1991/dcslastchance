-- Enhance opportunity_documents table for automated PDF processing
-- Adds section metadata, cost tracking, and batch processing support

-- Add new columns to existing table
ALTER TABLE public.opportunity_documents
  ADD COLUMN IF NOT EXISTS section_metadata JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS processing_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS embedding_cost_usd DECIMAL(10,4) DEFAULT 0.0000,
  ADD COLUMN IF NOT EXISTS processing_batch_id TEXT,
  ADD COLUMN IF NOT EXISTS retry_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS document_structure JSONB DEFAULT '{}';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_opportunity_documents_batch_id
  ON public.opportunity_documents(processing_batch_id);

CREATE INDEX IF NOT EXISTS idx_opportunity_documents_retry_count
  ON public.opportunity_documents(retry_count);

-- Composite index for batch processing queries
CREATE INDEX IF NOT EXISTS idx_opportunity_documents_processing_status_retry
  ON public.opportunity_documents(processing_status, retry_count)
  WHERE processing_status IN ('pending', 'failed');

-- Helper function: Check if an opportunity needs PDF processing
CREATE OR REPLACE FUNCTION needs_pdf_processing(p_notice_id TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  v_has_pdfs BOOLEAN;
  v_all_processed BOOLEAN;
BEGIN
  -- Check if opportunity has PDF resource links
  SELECT EXISTS (
    SELECT 1
    FROM public.opportunities
    WHERE notice_id = p_notice_id
      AND full_data->'resourceLinks' IS NOT NULL
      AND jsonb_array_length(full_data->'resourceLinks') > 0
  ) INTO v_has_pdfs;

  -- If no PDFs, doesn't need processing
  IF NOT v_has_pdfs THEN
    RETURN FALSE;
  END IF;

  -- Check if all documents are processed
  SELECT NOT EXISTS (
    SELECT 1
    FROM public.opportunity_documents
    WHERE opportunity_id = p_notice_id
      AND processing_status IN ('pending', 'processing')
      AND retry_count < 3
  ) INTO v_all_processed;

  -- Needs processing if has PDFs and not all are processed
  RETURN NOT v_all_processed;
END;
$$;

-- Function to get next batch of opportunities for processing
CREATE OR REPLACE FUNCTION get_pending_opportunities_batch(p_limit INTEGER DEFAULT 5)
RETURNS TABLE (
  notice_id TEXT,
  title TEXT,
  resource_links JSONB,
  document_count INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    o.notice_id,
    o.title,
    o.full_data->'resourceLinks' as resource_links,
    (SELECT COUNT(*)
     FROM public.opportunity_documents od
     WHERE od.opportunity_id = o.notice_id) as document_count
  FROM public.opportunities o
  WHERE
    -- Has PDF resource links
    o.full_data->'resourceLinks' IS NOT NULL
    AND jsonb_array_length(o.full_data->'resourceLinks') > 0
    -- Either no documents processed yet, or has pending/failed documents
    AND (
      NOT EXISTS (
        SELECT 1
        FROM public.opportunity_documents od
        WHERE od.opportunity_id = o.notice_id
      )
      OR EXISTS (
        SELECT 1
        FROM public.opportunity_documents od
        WHERE od.opportunity_id = o.notice_id
          AND od.processing_status IN ('pending', 'failed')
          AND od.retry_count < 3
      )
    )
    -- Only process recent opportunities (within last 180 days)
    AND o.response_deadline >= NOW() - INTERVAL '180 days'
  ORDER BY o.response_deadline ASC  -- Process urgent ones first
  LIMIT p_limit;
END;
$$;

-- Function to mark opportunity as processing
CREATE OR REPLACE FUNCTION mark_opportunity_processing(
  p_opportunity_id TEXT,
  p_batch_id TEXT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.opportunity_documents
  SET
    processing_status = 'processing',
    processing_started_at = NOW(),
    processing_batch_id = p_batch_id,
    updated_at = NOW()
  WHERE opportunity_id = p_opportunity_id
    AND processing_status IN ('pending', 'failed');

  -- If no rows updated, opportunity might not have documents yet
  -- This is handled by the processing API which creates the records
END;
$$;

-- Function to mark opportunity as completed
CREATE OR REPLACE FUNCTION mark_opportunity_completed(
  p_opportunity_id TEXT,
  p_cost DECIMAL(10,4) DEFAULT 0.0000,
  p_section_metadata JSONB DEFAULT '{}'
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.opportunity_documents
  SET
    processing_status = 'completed',
    processed_at = NOW(),
    embedding_cost_usd = p_cost,
    section_metadata = p_section_metadata,
    retry_count = 0,  -- Reset retry count on success
    updated_at = NOW()
  WHERE opportunity_id = p_opportunity_id
    AND processing_status = 'processing';
END;
$$;

-- Function to mark opportunity as failed
CREATE OR REPLACE FUNCTION mark_opportunity_failed(
  p_opportunity_id TEXT,
  p_error TEXT
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.opportunity_documents
  SET
    processing_status = CASE
      WHEN retry_count < 2 THEN 'pending'  -- Retry
      ELSE 'failed'                         -- Give up
    END,
    retry_count = retry_count + 1,
    processing_error = p_error,
    updated_at = NOW()
  WHERE opportunity_id = p_opportunity_id
    AND processing_status = 'processing';
END;
$$;

-- Add comments for documentation
COMMENT ON COLUMN public.opportunity_documents.section_metadata IS
  'Detected document sections (Requirements, Evaluation Criteria, etc.) with page numbers';

COMMENT ON COLUMN public.opportunity_documents.processing_batch_id IS
  'Batch ID for tracking which cron job batch processed this document';

COMMENT ON COLUMN public.opportunity_documents.retry_count IS
  'Number of processing attempts (max 3 before marking as failed)';

COMMENT ON COLUMN public.opportunity_documents.embedding_cost_usd IS
  'Cost in USD for generating embeddings (OpenAI API cost)';

COMMENT ON COLUMN public.opportunity_documents.document_structure IS
  'Full document structure analysis from Claude/regex (cached)';

COMMENT ON FUNCTION needs_pdf_processing(TEXT) IS
  'Returns true if opportunity has PDFs that need processing';

COMMENT ON FUNCTION get_pending_opportunities_batch(INTEGER) IS
  'Returns next batch of opportunities that need PDF processing, ordered by urgency';

COMMENT ON FUNCTION mark_opportunity_processing(TEXT, TEXT) IS
  'Marks opportunity documents as currently being processed';

COMMENT ON FUNCTION mark_opportunity_completed(TEXT, DECIMAL, JSONB) IS
  'Marks opportunity processing as completed with cost and section metadata';

COMMENT ON FUNCTION mark_opportunity_failed(TEXT, TEXT) IS
  'Marks opportunity processing as failed and increments retry counter';
