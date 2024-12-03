-- Function to log activity
CREATE OR REPLACE FUNCTION log_activity(action_text TEXT, details_text TEXT DEFAULT NULL)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO activity_logs (action, details, user_id)
    VALUES (action_text, details_text, auth.uid());
END;
$$;

-- Function to get webhook executions
CREATE OR REPLACE FUNCTION get_webhook_executions(p_webhook_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
    execution_id UUID,
    webhook_name TEXT,
    status webhook_status,
    response_code INTEGER,
    error_message TEXT,
    executed_at TIMESTAMP WITH TIME ZONE,
    execution_duration INTERVAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
    AND we.user_id = auth.uid()
    ORDER BY we.executed_at DESC
    LIMIT p_limit;
END;
$$;

-- Function to record webhook execution
CREATE OR REPLACE FUNCTION record_webhook_execution(
    p_webhook_id UUID,
    p_status webhook_status,
    p_response_code INTEGER DEFAULT NULL,
    p_response_body TEXT DEFAULT NULL,
    p_error_message TEXT DEFAULT NULL,
    p_execution_duration INTERVAL DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_execution_id UUID;
BEGIN
    INSERT INTO webhook_executions (
        webhook_id,
        status,
        response_code,
        response_body,
        error_message,
        execution_duration,
        user_id
    )
    VALUES (
        p_webhook_id,
        p_status,
        p_response_code,
        p_response_body,
        p_error_message,
        p_execution_duration,
        auth.uid()
    )
    RETURNING id INTO v_execution_id;

    -- Update webhook last triggered timestamp
    UPDATE webhooks
    SET "lastTriggered" = CURRENT_TIMESTAMP
    WHERE id = p_webhook_id;

    RETURN v_execution_id;
END;
$$;

-- Function to start calendar sync
CREATE OR REPLACE FUNCTION start_calendar_sync(p_sync_setting_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_sync_history_id UUID;
BEGIN
    INSERT INTO calendar_sync_history (
        sync_setting_id,
        status,
        user_id
    )
    VALUES (
        p_sync_setting_id,
        'partial',
        auth.uid()
    )
    RETURNING id INTO v_sync_history_id;

    -- Update sync settings last synced timestamp
    UPDATE calendar_sync_settings
    SET last_synced = CURRENT_TIMESTAMP
    WHERE id = p_sync_setting_id;

    RETURN v_sync_history_id;
END;
$$;

-- Function to complete calendar sync
CREATE OR REPLACE FUNCTION complete_calendar_sync(
    p_sync_history_id UUID,
    p_status sync_status,
    p_events_added INTEGER DEFAULT 0,
    p_events_updated INTEGER DEFAULT 0,
    p_events_deleted INTEGER DEFAULT 0,
    p_error_message TEXT DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    UPDATE calendar_sync_history
    SET
        status = p_status,
        events_added = p_events_added,
        events_updated = p_events_updated,
        events_deleted = p_events_deleted,
        error_message = p_error_message,
        completed_at = CURRENT_TIMESTAMP,
        duration = CURRENT_TIMESTAMP - started_at
    WHERE id = p_sync_history_id
    AND user_id = auth.uid();
END;
$$;

-- Function to parse tracking information from description
CREATE OR REPLACE FUNCTION parse_tracking_info(description TEXT)
RETURNS TABLE (tracking_number TEXT, tracking_link TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (regexp_matches(description, 'Tracking Number:\s*(\S+)', 'i'))[1] AS tracking_number,
        (regexp_matches(description, '(https?:\/\/\S+)', 'i'))[1] AS tracking_link;
END;
$$;

-- Function to detect shipping service from title
CREATE OR REPLACE FUNCTION detect_shipping_service(title TEXT)
RETURNS shipping_service
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN CASE 
        WHEN title ILIKE '%ups%' THEN 'UPS'::shipping_service
        WHEN title ILIKE '%fedex%' THEN 'FedEx'::shipping_service
        WHEN title ILIKE '%usps%' THEN 'USPS'::shipping_service
        ELSE 'Other'::shipping_service
    END;
END;
$$;

-- Function to extract state abbreviation from title
CREATE OR REPLACE FUNCTION extract_state_abbreviation(title TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN (regexp_matches(title, '^([A-Z]{2})\d', 'g'))[1];
EXCEPTION
    WHEN OTHERS THEN
        RETURN NULL;
END;
$$;

-- Function to process and upsert calendar event
CREATE OR REPLACE FUNCTION process_calendar_event(
    p_event_id TEXT,
    p_title TEXT,
    p_description TEXT,
    p_start_date DATE,
    p_start_time TIME,
    p_end_date DATE,
    p_end_time TIME,
    p_status delivery_status DEFAULT 'pending'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_tracking_info RECORD;
    v_event_uuid UUID;
BEGIN
    -- Parse tracking information
    SELECT * INTO v_tracking_info FROM parse_tracking_info(p_description);
    
    -- Insert or update event
    INSERT INTO calendar_events (
        event_id,
        title,
        description,
        start_date,
        start_time,
        end_date,
        end_time,
        status,
        tracking_number,
        tracking_link,
        service,
        tp_id,
        state_abbreviation,
        user_id
    )
    VALUES (
        p_event_id,
        p_title,
        p_description,
        p_start_date,
        p_start_time,
        p_end_date,
        p_end_time,
        p_status,
        v_tracking_info.tracking_number,
        v_tracking_info.tracking_link,
        detect_shipping_service(p_title),
        split_part(p_title, ' ', 1),
        extract_state_abbreviation(p_title),
        auth.uid()
    )
    ON CONFLICT (event_id) 
    DO UPDATE SET
        title = EXCLUDED.title,
        description = EXCLUDED.description,
        start_date = EXCLUDED.start_date,
        start_time = EXCLUDED.start_time,
        end_date = EXCLUDED.end_date,
        end_time = EXCLUDED.end_time,
        status = EXCLUDED.status,
        tracking_number = EXCLUDED.tracking_number,
        tracking_link = EXCLUDED.tracking_link,
        service = EXCLUDED.service,
        tp_id = EXCLUDED.tp_id,
        state_abbreviation = EXCLUDED.state_abbreviation,
        last_updated = CURRENT_TIMESTAMP
    RETURNING id INTO v_event_uuid;

    -- Log activity
    PERFORM log_activity(
        'calendar_event_processed',
        format('Processed event %s: %s', p_event_id, p_title)
    );

    RETURN v_event_uuid;
END;
$$; 