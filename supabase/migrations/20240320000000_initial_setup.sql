-- Drop existing tables if they exist
DROP TABLE IF EXISTS webhook_executions CASCADE;
DROP TABLE IF EXISTS calendar_sync_history CASCADE;
DROP TABLE IF EXISTS calendar_sync_settings CASCADE;
DROP TABLE IF EXISTS webhooks CASCADE;
DROP TABLE IF EXISTS calendar_events CASCADE;
DROP TABLE IF EXISTS activity_logs CASCADE;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create base tables
CREATE TABLE webhooks (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL,
    url text NOT NULL,
    description text,
    active boolean DEFAULT true,
    createdAt timestamp with time zone DEFAULT NOW(),
    lastTriggered timestamp with time zone
);

CREATE TABLE calendar_events (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    title text NOT NULL,
    startTime timestamp with time zone NOT NULL,
    endTime timestamp with time zone NOT NULL,
    createdAt timestamp with time zone DEFAULT NOW()
);

CREATE TABLE activity_logs (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    action text NOT NULL,
    details text,
    createdAt timestamp with time zone DEFAULT NOW()
);

CREATE TABLE webhook_executions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    webhook_id uuid REFERENCES webhooks(id) ON DELETE CASCADE,
    status text NOT NULL CHECK (status IN ('success', 'failed', 'pending')),
    response_code integer,
    response_body text,
    error_message text,
    executed_at timestamp with time zone DEFAULT NOW(),
    execution_duration interval
);

CREATE TABLE calendar_sync_settings (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    provider text NOT NULL CHECK (provider IN ('google', 'outlook', 'ical')),
    calendar_id text NOT NULL,
    sync_token text,
    last_synced timestamp with time zone,
    sync_frequency interval NOT NULL DEFAULT interval '15 minutes',
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT NOW(),
    settings jsonb DEFAULT '{}'::jsonb
);

CREATE TABLE calendar_sync_history (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    sync_setting_id uuid REFERENCES calendar_sync_settings(id) ON DELETE CASCADE,
    status text NOT NULL CHECK (status IN ('success', 'failed', 'partial')),
    events_added integer DEFAULT 0,
    events_updated integer DEFAULT 0,
    events_deleted integer DEFAULT 0,
    error_message text,
    started_at timestamp with time zone DEFAULT NOW(),
    completed_at timestamp with time zone,
    duration interval
);

-- Create indexes
CREATE INDEX idx_calendar_events_start_time ON calendar_events(startTime);
CREATE INDEX idx_activity_logs_timestamp ON activity_logs(createdAt);
CREATE INDEX idx_webhooks_active ON webhooks(active);
CREATE INDEX idx_webhook_executions_webhook_id ON webhook_executions(webhook_id);
CREATE INDEX idx_webhook_executions_status ON webhook_executions(status);
CREATE INDEX idx_webhook_executions_executed_at ON webhook_executions(executed_at);
CREATE INDEX idx_calendar_sync_settings_provider ON calendar_sync_settings(provider);
CREATE INDEX idx_calendar_sync_settings_active ON calendar_sync_settings(is_active);
CREATE INDEX idx_calendar_sync_history_sync_setting ON calendar_sync_history(sync_setting_id);
CREATE INDEX idx_calendar_sync_history_status ON calendar_sync_history(status);

-- Create functions
CREATE OR REPLACE FUNCTION log_activity(
    action_text text,
    details_text text DEFAULT NULL
) RETURNS void AS $$
BEGIN
    INSERT INTO activity_logs (action, details)
    VALUES (action_text, details_text);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update webhook last_triggered timestamp
CREATE OR REPLACE FUNCTION update_webhook_last_triggered()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE webhooks
    SET lastTriggered = NOW()
    WHERE id = NEW.webhook_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to log webhook activities
