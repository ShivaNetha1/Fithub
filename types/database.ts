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
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          phone: string | null;
          avatar_url: string | null;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          phone?: string | null;
          avatar_url?: string | null;
          onboarding_completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          full_name?: string;
          phone?: string | null;
          avatar_url?: string | null;
          onboarding_completed?: boolean;
          updated_at?: string;
        };
        Relationships: [];
      };
      gyms: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          email: string | null;
          phone: string | null;
          address_line1: string | null;
          address_line2: string | null;
          city: string | null;
          state: string | null;
          postal_code: string | null;
          country: string;
          timezone: string;
          currency_code: string;
          settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          state?: string | null;
          postal_code?: string | null;
          country?: string;
          timezone?: string;
          currency_code?: string;
          settings?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          email?: string | null;
          phone?: string | null;
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          state?: string | null;
          postal_code?: string | null;
          country?: string;
          timezone?: string;
          currency_code?: string;
          settings?: Json;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "gyms_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      membership_plans: {
        Row: {
          id: string;
          gym_id: string;
          name: string;
          plan_type: Database["public"]["Enums"]["membership_plan_type"];
          duration_months: number;
          price: number;
          description: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          name: string;
          plan_type: Database["public"]["Enums"]["membership_plan_type"];
          duration_months: number;
          price: number;
          description?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          plan_type?: Database["public"]["Enums"]["membership_plan_type"];
          duration_months?: number;
          price?: number;
          description?: string | null;
          is_active?: boolean;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "membership_plans_gym_id_fkey";
            columns: ["gym_id"];
            isOneToOne: false;
            referencedRelation: "gyms";
            referencedColumns: ["id"];
          }
        ];
      };
      members: {
        Row: {
          id: string;
          gym_id: string;
          member_code: string;
          full_name: string;
          phone: string;
          email: string | null;
          gender: Database["public"]["Enums"]["gym_member_gender"] | null;
          date_of_birth: string | null;
          address: string | null;
          emergency_contact_name: string | null;
          emergency_contact_phone: string | null;
          join_date: string;
          account_status: Database["public"]["Enums"]["member_account_status"];
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          member_code: string;
          full_name: string;
          phone: string;
          email?: string | null;
          gender?: Database["public"]["Enums"]["gym_member_gender"] | null;
          date_of_birth?: string | null;
          address?: string | null;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          join_date?: string;
          account_status?: Database["public"]["Enums"]["member_account_status"];
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          member_code?: string;
          full_name?: string;
          phone?: string;
          email?: string | null;
          gender?: Database["public"]["Enums"]["gym_member_gender"] | null;
          date_of_birth?: string | null;
          address?: string | null;
          emergency_contact_name?: string | null;
          emergency_contact_phone?: string | null;
          join_date?: string;
          account_status?: Database["public"]["Enums"]["member_account_status"];
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "members_gym_id_fkey";
            columns: ["gym_id"];
            isOneToOne: false;
            referencedRelation: "gyms";
            referencedColumns: ["id"];
          }
        ];
      };
      subscriptions: {
        Row: {
          id: string;
          gym_id: string;
          member_id: string;
          plan_id: string;
          renewal_of_subscription_id: string | null;
          start_date: string;
          end_date: string;
          status: Database["public"]["Enums"]["subscription_status"];
          base_amount: number;
          discount_amount: number;
          total_amount: number;
          amount_paid: number;
          balance_amount: number;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          member_id: string;
          plan_id: string;
          renewal_of_subscription_id?: string | null;
          start_date: string;
          end_date: string;
          status?: Database["public"]["Enums"]["subscription_status"];
          base_amount: number;
          discount_amount?: number;
          amount_paid?: number;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          plan_id?: string;
          renewal_of_subscription_id?: string | null;
          start_date?: string;
          end_date?: string;
          status?: Database["public"]["Enums"]["subscription_status"];
          base_amount?: number;
          discount_amount?: number;
          amount_paid?: number;
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "subscriptions_gym_id_fkey";
            columns: ["gym_id"];
            isOneToOne: false;
            referencedRelation: "gyms";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "subscriptions_member_id_fkey";
            columns: ["member_id"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "subscriptions_plan_id_fkey";
            columns: ["plan_id"];
            isOneToOne: false;
            referencedRelation: "membership_plans";
            referencedColumns: ["id"];
          }
        ];
      };
      payments: {
        Row: {
          id: string;
          gym_id: string;
          member_id: string;
          subscription_id: string | null;
          amount: number;
          payment_date: string;
          method: Database["public"]["Enums"]["payment_method"];
          status: Database["public"]["Enums"]["payment_status"];
          reference_number: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          member_id: string;
          subscription_id?: string | null;
          amount: number;
          payment_date?: string;
          method?: Database["public"]["Enums"]["payment_method"];
          status?: Database["public"]["Enums"]["payment_status"];
          reference_number?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          subscription_id?: string | null;
          amount?: number;
          payment_date?: string;
          method?: Database["public"]["Enums"]["payment_method"];
          status?: Database["public"]["Enums"]["payment_status"];
          reference_number?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payments_member_id_fkey";
            columns: ["member_id"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          }
        ];
      };
      attendance: {
        Row: {
          id: string;
          gym_id: string;
          member_id: string;
          attendance_date: string;
          status: Database["public"]["Enums"]["attendance_status"];
          check_in_time: string | null;
          check_out_time: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          member_id: string;
          attendance_date?: string;
          status?: Database["public"]["Enums"]["attendance_status"];
          check_in_time?: string | null;
          check_out_time?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          attendance_date?: string;
          status?: Database["public"]["Enums"]["attendance_status"];
          check_in_time?: string | null;
          check_out_time?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "attendance_member_id_fkey";
            columns: ["member_id"];
            isOneToOne: false;
            referencedRelation: "members";
            referencedColumns: ["id"];
          }
        ];
      };
      activity_logs: {
        Row: {
          id: string;
          gym_id: string | null;
          actor_user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          metadata: Json;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          gym_id?: string | null;
          actor_user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          metadata?: Json;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          metadata?: Json;
          updated_at?: string;
        };
        Relationships: [];
      };
      analytics_summary: {
        Row: {
          id: string;
          gym_id: string;
          period: Database["public"]["Enums"]["analytics_period"];
          period_start: string;
          period_end: string;
          total_members: number;
          active_members: number;
          expired_members: number;
          attendance_count: number;
          revenue_amount: number;
          pending_amount: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          gym_id: string;
          period: Database["public"]["Enums"]["analytics_period"];
          period_start: string;
          period_end: string;
          total_members?: number;
          active_members?: number;
          expired_members?: number;
          attendance_count?: number;
          revenue_amount?: number;
          pending_amount?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          period_start?: string;
          period_end?: string;
          total_members?: number;
          active_members?: number;
          expired_members?: number;
          attendance_count?: number;
          revenue_amount?: number;
          pending_amount?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      member_membership_status: {
        Row: {
          member_id: string;
          gym_id: string;
          member_code: string;
          full_name: string;
          phone: string;
          email: string | null;
          account_status: Database["public"]["Enums"]["member_account_status"];
          subscription_id: string | null;
          plan_id: string | null;
          plan_name: string | null;
          start_date: string | null;
          end_date: string | null;
          computed_subscription_status: Database["public"]["Enums"]["subscription_status"];
          balance_amount: number;
        };
      };
      dashboard_summary: {
        Row: {
          gym_id: string;
          total_members: number;
          active_members: number;
          expired_members: number;
          expiring_soon_members: number;
          month_revenue: number;
          pending_payments: number;
          today_attendance: number;
        };
      };
    };
    Functions: {
      create_default_membership_plans: {
        Args: {
          target_gym_id: string;
        };
        Returns: undefined;
      };
    };
    Enums: {
      gym_member_gender: "male" | "female" | "other" | "prefer_not_to_say";
      member_account_status: "active" | "inactive" | "archived";
      membership_plan_type:
        | "monthly"
        | "quarterly"
        | "half_yearly"
        | "yearly"
        | "custom";
      subscription_status: "active" | "expired" | "cancelled" | "upcoming";
      payment_method:
        | "cash"
        | "card"
        | "upi"
        | "bank_transfer"
        | "cheque"
        | "other";
      payment_status: "completed" | "pending" | "failed" | "refunded";
      attendance_status: "present" | "absent";
      analytics_period: "daily" | "weekly" | "monthly" | "yearly";
    };
    CompositeTypes: Record<string, never>;
  };
};
