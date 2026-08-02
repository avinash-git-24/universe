export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          enrollment_number: string | null;
          role: "student" | "runner";
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          enrollment_number?: string | null;
          role?: "student" | "runner";
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          enrollment_number?: string | null;
          role?: "student" | "runner";
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      delivery_requests: {
        Row: {
          id: string;
          requester_id: string;
          status: "pending" | "accepted" | "picked_up" | "delivered" | "cancelled";
          pickup_location: string;
          dropoff_location: string;
          instructions: string | null;
          total_estimated_amount: number;
          delivery_fee: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          requester_id: string;
          status?: "pending" | "accepted" | "picked_up" | "delivered" | "cancelled";
          pickup_location: string;
          dropoff_location: string;
          instructions?: string | null;
          total_estimated_amount?: number;
          delivery_fee?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          requester_id?: string;
          status?: "pending" | "accepted" | "picked_up" | "delivered" | "cancelled";
          pickup_location?: string;
          dropoff_location?: string;
          instructions?: string | null;
          total_estimated_amount?: number;
          delivery_fee?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      request_items: {
        Row: {
          id: string;
          request_id: string;
          name: string;
          quantity: number;
          notes: string | null;
          estimated_price: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          request_id: string;
          name: string;
          quantity?: number;
          notes?: string | null;
          estimated_price?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          request_id?: string;
          name?: string;
          quantity?: number;
          notes?: string | null;
          estimated_price?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      delivery_assignments: {
        Row: {
          id: string;
          request_id: string;
          runner_id: string;
          status: "active" | "completed" | "cancelled";
          assigned_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          request_id: string;
          runner_id: string;
          status?: "active" | "completed" | "cancelled";
          assigned_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          request_id?: string;
          runner_id?: string;
          status?: "active" | "completed" | "cancelled";
          assigned_at?: string;
          completed_at?: string | null;
        };
        Relationships: [];
      };
      ratings: {
        Row: {
          id: string;
          request_id: string | null;
          rater_id: string;
          ratee_id: string;
          score: number;
          comment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          request_id?: string | null;
          rater_id: string;
          ratee_id: string;
          score: number;
          comment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          request_id?: string | null;
          rater_id?: string;
          ratee_id?: string;
          score?: number;
          comment?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          is_read: boolean;
          reference_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          type: string;
          is_read?: boolean;
          reference_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          message?: string;
          type?: string;
          is_read?: boolean;
          reference_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: "student" | "runner";
      request_status: "pending" | "accepted" | "picked_up" | "delivered" | "cancelled";
      assignment_status: "active" | "completed" | "cancelled";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
