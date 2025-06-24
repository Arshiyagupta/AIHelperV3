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
      users: {
        Row: {
          id: string
          email: string
          full_name: string
          invite_code: string
          partner_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name: string
          invite_code: string
          partner_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string
          invite_code?: string
          partner_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      connections: {
        Row: {
          id: string
          user_a_id: string
          user_b_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_a_id: string
          user_b_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_a_id?: string
          user_b_id?: string
          created_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          asker_id: string
          partner_id: string
          question_text: string
          created_at: string
          status: 'pending' | 'processing' | 'answered' | 'rejected' | 'red_flag'
          red_flag_detected: boolean
        }
        Insert: {
          id?: string
          asker_id: string
          partner_id: string
          question_text: string
          created_at?: string
          status?: 'pending' | 'processing' | 'answered' | 'rejected' | 'red_flag'
          red_flag_detected?: boolean
        }
        Update: {
          id?: string
          asker_id?: string
          partner_id?: string
          question_text?: string
          created_at?: string
          status?: 'pending' | 'processing' | 'answered' | 'rejected' | 'red_flag'
          red_flag_detected?: boolean
        }
      }
      reflections: {
        Row: {
          id: string
          question_id: string
          type: 'asker' | 'partner'
          content: Json
          created_at: string
        }
        Insert: {
          id?: string
          question_id: string
          type: 'asker' | 'partner'
          content: Json
          created_at?: string
        }
        Update: {
          id?: string
          question_id?: string
          type?: 'asker' | 'partner'
          content?: Json
          created_at?: string
        }
      }
      insights: {
        Row: {
          id: string
          question_id: string
          emotional_summary: string
          contextual_summary: string
          suggested_action: string
          created_at: string
        }
        Insert: {
          id?: string
          question_id: string
          emotional_summary: string
          contextual_summary: string
          suggested_action: string
          created_at?: string
        }
        Update: {
          id?: string
          question_id?: string
          emotional_summary?: string
          contextual_summary?: string
          suggested_action?: string
          created_at?: string
        }
      }
      red_flags: {
        Row: {
          id: string
          question_id: string
          trigger_phrase: string
          who_triggered: 'asker' | 'partner'
          timestamp: string
          action_taken: string
        }
        Insert: {
          id?: string
          question_id: string
          trigger_phrase: string
          who_triggered: 'asker' | 'partner'
          timestamp?: string
          action_taken: string
        }
        Update: {
          id?: string
          question_id?: string
          trigger_phrase?: string
          who_triggered?: 'asker' | 'partner'
          timestamp?: string
          action_taken?: string
        }
      }
      push_tokens: {
        Row: {
          user_id: string
          device_token: string
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          device_token: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          device_token?: string
          created_at?: string
          updated_at?: string
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
      question_status: 'pending' | 'processing' | 'answered' | 'rejected' | 'red_flag'
      reflection_type: 'asker' | 'partner'
      trigger_source: 'asker' | 'partner'
    }
  }
}