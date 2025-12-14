-- ============================================================================
-- PROPOSALIQ MULTI-TENANT SCHEMA
-- Production-ready with RLS policies for secure multi-tenant access
-- ============================================================================

-- Enable required extensions
create extension if not exists "pgcrypto";

-- =========================
-- ORGANIZATIONS + MEMBERS (multi-tenant foundation)
-- =========================
create table if not exists public.orgs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.org_members (
  org_id uuid not null references public.orgs(id) on delete cascade,
  user_id uuid not null,
  role text not null default 'member', -- owner|admin|member
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);

-- =========================
-- COMPANY PROFILES (AI personalization brain)
-- =========================
create table if not exists public.company_profiles (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  profile jsonb not null,
  version text not null default '1.0',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists company_profiles_org_id_idx on public.company_profiles(org_id);

-- =========================
-- OPPORTUNITIES (SAM.gov + manual imports)
-- =========================
create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  source text not null default 'SAM', -- SAM|Manual|Other
  notice_id text,                     -- SAM notice id
  solicitation_number text,
  title text,
  agency text,
  posted_date date,
  due_date timestamptz,
  status text not null default 'new', -- new|qualified|bidding|submitted|archived
  raw jsonb not null default '{}'::jsonb, -- SAM payload or other metadata
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists opportunities_org_id_idx on public.opportunities(org_id);
create index if not exists opportunities_notice_id_idx on public.opportunities(notice_id);
create index if not exists opportunities_due_date_idx on public.opportunities(due_date);
create index if not exists opportunities_status_idx on public.opportunities(status);

-- =========================
-- DOCUMENTS (PDFs + attachments in Supabase Storage)
-- =========================
create table if not exists public.opportunity_documents (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  filename text not null,
  storage_path text not null, -- path in supabase storage bucket
  mime_type text,
  size_bytes bigint,
  page_count integer,
  extracted_text text,        -- optional full text extraction
  extracted_meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists opp_docs_org_id_idx on public.opportunity_documents(org_id);
create index if not exists opp_docs_opportunity_id_idx on public.opportunity_documents(opportunity_id);
create index if not exists opp_docs_storage_path_idx on public.opportunity_documents(storage_path);

-- =========================
-- ANALYSIS RESULTS (AI extraction outputs)
-- =========================
create table if not exists public.opportunity_analysis (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  document_id uuid references public.opportunity_documents(id) on delete set null,
  schema_version text not null default '1.0',
  analysis jsonb not null,  -- Full OpportunityAnalysis JSON
  created_by uuid,
  created_at timestamptz not null default now()
);

create index if not exists opp_analysis_org_id_idx on public.opportunity_analysis(org_id);
create index if not exists opp_analysis_opportunity_id_idx on public.opportunity_analysis(opportunity_id);
create index if not exists opp_analysis_gin_idx on public.opportunity_analysis using gin (analysis);

-- =========================
-- SCORECARDS (Bid/No-Bid decisions)
-- =========================
create table if not exists public.opportunity_scorecards (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  analysis_id uuid references public.opportunity_analysis(id) on delete set null,
  schema_version text not null default '1.0',
  scorecard jsonb not null, -- Scorecard JSON with scores and recommendations
  created_by uuid,
  created_at timestamptz not null default now()
);

create index if not exists opp_scorecards_org_id_idx on public.opportunity_scorecards(org_id);
create index if not exists opp_scorecards_opportunity_id_idx on public.opportunity_scorecards(opportunity_id);
create index if not exists opp_scorecards_gin_idx on public.opportunity_scorecards using gin (scorecard);

-- =========================
-- COMPLIANCE MATRICES (Requirements tracking)
-- =========================
create table if not exists public.opportunity_compliance_matrices (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.orgs(id) on delete cascade,
  opportunity_id uuid not null references public.opportunities(id) on delete cascade,
  analysis_id uuid references public.opportunity_analysis(id) on delete set null,
  schema_version text not null default '1.0',
  matrix jsonb not null, -- ComplianceMatrix JSON with rows
  created_by uuid,
  created_at timestamptz not null default now()
);

create index if not exists opp_matrices_org_id_idx on public.opportunity_compliance_matrices(org_id);
create index if not exists opp_matrices_opportunity_id_idx on public.opportunity_compliance_matrices(opportunity_id);
create index if not exists opp_matrices_gin_idx on public.opportunity_compliance_matrices using gin (matrix);

-- =========================
-- UPDATED_AT TRIGGERS
-- =========================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at_company_profiles on public.company_profiles;
create trigger set_updated_at_company_profiles
before update on public.company_profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at_opportunities on public.opportunities;
create trigger set_updated_at_opportunities
before update on public.opportunities
for each row execute function public.set_updated_at();

-- =========================
-- ROW LEVEL SECURITY
-- =========================
alter table public.orgs enable row level security;
alter table public.org_members enable row level security;
alter table public.company_profiles enable row level security;
alter table public.opportunities enable row level security;
alter table public.opportunity_documents enable row level security;
alter table public.opportunity_analysis enable row level security;
alter table public.opportunity_scorecards enable row level security;
alter table public.opportunity_compliance_matrices enable row level security;

-- Helper: check org membership
create or replace function public.is_org_member(check_org_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.org_members m
    where m.org_id = check_org_id and m.user_id = auth.uid()
  );
$$ language sql stable security definer;

-- ORGS: members can read
create policy "orgs_read_members"
on public.orgs for select
using (public.is_org_member(id));

-- ORG MEMBERS: members can read membership list
create policy "org_members_read"
on public.org_members for select
using (public.is_org_member(org_id));

-- COMPANY PROFILES: full CRUD for members
create policy "company_profiles_read"
on public.company_profiles for select
using (public.is_org_member(org_id));

create policy "company_profiles_write"
on public.company_profiles for insert
with check (public.is_org_member(org_id));

create policy "company_profiles_update"
on public.company_profiles for update
using (public.is_org_member(org_id))
with check (public.is_org_member(org_id));

-- OPPORTUNITIES: full CRUD for members
create policy "opportunities_read"
on public.opportunities for select
using (public.is_org_member(org_id));

create policy "opportunities_write"
on public.opportunities for insert
with check (public.is_org_member(org_id));

create policy "opportunities_update"
on public.opportunities for update
using (public.is_org_member(org_id))
with check (public.is_org_member(org_id));

-- DOCUMENTS: members can read/write
create policy "opp_docs_read"
on public.opportunity_documents for select
using (public.is_org_member(org_id));

create policy "opp_docs_write"
on public.opportunity_documents for insert
with check (public.is_org_member(org_id));

-- ANALYSIS: members can read/write
create policy "opp_analysis_read"
on public.opportunity_analysis for select
using (public.is_org_member(org_id));

create policy "opp_analysis_write"
on public.opportunity_analysis for insert
with check (public.is_org_member(org_id));

-- SCORECARDS: members can read/write
create policy "opp_scorecards_read"
on public.opportunity_scorecards for select
using (public.is_org_member(org_id));

create policy "opp_scorecards_write"
on public.opportunity_scorecards for insert
with check (public.is_org_member(org_id));

-- MATRICES: members can read/write
create policy "opp_matrices_read"
on public.opportunity_compliance_matrices for select
using (public.is_org_member(org_id));

create policy "opp_matrices_write"
on public.opportunity_compliance_matrices for insert
with check (public.is_org_member(org_id));

-- =========================
-- STORAGE BUCKET SETUP
-- Note: Run this in Supabase Dashboard > Storage or via API
-- This creates the bucket for PDFs with proper RLS
-- =========================

-- Insert storage bucket (if not exists)
insert into storage.buckets (id, name, public)
values ('opportunity-documents', 'opportunity-documents', false)
on conflict (id) do nothing;

-- Storage RLS: users can only access docs from their org
create policy "Users can view org documents"
on storage.objects for select
using (
  bucket_id = 'opportunity-documents'
  AND EXISTS (
    SELECT 1 FROM public.opportunity_documents od
    WHERE od.storage_path = storage.objects.name
    AND public.is_org_member(od.org_id)
  )
);

create policy "Users can upload org documents"
on storage.objects for insert
with check (
  bucket_id = 'opportunity-documents'
  AND auth.role() = 'authenticated'
);

create policy "Users can update org documents"
on storage.objects for update
using (
  bucket_id = 'opportunity-documents'
  AND EXISTS (
    SELECT 1 FROM public.opportunity_documents od
    WHERE od.storage_path = storage.objects.name
    AND public.is_org_member(od.org_id)
  )
);

create policy "Users can delete org documents"
on storage.objects for delete
using (
  bucket_id = 'opportunity-documents'
  AND EXISTS (
    SELECT 1 FROM public.opportunity_documents od
    WHERE od.storage_path = storage.objects.name
    AND public.is_org_member(od.org_id)
  )
);