CREATE OR REPLACE FUNCTION log_webhook_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM log_activity(
            'Webhook Created',
            format('Created webhook "%s" for URL %s', NEW.name, NEW.url)
        );
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.active <> NEW.active THEN
            PERFORM log_activity(
                'Webhook Status Changed',
                format('Webhook "%s" %s', NEW.name, CASE WHEN NEW.active THEN 'activated' ELSE 'deactivated' END)
            );
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM log_activity(
            'Webhook Deleted',
            format('Deleted webhook "%s"', OLD.name)
        );
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to log calendar event activities
CREATE OR REPLACE FUNCTION log_calendar_activity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        PERFORM log_activity(
            'Event Created',
            format('Created event "%s" starting at %s', NEW.title, NEW.startTime)
        );
    ELSIF TG_OP = 'UPDATE' THEN
        PERFORM log_activity(
            'Event Updated',
            format('Updated event "%s"', NEW.title)
        );
    ELSIF TG_OP = 'DELETE' THEN
        PERFORM log_activity(
            'Event Deleted',
            format('Deleted event "%s"', OLD.title)
        );
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function to get recent webhook executions with details
CREATE OR REPLACE FUNCTION get_webhook_executions(
    p_webhook_id uuid,
    p_limit integer DEFAULT 10
)
RETURNS TABLE (
    execution_id uuid,
    webhook_name text,
    status text,
    response_code integer,
    error_message text,
    executed_at timestamp with time zone,
    execution_duration interval
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        we.id as execution_id,
        w.name as webhook_name,
        we.status,
        we.response_code,
        we.error_message,
        we.executed_at,
        we.execution_duration
    FROM webhook_executions we
    JOIN webhooks w ON w.id = we.webhook_id
    WHERE we.webhook_id = p_webhook_id
    ORDER BY we.executed_at DESC
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
DROP TRIGGER IF EXISTS webhook_activity_trigger ON webhooks;
CREATE TRIGGER webhook_activity_trigger
    AFTER INSERT OR UPDATE OR DELETE ON webhooks
    FOR EACH ROW
    EXECUTE FUNCTION log_webhook_activity();

DROP TRIGGER IF EXISTS calendar_activity_trigger ON calendar_events;
CREATE TRIGGER calendar_activity_trigger
    AFTER INSERT OR UPDATE OR DELETE ON calendar_events
    FOR EACH ROW
    EXECUTE FUNCTION log_calendar_activity();

DROP TRIGGER IF EXISTS webhook_last_triggered_trigger ON webhook_executions;
CREATE TRIGGER webhook_last_triggered_trigger
    AFTER INSERT ON webhook_executions
    FOR EACH ROW
    WHEN (NEW.status = 'success')
    EXECUTE FUNCTION update_webhook_last_triggered();

-- Enable RLS on all tables
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_sync_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_sync_history ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Enable read access for all users"
    ON webhooks FOR SELECT
    USING (true);

CREATE POLICY "Enable read access for all users"
    ON calendar_events FOR SELECT
    USING (true);

CREATE POLICY "Enable read access for all users"
    ON activity_logs FOR SELECT
    USING (true);

CREATE POLICY "Enable read access for all users"
    ON webhook_executions FOR SELECT
    USING (true);

CREATE POLICY "Enable read access for all users"
    ON calendar_sync_settings FOR SELECT
    USING (true);

CREATE POLICY "Enable read access for all users"
    ON calendar_sync_history FOR SELECT
    USING (true);

-- Insert sample data
INSERT INTO webhooks (name, url, description, active)
VALUES 
    ('Slack Notification', 'https://hooks.slack.com/services/example', 'Sends notifications to Slack channel', true),
    ('MS Teams Alert', 'https://webhook.office.com/webhookb2/example', 'Sends alerts to MS Teams', true),
    ('Email Notification', 'https://api.email-service.com/webhook', 'Sends email notifications', false);

INSERT INTO calendar_events (title, startTime, endTime)
VALUES 
    ('Team Meeting', NOW() + interval '1 day', NOW() + interval '1 day' + interval '1 hour'),
    ('Project Review', NOW() + interval '2 days', NOW() + interval '2 days' + interval '2 hours'),
    ('Client Call', NOW() + interval '3 days', NOW() + interval '3 days' + interval '30 minutes');

INSERT INTO activity_logs (action, details)
VALUES 
    ('Calendar Sync', 'Successfully synced 5 events'),
    ('Webhook Created', 'New Slack webhook created'),
    ('Event Added', 'Added new team meeting event'),
    ('Webhook Triggered', 'Slack notification sent successfully'); 