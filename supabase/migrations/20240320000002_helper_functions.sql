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

-- Function to update last_used_at on API keys
CREATE OR REPLACE FUNCTION update_api_key_last_used()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE api_keys
    SET last_used_at = CURRENT_TIMESTAMP
    WHERE id = NEW.api_key_id;
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
            format('Created event "%s" starting on %s', NEW.title, NEW.start_date)
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

-- Create triggers
CREATE TRIGGER webhook_activity_trigger
    AFTER INSERT OR UPDATE OR DELETE ON webhooks
    FOR EACH ROW
    EXECUTE FUNCTION log_webhook_activity();

CREATE TRIGGER calendar_activity_trigger
    AFTER INSERT OR UPDATE OR DELETE ON calendar_events
    FOR EACH ROW
    EXECUTE FUNCTION log_calendar_activity();

CREATE TRIGGER api_key_last_used_trigger
    AFTER INSERT ON api_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_api_key_last_used(); 