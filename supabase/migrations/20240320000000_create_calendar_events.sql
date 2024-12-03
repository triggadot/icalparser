create table calendar_events (
  id text primary key,
  summary text not null,
  description text,
  location text,
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  created_at timestamp with time zone not null default now(),
  last_modified timestamp with time zone not null default now(),
  status text not null,
  organizer text,
  sync_status text not null default 'pending',
  tracking_number text,
  tracking_link text,
  service text,
  state_abbreviation text,
  constraint sync_status_check check (sync_status in ('pending', 'synced', 'failed'))
);

-- Create indexes for better query performance
create index calendar_events_start_date_idx on calendar_events(start_date);
create index calendar_events_sync_status_idx on calendar_events(sync_status);
create index calendar_events_tracking_number_idx on calendar_events(tracking_number);
create index calendar_events_service_idx on calendar_events(service);
create index calendar_events_state_abbreviation_idx on calendar_events(state_abbreviation);

-- Webhooks Table
create table webhooks (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  url text not null,
  secret text,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  last_triggered timestamp with time zone,
  failure_count integer not null default 0,
  events text[] not null,
  headers jsonb,
  retry_count integer not null default 3,
  timeout_ms integer not null default 5000
);

-- Create indexes for webhooks
create index webhooks_is_active_idx on webhooks(is_active);
create index webhooks_created_at_idx on webhooks(created_at);

-- Webhook Events Log
create table webhook_events (
  id uuid primary key default gen_random_uuid(),
  webhook_id uuid not null references webhooks(id) on delete cascade,
  event_type text not null,
  payload jsonb not null,
  status text not null default 'pending',
  created_at timestamp with time zone not null default now(),
  processed_at timestamp with time zone,
  response_status integer,
  response_body text,
  error_message text,
  retry_count integer not null default 0,
  constraint status_check check (status in ('pending', 'success', 'failed', 'retrying'))
);

-- Create indexes for webhook events
create index webhook_events_webhook_id_idx on webhook_events(webhook_id);
create index webhook_events_status_idx on webhook_events(status);
create index webhook_events_created_at_idx on webhook_events(created_at);

-- API Keys Table
create table api_keys (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  key_hash text not null unique,
  created_at timestamp with time zone not null default now(),
  expires_at timestamp with time zone,
  last_used_at timestamp with time zone,
  is_active boolean not null default true,
  permissions text[] not null default array[]::text[],
  created_by uuid references auth.users(id) on delete set null
);

-- Create indexes for API keys
create index api_keys_is_active_idx on api_keys(is_active);
create index api_keys_key_hash_idx on api_keys(key_hash);

-- API Request Log
create table api_requests (
  id uuid primary key default gen_random_uuid(),
  api_key_id uuid references api_keys(id) on delete set null,
  method text not null,
  path text not null,
  status_code integer not null,
  ip_address text,
  user_agent text,
  created_at timestamp with time zone not null default now(),
  response_time_ms integer,
  error_message text
);

-- Create indexes for API requests
create index api_requests_api_key_id_idx on api_requests(api_key_id);
create index api_requests_created_at_idx on api_requests(created_at);

-- Rate Limiting Table
create table rate_limits (
  id uuid primary key default gen_random_uuid(),
  api_key_id uuid references api_keys(id) on delete cascade,
  endpoint text not null,
  requests_count integer not null default 0,
  window_start timestamp with time zone not null default now(),
  window_size_minutes integer not null default 60,
  max_requests integer not null default 1000,
  unique(api_key_id, endpoint)
);

-- Create indexes for rate limits
create index rate_limits_window_start_idx on rate_limits(window_start);

-- Functions and Triggers

-- Function to update last_modified on calendar events
create or replace function update_last_modified()
returns trigger as $$
begin
  new.last_modified = now();
  return new;
end;
$$ language plpgsql;

-- Trigger to update last_modified
create trigger update_calendar_events_last_modified
  before update on calendar_events
  for each row
  execute function update_last_modified();

-- Function to update last_used_at on API keys
create or replace function update_api_key_last_used()
returns trigger as $$
begin
  update api_keys
  set last_used_at = now()
  where id = new.api_key_id;
  return new;
end;
$$ language plpgsql;

-- Trigger to update API key last used timestamp
create trigger update_api_key_last_used_trigger
  after insert on api_requests
  for each row
  execute function update_api_key_last_used();