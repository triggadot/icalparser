export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type CalendarEventRow = {
  id: string;
  summary: string;
  description: string | null;
  location: string | null;
  start_date: string;
  end_date: string;
  created_at: string;
  last_modified: string;
  status: string;
  organizer: string | null;
  sync_status: 'pending' | 'synced' | 'failed';
  tracking_number: string | null;
  tracking_link: string | null;
  service: string | null;
  state_abbreviation: string | null;
};

export type WebhookRow = {
  id: string;
  name: string;
  url: string;
  secret: string | null;
  is_active: boolean;
  created_at: string;
  last_triggered: string | null;
  failure_count: number;
  events: string[];
  headers: Json | null;
  retry_count: number;
  timeout_ms: number;
};

export type WebhookEventRow = {
  id: string;
  webhook_id: string;
  event_type: string;
  payload: Json;
  status: 'pending' | 'success' | 'failed' | 'retrying';
  created_at: string;
  processed_at: string | null;
  response_status: number | null;
  response_body: string | null;
  error_message: string | null;
  retry_count: number;
};

export type ApiKeyRow = {
  id: string;
  name: string;
  key_hash: string;
  created_at: string;
  expires_at: string | null;
  last_used_at: string | null;
  is_active: boolean;
  permissions: string[];
  created_by: string | null;
};

export type ApiRequestRow = {
  id: string;
  api_key_id: string | null;
  method: string;
  path: string;
  status_code: number;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  response_time_ms: number | null;
  error_message: string | null;
};

export type RateLimitRow = {
  id: string;
  api_key_id: string;
  endpoint: string;
  requests_count: number;
  window_start: string;
  window_size_minutes: number;
  max_requests: number;
};

export interface Database {
  calendar_events: CalendarEventRow;
  webhooks: WebhookRow;
  webhook_events: WebhookEventRow;
  api_keys: ApiKeyRow;
  api_requests: ApiRequestRow;
  rate_limits: RateLimitRow;
} 