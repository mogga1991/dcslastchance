-- Notifications table for in-app notification center
-- Stores user notifications for property match alerts with AI-generated insights

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Notification metadata
  type TEXT NOT NULL CHECK (type IN (
    'perfect_match',      -- Grade A, 85+, competitive
    'high_quality_match', -- Grade A/B, 70+
    'new_match',          -- Grade C/D, 40+
    'match_update',       -- Existing match score changed
    'sync_complete',      -- Daily sync completed
    'property_action'     -- Action needed on property
  )),

  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('urgent', 'high', 'normal', 'low')),

  -- Content
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_label TEXT,         -- e.g., "View Match", "Review Property"
  action_url TEXT,            -- Deep link to relevant page

  -- Related entities
  property_id UUID REFERENCES broker_listings(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
  match_id UUID REFERENCES property_matches(id) ON DELETE CASCADE,

  -- Match details (denormalized for quick display)
  match_score INTEGER,
  match_grade TEXT,

  -- AI enhancement (optional)
  ai_insight TEXT,           -- Claude-generated insight
  ai_generated BOOLEAN DEFAULT false,

  -- Notification state
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  dismissed BOOLEAN DEFAULT false,
  dismissed_at TIMESTAMPTZ,

  -- Delivery tracking
  sent_push BOOLEAN DEFAULT false,
  sent_push_at TIMESTAMPTZ,
  push_error TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),

  -- Performance
  CONSTRAINT valid_expiration CHECK (expires_at > created_at)
);

-- Indexes for performance
CREATE INDEX idx_notifications_user_unread
  ON notifications(user_id, read, created_at DESC)
  WHERE NOT read AND NOT dismissed;

CREATE INDEX idx_notifications_user_all
  ON notifications(user_id, created_at DESC);

CREATE INDEX idx_notifications_type
  ON notifications(type, created_at DESC);

CREATE INDEX idx_notifications_property
  ON notifications(property_id)
  WHERE property_id IS NOT NULL;

CREATE INDEX idx_notifications_expires
  ON notifications(expires_at);

-- Row Level Security
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can create notifications"
  ON notifications FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- Auto-cleanup function for expired notifications
CREATE OR REPLACE FUNCTION cleanup_expired_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM notifications
  WHERE expires_at < NOW()
    AND read = true
    AND dismissed = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE notifications IS 'In-app notification center for property match alerts';
COMMENT ON FUNCTION cleanup_expired_notifications() IS 'Removes expired notifications that have been read and dismissed';
