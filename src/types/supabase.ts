export interface Database {
  public: {
    Tables: {
      events: {
        Row: {
          id: string
          title: string
          startTime: string
          endTime: string
          location: string | null
          description: string | null
          createdAt: string
        }
        Insert: {
          id?: string
          title: string
          startTime: string
          endTime: string
          location?: string | null
          description?: string | null
          createdAt?: string
        }
        Update: {
          id?: string
          title?: string
          startTime?: string
          endTime?: string
          location?: string | null
          description?: string | null
          createdAt?: string
        }
      }
      webhooks: {
        Row: {
          id: string
          name: string
          url: string
          active: boolean
          description: string | null
          createdAt: string
          lastTriggered: string | null
        }
        Insert: {
          id?: string
          name: string
          url: string
          active?: boolean
          description?: string | null
          createdAt?: string
          lastTriggered?: string | null
        }
        Update: {
          id?: string
          name?: string
          url?: string
          active?: boolean
          description?: string | null
          createdAt?: string
          lastTriggered?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 