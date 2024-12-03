-- Create API keys table
CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL UNIQUE,
  permissions TEXT[] NOT NULL DEFAULT ARRAY['read']::TEXT[],
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  rate_limit INTEGER NOT NULL DEFAULT 1000,
  rate_limit_window TEXT NOT NULL DEFAULT '1h',
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
  CONSTRAINT valid_permissions CHECK (
    permissions <@ ARRAY['read', 'write']::TEXT[]
  )
);

-- Create API key usage table
CREATE TABLE api_key_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  api_key_id UUID NOT NULL REFERENCES api_keys(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INTEGER NOT NULL,
  response_time INTEGER NOT NULL, -- in milliseconds
  metadata JSONB NOT NULL DEFAULT '{}'::JSONB
);

-- Create indexes
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_is_active ON api_keys(is_active) WHERE is_active = true;
CREATE INDEX idx_api_key_usage_api_key_id ON api_key_usage(api_key_id);
CREATE INDEX idx_api_key_usage_created_at ON api_key_usage(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update updated_at
CREATE TRIGGER update_api_keys_updated_at
  BEFORE UPDATE ON api_keys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to check rate limits
CREATE OR REPLACE FUNCTION check_api_key_rate_limit(
  p_api_key_id UUID,
  p_window_start TIMESTAMPTZ
)
RETURNS TABLE (
  current_usage BIGINT,
  rate_limit INTEGER,
  rate_limit_window TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(u.id)::BIGINT AS current_usage,
    k.rate_limit,
    k.rate_limit_window
  FROM api_keys k
  LEFT JOIN api_key_usage u ON u.api_key_id = k.id
    AND u.created_at >= p_window_start
  WHERE k.id = p_api_key_id
  GROUP BY k.rate_limit, k.rate_limit_window;
END;
$$ LANGUAGE plpgsql; 