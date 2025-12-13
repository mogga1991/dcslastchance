-- Create team_members table
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('broker', 'realtor', 'salesman', 'owner')),
  phone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),

  -- Activity tracking
  last_login_at TIMESTAMP WITH TIME ZONE,
  total_logins INTEGER DEFAULT 0,
  listings_posted INTEGER DEFAULT 0,
  ai_matches_found INTEGER DEFAULT 0,
  discussions_active INTEGER DEFAULT 0,
  deals_completed INTEGER DEFAULT 0,
  total_earnings DECIMAL(12, 2) DEFAULT 0.00,

  -- Metadata
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(owner_id, email)
);

-- Create activity_log table to track detailed team member activities
CREATE TABLE IF NOT EXISTS public.team_activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_member_id UUID NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  activity_type VARCHAR(50) NOT NULL CHECK (activity_type IN ('login', 'listing_posted', 'match_found', 'discussion_started', 'deal_completed')),
  activity_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create team_earnings table to track earnings per deal
CREATE TABLE IF NOT EXISTS public.team_earnings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_member_id UUID NOT NULL REFERENCES public.team_members(id) ON DELETE CASCADE,
  deal_name VARCHAR(255) NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  commission_percentage DECIMAL(5, 2),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_team_members_owner ON public.team_members(owner_id);
CREATE INDEX idx_team_members_status ON public.team_members(status);
CREATE INDEX idx_team_activity_member ON public.team_activity_log(team_member_id);
CREATE INDEX idx_team_activity_created ON public.team_activity_log(created_at DESC);
CREATE INDEX idx_team_earnings_member ON public.team_earnings(team_member_id);

-- Enable Row Level Security
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_earnings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for team_members
CREATE POLICY "Users can view their own team members"
  ON public.team_members FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert their own team members"
  ON public.team_members FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own team members"
  ON public.team_members FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own team members"
  ON public.team_members FOR DELETE
  USING (auth.uid() = owner_id);

-- RLS Policies for team_activity_log
CREATE POLICY "Users can view activity logs of their team members"
  ON public.team_activity_log FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.id = team_activity_log.team_member_id
      AND team_members.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert activity logs for their team members"
  ON public.team_activity_log FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.id = team_activity_log.team_member_id
      AND team_members.owner_id = auth.uid()
    )
  );

-- RLS Policies for team_earnings
CREATE POLICY "Users can view earnings of their team members"
  ON public.team_earnings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.id = team_earnings.team_member_id
      AND team_members.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage earnings of their team members"
  ON public.team_earnings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members
      WHERE team_members.id = team_earnings.team_member_id
      AND team_members.owner_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_team_earnings_updated_at
  BEFORE UPDATE ON public.team_earnings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to track login activity
CREATE OR REPLACE FUNCTION track_team_member_login(member_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.team_members
  SET
    last_login_at = NOW(),
    total_logins = total_logins + 1
  WHERE id = member_id;

  INSERT INTO public.team_activity_log (team_member_id, activity_type)
  VALUES (member_id, 'login');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
