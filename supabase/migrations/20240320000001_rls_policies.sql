-- Enable Row Level Security
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_sync_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_sync_history ENABLE ROW LEVEL SECURITY;

-- Calendar Events Policies
CREATE POLICY "Users can view their own calendar events"
    ON calendar_events FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own calendar events"
    ON calendar_events FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar events"
    ON calendar_events FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar events"
    ON calendar_events FOR DELETE
    USING (auth.uid() = user_id);

-- Activity Logs Policies
CREATE POLICY "Users can view their own activity logs"
    ON activity_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create activity logs"
    ON activity_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Webhooks Policies
CREATE POLICY "Users can view their own webhooks"
    ON webhooks FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own webhooks"
    ON webhooks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own webhooks"
    ON webhooks FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own webhooks"
    ON webhooks FOR DELETE
    USING (auth.uid() = user_id);

-- Webhook Executions Policies
CREATE POLICY "Users can view their own webhook executions"
    ON webhook_executions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create webhook executions"
    ON webhook_executions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update webhook executions"
    ON webhook_executions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Calendar Sync Settings Policies
CREATE POLICY "Users can view their own sync settings"
    ON calendar_sync_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own sync settings"
    ON calendar_sync_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sync settings"
    ON calendar_sync_settings FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sync settings"
    ON calendar_sync_settings FOR DELETE
    USING (auth.uid() = user_id);

-- Calendar Sync History Policies
CREATE POLICY "Users can view their own sync history"
    ON calendar_sync_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create sync history entries"
    ON calendar_sync_history FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update sync history entries"
    ON calendar_sync_history FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id); 