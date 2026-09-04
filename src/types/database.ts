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
          department: string | null;
          semester: string | null;
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
          department?: string | null;
          semester?: string | null;
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
          department?: string | null;
          semester?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_settings: {
        Row: {
          user_id: string;
          notify_request_updates: boolean;
          notify_delivery_updates: boolean;
          notify_chat_messages: boolean;
          profile_visibility: string;
          activity_visibility: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          notify_request_updates?: boolean;
          notify_delivery_updates?: boolean;
          notify_chat_messages?: boolean;
          profile_visibility?: string;
          activity_visibility?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          notify_request_updates?: boolean;
          notify_delivery_updates?: boolean;
          notify_chat_messages?: boolean;
          profile_visibility?: string;
          activity_visibility?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
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
          linked_listing_id: string | null;
          delivery_otp: string | null;
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
          linked_listing_id?: string | null;
          delivery_otp?: string | null;
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
          linked_listing_id?: string | null;
          delivery_otp?: string | null;
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
          created_at: string;
          id: string;
          request_id: string | null;
          listing_id: string | null;
          buyer_id: string | null;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          request_id?: string | null;
          listing_id?: string | null;
          buyer_id?: string | null;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          request_id?: string | null;
          listing_id?: string | null;
          buyer_id?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversations_request_id_fkey";
            columns: ["request_id"];
            isOneToOne: false;
            referencedRelation: "delivery_requests";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversations_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "resale_listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversations_buyer_id_fkey";
            columns: ["buyer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
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
          image_url: string | null;
          message_type: string;
          metadata: Json | null;
          status: "sent" | "delivered" | "read";
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          image_url?: string | null;
          message_type?: string;
          metadata?: Json | null;
          status?: "sent" | "delivered" | "read";
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          content?: string;
          image_url?: string | null;
          message_type?: string;
          metadata?: Json | null;
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
      resale_listing_images: {
        Row: {
          id: string
          listing_id: string
          storage_path: string
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          storage_path: string
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          storage_path?: string
          display_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resale_listing_images_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "resale_listings"
            referencedColumns: ["id"]
          }
        ]
      };
      resale_listings: {
        Row: {
          id: string
          seller_id: string
          title: string
          description: string | null
          category: string
          condition: string
          price: number
          original_price: number | null
          negotiable: boolean
          pickup_location: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          title: string
          description?: string | null
          category: string
          condition: string
          price: number
          original_price?: number | null
          negotiable?: boolean
          pickup_location?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          seller_id?: string
          title?: string
          description?: string | null
          category?: string
          condition?: string
          price?: number
          original_price?: number | null
          negotiable?: boolean
          pickup_location?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resale_listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      };
      resale_offers: {
        Row: {
          id: string
          listing_id: string
          buyer_id: string
          seller_id: string
          offer_price: number
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          buyer_id: string
          seller_id: string
          offer_price: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          buyer_id?: string
          seller_id?: string
          offer_price?: number
          status?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resale_offers_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "resale_listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resale_offers_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resale_offers_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          }
        ]
      };
      escrow_holds: {
        Row: {
          id: string
          buyer_id: string
          wallet_id: string
          target_listing_id: string
          item_price: number
          delivery_fee: number
          status: "held" | "released" | "refunded"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          buyer_id: string
          wallet_id: string
          target_listing_id: string
          item_price: number
          delivery_fee: number
          status?: "held" | "released" | "refunded"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          buyer_id?: string
          wallet_id?: string
          target_listing_id?: string
          item_price?: number
          delivery_fee?: number
          status?: "held" | "released" | "refunded"
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "escrow_holds_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escrow_holds_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escrow_holds_target_listing_id_fkey"
            columns: ["target_listing_id"]
            isOneToOne: false
            referencedRelation: "resale_listings"
            referencedColumns: ["id"]
          }
        ]
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_delivery_conversation: {
        Args: {
          p_other_user_id: string;
          p_request_id?: string | null;
        };
        Returns: string;
      };
      create_marketplace_conversation: {
        Args: {
          p_listing_id: string;
        };
        Returns: string;
      };
      delete_own_account: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
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
      checkout_resale_offer_with_delivery: {
        Args: {
          p_offer_id: string
          p_dropoff_location: string
          p_pickup_location: string
        }
        Returns: string
      };
      send_message_safe: {
        Args: {
          p_conversation_id: string;
          p_content: string;
          p_image_url?: string | null;
          p_message_type?: string;
          p_metadata?: Record<string, unknown> | null;
        };
        Returns: {
          id: string;
          conversation_id: string;
          sender_id: string;
          content: string;
          image_url: string | null;
          message_type: string;
          metadata: Record<string, unknown> | null;
          status: string;
          created_at: string;
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
      escrow_status: "held" | "released" | "refunded";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
