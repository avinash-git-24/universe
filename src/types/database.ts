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
          role: "student" | "runner" | "admin";
          account_status: "active" | "suspended";
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          enrollment_number?: string | null;
          role?: "student" | "runner" | "admin";
          account_status?: "active" | "suspended";
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          enrollment_number?: string | null;
          role?: "student" | "runner" | "admin";
          account_status?: "active" | "suspended";
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
          status: "pending" | "accepted" | "picked_up" | "in_transit" | "delivered" | "cancelled";
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
          status?: "pending" | "accepted" | "picked_up" | "in_transit" | "delivered" | "cancelled";
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
          status?: "pending" | "accepted" | "picked_up" | "in_transit" | "delivered" | "cancelled";
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
      conversations: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      conversation_participants: {
        Row: {
          conversation_id: string;
          profile_id: string;
          last_read_at: string | null;
        };
        Insert: {
          conversation_id: string;
          profile_id: string;
          last_read_at?: string | null;
        };
        Update: {
          conversation_id?: string;
          profile_id?: string;
          last_read_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversation_participants_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          status: "sent" | "delivered" | "read";
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          status?: "sent" | "delivered" | "read";
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          content?: string;
          status?: "sent" | "delivered" | "read";
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      transactions: {
        Row: {
          id: string;
          wallet_id: string;
          amount: number;
          type: "deposit" | "withdrawal" | "payment" | "earning" | "refund";
          status: "pending" | "completed" | "failed";
          reference_id: string | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          wallet_id: string;
          amount: number;
          type: "deposit" | "withdrawal" | "payment" | "earning" | "refund";
          status?: "pending" | "completed" | "failed";
          reference_id?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          wallet_id?: string;
          amount?: number;
          type?: "deposit" | "withdrawal" | "payment" | "earning" | "refund";
          status?: "pending" | "completed" | "failed";
          reference_id?: string | null;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_wallet_id_fkey";
            columns: ["wallet_id"];
            isOneToOne: false;
            referencedRelation: "wallets";
            referencedColumns: ["id"];
          }
        ];
      };
      wallets: {
        Row: {
          id: string;
          profile_id: string;
          balance: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          balance?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          balance?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wallets_profile_id_fkey";
            columns: ["profile_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: {
        Args: { user_id: string };
        Returns: boolean;
      };
      is_conversation_participant: {
        Args: { conv_id: string; usr_id: string };
        Returns: boolean;
      };
      mock_deposit: {
        Args: { user_id: string; deposit_amount: number };
        Returns: {
          id: string;
          profile_id: string;
          balance: number;
          created_at: string;
          updated_at: string;
        };
      };
    };
    Enums: {
      user_role: "student" | "runner" | "admin";
      request_status: "pending" | "accepted" | "picked_up" | "in_transit" | "delivered" | "cancelled";
      assignment_status: "active" | "completed" | "cancelled";
      message_status: "sent" | "delivered" | "read";
      account_status: "active" | "suspended" | "pending";
      transaction_type: "deposit" | "withdrawal" | "payment" | "earning" | "refund";
      transaction_status: "pending" | "completed" | "failed";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
