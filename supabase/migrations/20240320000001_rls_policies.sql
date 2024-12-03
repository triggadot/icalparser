-- Enable Row Level Security
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_sync_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_sync_history ENABLE ROW LEVEL SECURITY;

-- Calendar Events Policies
CREATE POLICY "Enable insert for authenticated users only"
ON calendar_events FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable read access for own events"
ON calendar_events FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Enable update for own events"
ON calendar_events FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for own events"
ON calendar_events FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Activity Logs Policies
CREATE POLICY "Enable insert for authenticated users only"
ON activity_logs FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable read access for own logs"
ON activity_logs FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Webhooks Policies
CREATE POLICY "Enable insert for authenticated users only"
ON webhooks FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable read access for own webhooks"
ON webhooks FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Enable update for own webhooks"
ON webhooks FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for own webhooks"
ON webhooks FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Webhook Executions Policies
CREATE POLICY "Enable insert for authenticated users only"
ON webhook_executions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable read access for own executions"
ON webhook_executions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Calendar Sync Settings Policies
CREATE POLICY "Enable insert for authenticated users only"
ON calendar_sync_settings FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable read access for own settings"
ON calendar_sync_settings FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Enable update for own settings"
ON calendar_sync_settings FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable delete for own settings"
ON calendar_sync_settings FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Calendar Sync History Policies
CREATE POLICY "Enable insert for authenticated users only"
ON calendar_sync_history FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable read access for own history"
ON calendar_sync_history FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Anonymous access for public endpoints
CREATE POLICY "Enable anonymous read for public events"
ON calendar_events FOR SELECT
TO anon
USING (true);

CREATE POLICY "Enable anonymous webhook execution"
ON webhook_executions FOR INSERT
TO anon
WITH CHECK (true);

-- For development/testing only - remove in production
CREATE POLICY "Enable anonymous insert for testing"
ON calendar_events FOR INSERT
TO anon
WITH CHECK (true);

COMMENT ON POLICY "Enable anonymous insert for testing" ON calendar_events
IS 'WARNING: Remove this policy before deploying to production'; 