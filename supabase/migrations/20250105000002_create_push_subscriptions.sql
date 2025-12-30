-- Browser push notification subscriptions table (Web Push API)
-- Stores push subscription endpoints for delivering browser notifications

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Web Push subscription details
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,      -- Public key for encryption
  auth_key TEXT NOT NULL,        -- Authentication secret

  -- Device/browser identification
  user_agent TEXT,
  device_type TEXT CHECK (device_type IN ('desktop', 'mobile', 'tablet', 'unknown')),
  browser TEXT,

  -- Subscription state
  active BOOLEAN DEFAULT true,

  -- Delivery tracking
  last_sent_at TIMESTAMPTZ,
  last_error TEXT,
  error_count INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT unique_endpoint UNIQUE (endpoint)
);

-- Indexes
CREATE INDEX idx_push_subscriptions_user
  ON push_subscriptions(user_id)
  WHERE active = true;

CREATE INDEX idx_push_subscriptions_endpoint
  ON push_subscriptions(endpoint);

-- Row Level Security
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions"
  ON push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own subscriptions"
  ON push_subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
  ON push_subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own subscriptions"
  ON push_subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- Auto-deactivate on repeated errors
CREATE OR REPLACE FUNCTION deactivate_failed_push_subscription()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.error_count >= 5 THEN
    NEW.active = false;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_push_subscription_errors
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW
  WHEN (NEW.error_count > OLD.error_count)
  EXECUTE FUNCTION deactivate_failed_push_subscription();

COMMENT ON TABLE push_subscriptions IS 'Web Push API subscriptions for browser notifications';
COMMENT ON COLUMN push_subscriptions.endpoint IS 'Push service endpoint URL (unique per device/browser)';
COMMENT ON COLUMN push_subscriptions.p256dh_key IS 'Client public key for message encryption';
COMMENT ON COLUMN push_subscriptions.auth_key IS 'Authentication secret for push messages';
