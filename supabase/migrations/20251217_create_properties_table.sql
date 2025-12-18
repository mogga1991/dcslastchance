-- Create properties table matching Neon schema
-- This allows us to migrate all property listings from Neon to Supabase

-- Drop existing properties table if it exists with wrong schema
DROP TABLE IF EXISTS public.properties CASCADE;

-- Create properties table
CREATE TABLE public.properties (
    id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
    broker_id text NOT NULL,
    address text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    zip text,
    latitude numeric,
    longitude numeric,
    property_name text,
    building_class text,
    year_built integer,
    year_renovated integer,
    total_floors integer,
    available_floors text,
    total_sf integer NOT NULL,
    available_sf integer NOT NULL,
    min_divisible_sf integer,
    max_contiguous_sf integer,
    column_spacing_ft integer,
    parking_spaces integer DEFAULT 0,
    parking_type text,
    parking_ratio text,
    has_loading_dock boolean DEFAULT false,
    has_backup_power boolean DEFAULT false,
    has_raised_floor boolean DEFAULT false,
    fiber_providers text[] DEFAULT '{}',
    energy_star_certified boolean DEFAULT false,
    energy_star_score integer,
    leed_certified boolean DEFAULT false,
    leed_level text,
    max_security_level text,
    scif_capable boolean DEFAULT false,
    asking_rent_per_sf numeric,
    cam_per_sf numeric,
    ti_allowance_per_sf numeric,
    available_date date,
    lease_term_min_years integer,
    lease_term_max_years integer,
    status text DEFAULT 'available',
    images text[] DEFAULT '{}',
    floor_plans text[] DEFAULT '{}',
    brochure_url text,
    created_at timestamp without time zone NOT NULL DEFAULT now(),
    updated_at timestamp without time zone NOT NULL DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX idx_properties_broker ON public.properties USING btree (broker_id);
CREATE INDEX idx_properties_location ON public.properties USING btree (state, city);
CREATE INDEX idx_properties_status ON public.properties USING btree (status);
CREATE INDEX idx_properties_size ON public.properties USING btree (available_sf);
CREATE INDEX idx_properties_created ON public.properties USING btree (created_at DESC);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Allow all users to read available properties (public listings)
CREATE POLICY "Allow public read access to available properties"
    ON public.properties
    FOR SELECT
    USING (status = 'available');

-- Allow authenticated users to read all properties
CREATE POLICY "Allow authenticated users to read all properties"
    ON public.properties
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow users to insert their own properties
CREATE POLICY "Allow users to insert own properties"
    ON public.properties
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow users to update their own properties
CREATE POLICY "Allow users to update own properties"
    ON public.properties
    FOR UPDATE
    TO authenticated
    USING (broker_id = auth.uid()::text)
    WITH CHECK (broker_id = auth.uid()::text);

-- Allow users to delete their own properties
CREATE POLICY "Allow users to delete own properties"
    ON public.properties
    FOR DELETE
    TO authenticated
    USING (broker_id = auth.uid()::text);

-- Grant permissions
GRANT ALL ON public.properties TO authenticated;
GRANT SELECT ON public.properties TO anon;
