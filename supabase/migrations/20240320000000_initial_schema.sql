-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types for status enums
CREATE TYPE webhook_status AS ENUM ('success', 'failed', 'pending');
CREATE TYPE sync_status AS ENUM ('success', 'failed', 'partial');
CREATE TYPE calendar_provider AS ENUM ('google', 'outlook', 'ical');
CREATE TYPE shipping_service AS ENUM ('UPS', 'FedEx', 'USPS', 'Other');
CREATE TYPE delivery_status AS ENUM ('pending', 'in_transit', 'delivered', 'cancelled');

-- Create calendar_events table
CREATE TABLE calendar_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id TEXT UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    start_date DATE NOT NULL,
    start_time TIME,
    end_date DATE NOT NULL,
    end_time TIME,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status delivery_status DEFAULT 'pending',
    tracking_number TEXT,
    tracking_link TEXT,
    last_tracked TIMESTAMP WITH TIME ZONE,
    service shipping_service,
    tp_id TEXT,
    state_abbreviation CHAR(2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    metadata JSONB DEFAULT '{}'::JSONB
);

-- Create activity_logs table
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action TEXT NOT NULL,
    details TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create webhooks table
CREATE TABLE webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    active BOOLEAN DEFAULT true,
    description TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "lastTriggered" TIMESTAMP WITH TIME ZONE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create webhook_executions table
CREATE TABLE webhook_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE,
    status webhook_status NOT NULL DEFAULT 'pending',
    response_code INTEGER,
    response_body TEXT,
    error_message TEXT,
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    execution_duration INTERVAL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create calendar_sync_settings table
CREATE TABLE calendar_sync_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider calendar_provider NOT NULL,
    calendar_id TEXT NOT NULL,
    sync_token TEXT,
    last_synced TIMESTAMP WITH TIME ZONE,
    sync_frequency INTERVAL DEFAULT '1 day'::INTERVAL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    settings JSONB DEFAULT '{}'::JSONB,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create calendar_sync_history table
CREATE TABLE calendar_sync_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sync_setting_id UUID REFERENCES calendar_sync_settings(id) ON DELETE CASCADE,
    status sync_status NOT NULL DEFAULT 'partial',
    events_added INTEGER DEFAULT 0,
    events_updated INTEGER DEFAULT 0,
    events_deleted INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    duration INTERVAL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_calendar_events_user_id ON calendar_events(user_id);
CREATE INDEX idx_calendar_events_start_time ON calendar_events("startTime");
CREATE INDEX idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_webhooks_user_id ON webhooks(user_id);
CREATE INDEX idx_webhook_executions_webhook_id ON webhook_executions(webhook_id);
CREATE INDEX idx_calendar_sync_settings_user_id ON calendar_sync_settings(user_id);
CREATE INDEX idx_calendar_sync_history_sync_setting_id ON calendar_sync_history(sync_setting_id); 