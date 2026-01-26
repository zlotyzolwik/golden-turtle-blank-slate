export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          replied_at: string | null
          status: string | null
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          replied_at?: string | null
          status?: string | null
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          replied_at?: string | null
          status?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      gallery_images: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          image_path: string
          image_url: string
          is_active: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_path: string
          image_url: string
          is_active?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_path?: string
          image_url?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          reservation_id: string | null
          status: string
          stripe_payment_intent_id: string | null
          type: string
          updated_at: string
          voucher_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          reservation_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          type: string
          updated_at?: string
          voucher_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          reservation_id?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          type?: string
          updated_at?: string
          voucher_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_voucher_id_fkey"
            columns: ["voucher_id"]
            isOneToOne: false
            referencedRelation: "vouchers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          created_at: string
          customer_email: string
          customer_id: string | null
          customer_name: string
          customer_phone: string | null
          id: string
          notes: string | null
          number_of_people: number
          payment_status: string | null
          status: string | null
          stripe_payment_intent_id: string | null
          total_price: number
          trip_id: string | null
          updated_at: string
          user_id: string | null
          voucher_code_used: string | null
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_id?: string | null
          customer_name: string
          customer_phone?: string | null
          id?: string
          notes?: string | null
          number_of_people?: number
          payment_status?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          total_price: number
          trip_id?: string | null
          updated_at?: string
          user_id?: string | null
          voucher_code_used?: string | null
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string | null
          id?: string
          notes?: string | null
          number_of_people?: number
          payment_status?: string | null
          status?: string | null
          stripe_payment_intent_id?: string | null
          total_price?: number
          trip_id?: string | null
          updated_at?: string
          user_id?: string | null
          voucher_code_used?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_reservations_voucher_code"
            columns: ["voucher_code_used"]
            isOneToOne: false
            referencedRelation: "vouchers"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "reservations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservations_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          available_spots: number | null
          created_at: string
          currency: string | null
          departure_date: string | null
          description: string | null
          destination: string
          detailed_description: string | null
          featured_image: string | null
          gallery_images: string[] | null
          id: string
          is_active: boolean | null
          itinerary: Json | null
          location_lat: number | null
          location_lng: number | null
          pickup_locations: string | null
          price: number
          return_date: string | null
          title: string
          total_spots: number | null
          updated_at: string
        }
        Insert: {
          available_spots?: number | null
          created_at?: string
          currency?: string | null
          departure_date?: string | null
          description?: string | null
          destination: string
          detailed_description?: string | null
          featured_image?: string | null
          gallery_images?: string[] | null
          id?: string
          is_active?: boolean | null
          itinerary?: Json | null
          location_lat?: number | null
          location_lng?: number | null
          pickup_locations?: string | null
          price: number
          return_date?: string | null
          title: string
          total_spots?: number | null
          updated_at?: string
        }
        Update: {
          available_spots?: number | null
          created_at?: string
          currency?: string | null
          departure_date?: string | null
          description?: string | null
          destination?: string
          detailed_description?: string | null
          featured_image?: string | null
          gallery_images?: string[] | null
          id?: string
          is_active?: boolean | null
          itinerary?: Json | null
          location_lat?: number | null
          location_lng?: number | null
          pickup_locations?: string | null
          price?: number
          return_date?: string | null
          title?: string
          total_spots?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      vouchers: {
        Row: {
          amount: number
          buyer_email: string | null
          code: string
          created_at: string
          currency: string | null
          customer_id: string | null
          expires_at: string | null
          id: string
          message: string | null
          recipient_email: string | null
          recipient_name: string | null
          sender_name: string | null
          status: string | null
          used_at: string | null
        }
        Insert: {
          amount: number
          buyer_email?: string | null
          code: string
          created_at?: string
          currency?: string | null
          customer_id?: string | null
          expires_at?: string | null
          id?: string
          message?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          sender_name?: string | null
          status?: string | null
          used_at?: string | null
        }
        Update: {
          amount?: number
          buyer_email?: string | null
          code?: string
          created_at?: string
          currency?: string | null
          customer_id?: string | null
          expires_at?: string | null
          id?: string
          message?: string | null
          recipient_email?: string | null
          recipient_name?: string | null
          sender_name?: string | null
          status?: string | null
          used_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vouchers_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_admin_profile: {
        Args: { user_email: string; user_uuid: string }
        Returns: undefined
      }
      create_or_get_customer: {
        Args: { p_email: string; p_name: string; p_phone?: string }
        Returns: string
      }
      create_reservation_guest: {
        Args: {
          p_customer_email: string
          p_customer_name: string
          p_customer_phone?: string
          p_notes?: string
          p_number_of_people?: number
          p_total_price: number
          p_trip_id: string
        }
        Returns: {
          message: string
          reservation_id: string
          success: boolean
        }[]
      }
      create_reservation_secure: {
        Args: {
          p_customer_email: string
          p_customer_name: string
          p_customer_phone?: string
          p_notes?: string
          p_number_of_people?: number
          p_total_price: number
          p_trip_id: string
        }
        Returns: {
          message: string
          reservation_id: string
          success: boolean
        }[]
      }
      create_voucher_guest: {
        Args: {
          buyer_email: string
          buyer_name: string
          buyer_phone?: string
          expires_at?: string
          recipient_email?: string
          recipient_name?: string
          sender_name?: string
          voucher_amount: number
          voucher_currency?: string
          voucher_message?: string
        }
        Returns: {
          message: string
          success: boolean
          voucher_code: string
        }[]
      }
      create_voucher_public:
        | {
            Args: {
              expires_at?: string
              recipient_email?: string
              recipient_name?: string
              sender_name?: string
              voucher_amount: number
              voucher_currency?: string
              voucher_message?: string
            }
            Returns: {
              message: string
              success: boolean
              voucher_code: string
            }[]
          }
        | {
            Args: {
              buyer_email?: string
              expires_at?: string
              recipient_email?: string
              recipient_name?: string
              sender_name?: string
              voucher_amount: number
              voucher_currency?: string
              voucher_message?: string
            }
            Returns: {
              message: string
              success: boolean
              voucher_code: string
            }[]
          }
      is_admin: { Args: never; Returns: boolean }
      restore_trip_spots: {
        Args: { p_spots_to_restore: number; p_trip_id: string }
        Returns: undefined
      }
      use_voucher_by_code: {
        Args: { user_id?: string; voucher_code: string }
        Returns: {
          amount: number
          message: string
          success: boolean
          voucher_id: string
        }[]
      }
      validate_voucher_by_code: {
        Args: { voucher_code: string }
        Returns: {
          amount: number
          currency: string
          expires_at: string
          is_valid: boolean
          voucher_id: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
