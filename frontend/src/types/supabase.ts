export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          email: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          email?: string | null;
        };
        Update: {
          display_name?: string | null;
          email?: string | null;
          updated_at?: string | null;
        };
      };
      device_nicknames: {
        Row: {
          id: number;
          user_id: string;
          device_id: string;
          nickname: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          device_id: string;
          nickname: string;
        };
        Update: {
          nickname?: string;
        };
      };
      settings: {
        Row: {
          id: number;
          user_id: string;
          audio_quality: string | null;
          reduce_motion: boolean | null;
          last_selected_output_ids: string[] | null;
          updated_at: string | null;
        };
        Insert: {
          user_id: string;
          audio_quality?: string | null;
          reduce_motion?: boolean | null;
          last_selected_output_ids?: string[] | null;
        };
        Update: {
          audio_quality?: string | null;
          reduce_motion?: boolean | null;
          last_selected_output_ids?: string[] | null;
          updated_at?: string | null;
        };
      };
    };
  };
}
