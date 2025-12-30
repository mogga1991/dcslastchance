-- Notification history table for deduplication tracking
-- Tracks sent notifications to prevent duplicates within 24-hour window

CREATE TABLE IF NOT EXISTS notification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Deduplication key (hash of: user_id + match_id + notification_type)
  dedup_key TEXT NOT NULL,

  notification_type TEXT NOT NULL,
  match_id UUID,

  sent_at TIMESTAMPTZ DEFAULT NOW(),

  -- TTL for deduplication (24 hours)
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),

  CONSTRAINT unique_dedup_key UNIQUE (dedup_key)
);

-- Index for cleanup
CREATE INDEX idx_notification_history_expires
  ON notification_history(expires_at);

-- Cleanup function (called by cron)
CREATE OR REPLACE FUNCTION cleanup_notification_history()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM notification_history
  WHERE expires_at < NOW();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE notification_history IS 'Deduplication tracking for notifications (24-hour TTL)';
COMMENT ON COLUMN notification_history.dedup_key IS 'SHA-256 hash of user_id + match_id + notification_type';
COMMENT ON FUNCTION cleanup_notification_history() IS 'Removes expired deduplication records (called by cron)';
