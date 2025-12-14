-- ============================================================================
-- Link Properties to Organizations
-- Adds foreign key after both tables exist
-- ============================================================================

-- Add foreign key constraint from properties to orgs
ALTER TABLE public.properties
  ADD CONSTRAINT properties_organization_id_fkey
  FOREIGN KEY (organization_id)
  REFERENCES public.orgs(id)
  ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_properties_organization_id
  ON public.properties(organization_id);
