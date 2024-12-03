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
      calendar_events: {
        Row: {
          id: string
          title: string
          startTime: string
          endTime: string
          createdAt: string
        }
        Insert: {
          id?: string
          title: string
          startTime: string
          endTime: string
          createdAt?: string
        }
        Update: {
          id?: string
          title?: string
          startTime?: string
          endTime?: string
          createdAt?: string
        }
      }
      activity_logs: {
        Row: {
          id: string
          action: string
          details: string | null
          createdAt: string
        }
        Insert: {
          id?: string
          action: string
          details?: string | null
          createdAt?: string
        }
        Update: {
          id?: string
          action?: string
          details?: string | null
          createdAt?: string
        }
      }
      webhooks: {
        Row: {
          id: string
          url: string
          active: boolean
          createdAt: string
          lastTriggered: string | null
          name: string
          description: string | null
        }
        Insert: {
          id?: string
          url: string
          active?: boolean
          createdAt?: string
          lastTriggered?: string | null
          name: string
          description?: string | null
        }
        Update: {
          id?: string
          url?: string
          active?: boolean
          createdAt?: string
          lastTriggered?: string | null
          name?: string
          description?: string | null
        }
      }
      webhook_executions: {
        Row: {
          id: string
          webhook_id: string
          status: 'success' | 'failed' | 'pending'
          response_code: number | null
          response_body: string | null
          error_message: string | null
          executed_at: string
          execution_duration: string | null
        }
        Insert: {
          id?: string
          webhook_id: string
          status: 'success' | 'failed' | 'pending'
          response_code?: number | null
          response_body?: string | null
          error_message?: string | null
          executed_at?: string
          execution_duration?: string | null
        }
        Update: {
          id?: string
          webhook_id?: string
          status?: 'success' | 'failed' | 'pending'
          response_code?: number | null
          response_body?: string | null
          error_message?: string | null
          executed_at?: string
          execution_duration?: string | null
        }
      }
      calendar_sync_settings: {
        Row: {
          id: string
          provider: 'google' | 'outlook' | 'ical'
          calendar_id: string
          sync_token: string | null
          last_synced: string | null
          sync_frequency: string
          is_active: boolean
          created_at: string
          settings: Json
        }
        Insert: {
          id?: string
          provider: 'google' | 'outlook' | 'ical'
          calendar_id: string
          sync_token?: string | null
          last_synced?: string | null
          sync_frequency?: string
          is_active?: boolean
          created_at?: string
          settings?: Json
        }
        Update: {
          id?: string
          provider?: 'google' | 'outlook' | 'ical'
          calendar_id?: string
          sync_token?: string | null
          last_synced?: string | null
          sync_frequency?: string
          is_active?: boolean
          created_at?: string
          settings?: Json
        }
      }
      calendar_sync_history: {
        Row: {
          id: string
          sync_setting_id: string
          status: 'success' | 'failed' | 'partial'
          events_added: number
          events_updated: number
          events_deleted: number
          error_message: string | null
          started_at: string
          completed_at: string | null
          duration: string | null
        }
        Insert: {
          id?: string
          sync_setting_id: string
          status: 'success' | 'failed' | 'partial'
          events_added?: number
          events_updated?: number
          events_deleted?: number
          error_message?: string | null
          started_at?: string
          completed_at?: string | null
          duration?: string | null
        }
        Update: {
          id?: string
          sync_setting_id?: string
          status?: 'success' | 'failed' | 'partial'
          events_added?: number
          events_updated?: number
          events_deleted?: number
          error_message?: string | null
          started_at?: string
          completed_at?: string | null
          duration?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_webhook_executions: {
        Args: {
          p_webhook_id: string
          p_limit?: number
        }
        Returns: {
          execution_id: string
          webhook_name: string
          status: string
          response_code: number | null
          error_message: string | null
          executed_at: string
          execution_duration: string | null
        }[]
      }
      log_activity: {
        Args: {
          action_text: string
          details_text?: string
        }
        Returns: void
      }
      record_webhook_execution: {
        Args: {
          p_webhook_id: string
          p_status: string
          p_response_code?: number
          p_response_body?: string
          p_error_message?: string
          p_execution_duration?: string
        }
        Returns: string
      }
      start_calendar_sync: {
        Args: {
          p_sync_setting_id: string
        }
        Returns: string
      }
      complete_calendar_sync: {
        Args: {
          p_sync_history_id: string
          p_status: string
          p_events_added?: number
          p_events_updated?: number
          p_events_deleted?: number
          p_error_message?: string
        }
        Returns: void
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
} 