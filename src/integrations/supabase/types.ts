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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          role: string
          created_at: string
          address: string | null
          city: string | null
          state: string | null
          pincode: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          phone?: string | null
          role?: string
          created_at?: string
          address?: string | null
          city?: string | null
          state?: string | null
          pincode?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          phone?: string | null
          role?: string
          created_at?: string
          address?: string | null
          city?: string | null
          state?: string | null
          pincode?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          id: number
          name: string | null
          brand: string | null
          category: string | null
          price: number | null
          original_price: number | null
          discount: number | null
          rating: number | null
          reviews: number | null
          specs: string | null
          in_stock: boolean
          image_url: string | null
        }
        Insert: {
          id?: number
          name?: string | null
          brand?: string | null
          category?: string | null
          price?: number | null
          original_price?: number | null
          discount?: number | null
          rating?: number | null
          reviews?: number | null
          specs?: string | null
          in_stock?: boolean
          image_url?: string | null
        }
        Update: {
          id?: number
          name?: string | null
          brand?: string | null
          category?: string | null
          price?: number | null
          original_price?: number | null
          discount?: number | null
          rating?: number | null
          reviews?: number | null
          specs?: string | null
          in_stock?: boolean
          image_url?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          items: Json | null
          total: number | null
          status: string
          delivery_address: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          items?: Json | null
          total?: number | null
          status?: string
          delivery_address?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          items?: Json | null
          total?: number | null
          status?: string
          delivery_address?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          id: number
          name: string | null
          phone: string | null
          city: string | null
          message: string | null
          created_at: string
        }
        Insert: {
          id?: number
          name?: string | null
          phone?: string | null
          city?: string | null
          message?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string | null
          phone?: string | null
          city?: string | null
          message?: string | null
          created_at?: string
        }
        Relationships: []
      }
      professionals: {
        Row: {
          id: string
          full_name: string
          phone: string
          profession: string
          bio: string | null
          city: string
          address: string | null
          pincode: string | null
          years_experience: number | null
          hourly_rate: number | null
          daily_rate: number | null
          rate_currency: string | null
          is_verified: boolean | null
          is_available: boolean | null
          profile_photo_url: string | null
          portfolio_urls: string[] | null
          skills: string[] | null
          languages: string[] | null
          rating: number | null
          total_reviews: number | null
          total_jobs: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          full_name: string
          phone: string
          profession: string
          bio?: string | null
          city: string
          address?: string | null
          pincode?: string | null
          years_experience?: number | null
          hourly_rate?: number | null
          daily_rate?: number | null
          rate_currency?: string | null
          is_verified?: boolean | null
          is_available?: boolean | null
          profile_photo_url?: string | null
          portfolio_urls?: string[] | null
          skills?: string[] | null
          languages?: string[] | null
          rating?: number | null
          total_reviews?: number | null
          total_jobs?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string
          phone?: string
          profession?: string
          bio?: string | null
          city?: string
          address?: string | null
          pincode?: string | null
          years_experience?: number | null
          hourly_rate?: number | null
          daily_rate?: number | null
          rate_currency?: string | null
          is_verified?: boolean | null
          is_available?: boolean | null
          profile_photo_url?: string | null
          portfolio_urls?: string[] | null
          skills?: string[] | null
          languages?: string[] | null
          rating?: number | null
          total_reviews?: number | null
          total_jobs?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      professional_slots: {
        Row: {
          id: number
          professional_id: string | null
          date: string
          start_time: string
          end_time: string
          is_booked: boolean | null
          booked_by: string | null
          created_at: string | null
        }
        Insert: {
          id?: number
          professional_id?: string | null
          date: string
          start_time: string
          end_time: string
          is_booked?: boolean | null
          booked_by?: string | null
          created_at?: string | null
        }
        Update: {
          id?: number
          professional_id?: string | null
          date?: string
          start_time?: string
          end_time?: string
          is_booked?: boolean | null
          booked_by?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professional_slots_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_slots_booked_by_fkey"
            columns: ["booked_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      professional_reviews: {
        Row: {
          id: number
          professional_id: string | null
          user_id: string | null
          rating: number | null
          review: string | null
          created_at: string | null
        }
        Insert: {
          id?: number
          professional_id?: string | null
          user_id?: string | null
          rating?: number | null
          review?: string | null
          created_at?: string | null
        }
        Update: {
          id?: number
          professional_id?: string | null
          user_id?: string | null
          rating?: number | null
          review?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professional_reviews_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "professional_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      designers: {
        Row: {
          id: string
          full_name: string
          phone: string
          email: string
          city: string
          bio: string | null
          years_experience: number | null
          profile_photo_url: string | null
          portfolio_website: string | null
          instagram_url: string | null
          specializations: string[] | null
          is_verified: boolean | null
          rating: number | null
          total_reviews: number | null
          total_designs: number | null
          created_at: string | null
        }
        Insert: {
          id: string
          full_name: string
          phone: string
          email: string
          city: string
          bio?: string | null
          years_experience?: number | null
          profile_photo_url?: string | null
          portfolio_website?: string | null
          instagram_url?: string | null
          specializations?: string[] | null
          is_verified?: boolean | null
          rating?: number | null
          total_reviews?: number | null
          total_designs?: number | null
          created_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string
          phone?: string
          email?: string
          city?: string
          bio?: string | null
          years_experience?: number | null
          profile_photo_url?: string | null
          portfolio_website?: string | null
          instagram_url?: string | null
          specializations?: string[] | null
          is_verified?: boolean | null
          rating?: number | null
          total_reviews?: number | null
          total_designs?: number | null
          created_at?: string | null
        }
        Relationships: []
      }
      designs: {
        Row: {
          id: string
          designer_id: string | null
          name: string
          category: string
          style: string
          room_size: string | null
          description: string
          features: string[] | null
          tags: string[] | null
          execution_cost: number
          materials_cost: number
          customize_cost: number | null
          total_cost: number
          timeline: string | null
          warranty: string | null
          images: string[] | null
          is_published: boolean | null
          is_trending: boolean | null
          rating: number | null
          total_reviews: number | null
          view_count: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          designer_id?: string | null
          name: string
          category: string
          style: string
          room_size?: string | null
          description: string
          features?: string[] | null
          tags?: string[] | null
          execution_cost: number
          materials_cost: number
          customize_cost?: number | null
          total_cost: number
          timeline?: string | null
          warranty?: string | null
          images?: string[] | null
          is_published?: boolean | null
          is_trending?: boolean | null
          rating?: number | null
          total_reviews?: number | null
          view_count?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          designer_id?: string | null
          name?: string
          category?: string
          style?: string
          room_size?: string | null
          description?: string
          features?: string[] | null
          tags?: string[] | null
          execution_cost?: number
          materials_cost?: number
          customize_cost?: number | null
          total_cost?: number
          timeline?: string | null
          warranty?: string | null
          images?: string[] | null
          is_published?: boolean | null
          is_trending?: boolean | null
          rating?: number | null
          total_reviews?: number | null
          view_count?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "designs_designer_id_fkey"
            columns: ["designer_id"]
            isOneToOne: false
            referencedRelation: "designers"
            referencedColumns: ["id"]
          }
        ]
      }
      design_materials: {
        Row: {
          id: number
          design_id: string | null
          material_name: string
          quantity: number
          unit: string
          estimated_cost: number | null
          category: string | null
          notes: string | null
        }
        Insert: {
          id?: number
          design_id?: string | null
          material_name: string
          quantity: number
          unit: string
          estimated_cost?: number | null
          category?: string | null
          notes?: string | null
        }
        Update: {
          id?: number
          design_id?: string | null
          material_name?: string
          quantity?: number
          unit?: string
          estimated_cost?: number | null
          category?: string | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "design_materials_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "designs"
            referencedColumns: ["id"]
          }
        ]
      }
      design_reviews: {
        Row: {
          id: number
          design_id: string | null
          user_id: string | null
          rating: number | null
          review: string | null
          created_at: string | null
        }
        Insert: {
          id?: number
          design_id?: string | null
          user_id?: string | null
          rating?: number | null
          review?: string | null
          created_at?: string | null
        }
        Update: {
          id?: number
          design_id?: string | null
          user_id?: string | null
          rating?: number | null
          review?: string | null
          created_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "design_reviews_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "designs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "design_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
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
