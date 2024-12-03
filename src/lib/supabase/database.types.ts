export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      api_keys: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          key_hash: string
          permissions: string[]
          is_active: boolean
          expires_at: string | null
          last_used_at: string | null
          rate_limit: number
          rate_limit_window: string
          metadata: Json
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          key_hash: string
          permissions: string[]
          is_active?: boolean
          expires_at?: string | null
          last_used_at?: string | null
          rate_limit?: number
          rate_limit_window?: string
          metadata?: Json
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          key_hash?: string
          permissions?: string[]
          is_active?: boolean
          expires_at?: string | null
          last_used_at?: string | null
          rate_limit?: number
          rate_limit_window?: string
          metadata?: Json
        }
      }
      api_key_usage: {
        Row: {
          id: string
          created_at: string
          api_key_id: string
          endpoint: string
          method: string
          status_code: number
          response_time: number
          metadata: Json
        }
        Insert: {
          id?: string
          created_at?: string
          api_key_id: string
          endpoint: string
          method: string
          status_code: number
          response_time: number
          metadata?: Json
        }
        Update: {
          id?: string
          created_at?: string
          api_key_id?: string
          endpoint?: string
          method?: string
          status_code?: number
          response_time?: number
          metadata?: Json
        }
      }
      calendar_events: {
        Row: {
          id: string
          event_id: string | null
          title: string
          description: string | null
          location: string | null
          start_date: string
          start_time: string | null
          end_date: string
          end_time: string | null
          last_updated: string
          status: 'pending' | 'in_transit' | 'delivered' | 'cancelled'
          tracking_number: string | null
          tracking_link: string | null
          last_tracked: string | null
          service: 'UPS' | 'FedEx' | 'USPS' | 'Other' | null
          tp_id: string | null
          state_abbreviation: string | null
          created_at: string
          user_id: string
          metadata: Json
        }
        Insert: {
          id?: string
          event_id?: string | null
          title: string
          description?: string | null
          location?: string | null
          start_date: string
          start_time?: string | null
          end_date: string
          end_time?: string | null
          last_updated?: string
          status?: 'pending' | 'in_transit' | 'delivered' | 'cancelled'
          tracking_number?: string | null
          tracking_link?: string | null
          last_tracked?: string | null
          service?: 'UPS' | 'FedEx' | 'USPS' | 'Other' | null
          tp_id?: string | null
          state_abbreviation?: string | null
          created_at?: string
          user_id: string
          metadata?: Json
        }
        Update: {
          id?: string
          event_id?: string | null
          title?: string
          description?: string | null
          location?: string | null
          start_date?: string
          start_time?: string | null
          end_date?: string
          end_time?: string | null
          last_updated?: string
          status?: 'pending' | 'in_transit' | 'delivered' | 'cancelled'
          tracking_number?: string | null
          tracking_link?: string | null
          last_tracked?: string | null
          service?: 'UPS' | 'FedEx' | 'USPS' | 'Other' | null
          tp_id?: string | null
          state_abbreviation?: string | null
          created_at?: string
          user_id?: string
          metadata?: Json
        }
      }
      webhooks: {
        Row: {
          id: string
          name: string
          url: string
          secret: string | null
          active: boolean
          description: string | null
          created_at: string
          last_triggered: string | null
          failure_count: number
          events: string[]
          headers: Json
          retry_count: number
          timeout_ms: number
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          url: string
          secret?: string | null
          active?: boolean
          description?: string | null
          created_at?: string
          last_triggered?: string | null
          failure_count?: number
          events?: string[]
          headers?: Json
          retry_count?: number
          timeout_ms?: number
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          url?: string
          secret?: string | null
          active?: boolean
          description?: string | null
          created_at?: string
          last_triggered?: string | null
          failure_count?: number
          events?: string[]
          headers?: Json
          retry_count?: number
          timeout_ms?: number
          user_id?: string
        }
      }
      webhook_events: {
        Row: {
          id: string
          webhook_id: string
          event_type: string
          payload: Json
          status: 'success' | 'failed' | 'pending' | 'retrying'
          created_at: string
          processed_at: string | null
          response_status: number | null
          response_body: string | null
          error_message: string | null
          retry_count: number
          user_id: string
        }
        Insert: {
          id?: string
          webhook_id: string
          event_type: string
          payload: Json
          status?: 'success' | 'failed' | 'pending' | 'retrying'
          created_at?: string
          processed_at?: string | null
          response_status?: number | null
          response_body?: string | null
          error_message?: string | null
          retry_count?: number
          user_id: string
        }
        Update: {
          id?: string
          webhook_id?: string
          event_type?: string
          payload?: Json
          status?: 'success' | 'failed' | 'pending' | 'retrying'
          created_at?: string
          processed_at?: string | null
          response_status?: number | null
          response_body?: string | null
          error_message?: string | null
          retry_count?: number
          user_id?: string
        }
      }
      api_requests: {
        Row: {
          id: string
          api_key_id: string | null
          method: string
          path: string
          status_code: number
          ip_address: string | null
          user_agent: string | null
          created_at: string
          response_time_ms: number | null
          error_message: string | null
          user_id: string
        }
        Insert: {
          id?: string
          api_key_id?: string | null
          method: string
          path: string
          status_code: number
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          response_time_ms?: number | null
          error_message?: string | null
          user_id: string
        }
        Update: {
          id?: string
          api_key_id?: string | null
          method?: string
          path?: string
          status_code?: number
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          response_time_ms?: number | null
          error_message?: string | null
          user_id?: string
        }
      }
      rate_limits: {
        Row: {
          id: string
          api_key_id: string
          endpoint: string
          requests_count: number
          window_start: string
          window_size_minutes: number
          max_requests: number
          user_id: string
        }
        Insert: {
          id?: string
          api_key_id: string
          endpoint: string
          requests_count?: number
          window_start?: string
          window_size_minutes?: number
          max_requests?: number
          user_id: string
        }
        Update: {
          id?: string
          api_key_id?: string
          endpoint?: string
          requests_count?: number
          window_start?: string
          window_size_minutes?: number
          max_requests?: number
          user_id?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          action: string
          details: string | null
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          action: string
          details?: string | null
          created_at?: string
          user_id: string
        }
        Update: {
          id?: string
          action?: string
          details?: string | null
          created_at?: string
          user_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      parse_tracking_info: {
        Args: { description: string }
        Returns: { tracking_number: string; tracking_link: string }[]
      }
      detect_shipping_service: {
        Args: { title: string }
        Returns: 'UPS' | 'FedEx' | 'USPS' | 'Other'
      }
      extract_state_abbreviation: {
        Args: { title: string }
        Returns: string | null
      }
      process_calendar_event: {
        Args: {
          p_event_id: string
          p_title: string
          p_description: string
          p_start_date: string
          p_start_time: string
          p_end_date: string
          p_end_time: string
          p_status?: 'pending' | 'in_transit' | 'delivered' | 'cancelled'
        }
        Returns: string
      }
    }
    Enums: {
      webhook_status: 'success' | 'failed' | 'pending' | 'retrying'
      sync_status: 'success' | 'failed' | 'partial'
      calendar_provider: 'google' | 'outlook' | 'ical'
      shipping_service: 'UPS' | 'FedEx' | 'USPS' | 'Other'
      delivery_status: 'pending' | 'in_transit' | 'delivered' | 'cancelled'
    }
  }
} 