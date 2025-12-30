-- User notification preferences table
-- Stores user-configurable settings for notification delivery and frequency

CREATE TABLE IF NOT EXISTS notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Channel preferences
  in_app_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT false,  -- Future feature

  -- Notification tier preferences
  perfect_match_notify BOOLEAN DEFAULT true,         -- Grade A, 85+
  perfect_match_push BOOLEAN DEFAULT true,

  high_quality_notify BOOLEAN DEFAULT true,          -- Grade B, 70-84
  high_quality_push BOOLEAN DEFAULT false,

  standard_match_notify BOOLEAN DEFAULT true,        -- Grade C/D, 40-69
  standard_match_push BOOLEAN DEFAULT false,
  standard_match_digest BOOLEAN DEFAULT true,        -- Daily summary instead

  -- Quiet hours
  quiet_hours_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME,                            -- e.g., '22:00'
  quiet_hours_end TIME,                              -- e.g., '08:00'
  quiet_hours_timezone TEXT DEFAULT 'America/Denver',

  -- Frequency limits
  max_notifications_per_day INTEGER DEFAULT 50,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own preferences"
  ON notification_preferences FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences"
  ON notification_preferences FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences"
  ON notification_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create or replace the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Default preferences on user signup
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER create_notification_preferences_on_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_notification_preferences();

COMMENT ON TABLE notification_preferences IS 'User preferences for notification delivery and frequency';
COMMENT ON COLUMN notification_preferences.quiet_hours_timezone IS 'IANA timezone identifier for quiet hours calculation';
