export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string | null;
          avatar_url?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          framework: string | null;
          language: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          framework?: string | null;
          language?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          description?: string | null;
          framework?: string | null;
          language?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      project_files: {
        Row: {
          id: string;
          project_id: string;
          file_path: string;
          content: string | null;
          file_hash: string | null;
          file_size: number | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          file_path: string;
          content?: string | null;
          file_hash?: string | null;
          file_size?: number | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          content?: string | null;
          file_hash?: string | null;
          file_size?: number | null;
          metadata?: Json | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      conversations: {
        Row: {
          id: string;
          project_id: string;
          user_id: string;
          title: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          user_id: string;
          title: string;
          created_at?: string;
        };
        Update: {
          title?: string;
        };
        Relationships: [];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: string;
          content: string;
          token_usage: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: string;
          content: string;
          token_usage?: Json | null;
          created_at?: string;
        };
        Update: {
          content?: string;
          token_usage?: Json | null;
        };
        Relationships: [];
      };
      agent_tasks: {
        Row: {
          id: string;
          project_id: string;
          conversation_id: string | null;
          task_description: string;
          status: string;
          execution_plan: Json | null;
          result: Json | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          conversation_id?: string | null;
          task_description: string;
          status?: string;
          execution_plan?: Json | null;
          result?: Json | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          status?: string;
          execution_plan?: Json | null;
          result?: Json | null;
          completed_at?: string | null;
        };
        Relationships: [];
      };
      token_usage: {
        Row: {
          id: string;
          user_id: string;
          project_id: string | null;
          task_id: string | null;
          model_name: string;
          input_tokens: number;
          output_tokens: number;
          cached_tokens: number;
          estimated_cost: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          project_id?: string | null;
          task_id?: string | null;
          model_name: string;
          input_tokens: number;
          output_tokens: number;
          cached_tokens?: number;
          estimated_cost: number;
          created_at?: string;
        };
        Update: {
          model_name?: string;
          input_tokens?: number;
          output_tokens?: number;
          cached_tokens?: number;
          estimated_cost?: number;
        };
        Relationships: [];
      };
      agent_memory: {
        Row: {
          id: string;
          project_id: string;
          memory_type: string;
          content: string;
          source_hash: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          memory_type: string;
          content: string;
          source_hash?: string | null;
          updated_at?: string;
        };
        Update: {
          content?: string;
          source_hash?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      benchmark_runs: {
        Row: {
          id: string;
          user_id: string;
          task_name: string;
          workflow_type: string;
          model_name: string;
          input_tokens: number;
          output_tokens: number;
          cached_tokens: number;
          task_success: boolean;
          test_results: Json | null;
          execution_time: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          task_name: string;
          workflow_type: string;
          model_name: string;
          input_tokens: number;
          output_tokens: number;
          cached_tokens?: number;
          task_success: boolean;
          test_results?: Json | null;
          execution_time: number;
          created_at?: string;
        };
        Update: {
          task_success?: boolean;
          test_results?: Json | null;
          execution_time?: number;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
