-- ================================================================
-- Cache Cleanup Function
-- Sprint 2: Essential for preventing cache table bloat
-- ================================================================

CREATE OR REPLACE FUNCTION cleanup_expired_cache()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
  temp_count INTEGER;
BEGIN
  -- Delete expired neighborhood scores
  DELETE FROM federal_neighborhood_scores
  WHERE expires_at < NOW();

  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;

  -- Delete expired match scores
  DELETE FROM property_match_scores
  WHERE expires_at < NOW();

  GET DIAGNOSTICS temp_count = ROW_COUNT;
  deleted_count := deleted_count + temp_count;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_expired_cache IS 'Removes expired cache entries from federal_neighborhood_scores and property_match_scores tables. Returns count of deleted records.';
