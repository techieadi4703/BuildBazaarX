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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string | null
          details: Json | null
          id: number
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string | null
          details?: Json | null
          id?: never
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string | null
          details?: Json | null
          id?: never
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      banners: {
        Row: {
          created_at: string | null
          id: number
          image_url: string
          is_active: boolean | null
          link_url: string | null
          position: string | null
          sort_order: number | null
          subtitle: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          id?: never
          image_url: string
          is_active?: boolean | null
          link_url?: string | null
          position?: string | null
          sort_order?: number | null
          subtitle?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          id?: never
          image_url?: string
          is_active?: boolean | null
          link_url?: string | null
          position?: string | null
          sort_order?: number | null
          subtitle?: string | null
          title?: string
        }
        Relationships: []
      }
      bulk_inquiries: {
        Row: {
          city: string | null
          created_at: string | null
          id: number
          message: string | null
          name: string | null
          phone: string | null
          product_id: string | null
          quantity: number | null
          status: string | null
          supplier_id: string | null
          user_id: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          id?: number
          message?: string | null
          name?: string | null
          phone?: string | null
          product_id?: string | null
          quantity?: number | null
          status?: string | null
          supplier_id?: string | null
          user_id?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string | null
          id?: number
          message?: string | null
          name?: string | null
          phone?: string | null
          product_id?: string | null
          quantity?: number | null
          status?: string | null
          supplier_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bulk_inquiries_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "supplier_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bulk_inquiries_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string | null
          current_uses: number | null
          description: string | null
          discount_type: string | null
          discount_value: number
          id: number
          is_active: boolean | null
          max_uses: number | null
          min_order_value: number | null
          valid_from: string | null
          valid_until: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          current_uses?: number | null
          description?: string | null
          discount_type?: string | null
          discount_value: number
          id?: never
          is_active?: boolean | null
          max_uses?: number | null
          min_order_value?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          current_uses?: number | null
          description?: string | null
          discount_type?: string | null
          discount_value?: number
          id?: never
          is_active?: boolean | null
          max_uses?: number | null
          min_order_value?: number | null
          valid_from?: string | null
          valid_until?: string | null
        }
        Relationships: []
      }
      customers: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      design_materials: {
        Row: {
          category: string | null
          design_id: string | null
          estimated_cost: number | null
          id: number
          material_name: string
          notes: string | null
          quantity: number
          unit: string
        }
        Insert: {
          category?: string | null
          design_id?: string | null
          estimated_cost?: number | null
          id?: number
          material_name: string
          notes?: string | null
          quantity: number
          unit: string
        }
        Update: {
          category?: string | null
          design_id?: string | null
          estimated_cost?: number | null
          id?: number
          material_name?: string
          notes?: string | null
          quantity?: number
          unit?: string
        }
        Relationships: [
          {
            foreignKeyName: "design_materials_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "designs"
            referencedColumns: ["id"]
          },
        ]
      }
      design_reviews: {
        Row: {
          created_at: string | null
          design_id: string | null
          id: number
          rating: number | null
          review: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          design_id?: string | null
          id?: number
          rating?: number | null
          review?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          design_id?: string | null
          id?: number
          rating?: number | null
          review?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "design_reviews_design_id_fkey"
            columns: ["design_id"]
            isOneToOne: false
            referencedRelation: "designs"
            referencedColumns: ["id"]
          },
        ]
      }
      designers: {
        Row: {
          bio: string | null
          city: string
          created_at: string | null
          email: string
          full_name: string
          id: string
          instagram_url: string | null
          is_verified: boolean | null
          phone: string
          portfolio_website: string | null
          profile_photo_url: string | null
          rating: number | null
          specializations: string[] | null
          total_designs: number | null
          total_reviews: number | null
          years_experience: number | null
        }
        Insert: {
          bio?: string | null
          city: string
          created_at?: string | null
          email: string
          full_name: string
          id: string
          instagram_url?: string | null
          is_verified?: boolean | null
          phone: string
          portfolio_website?: string | null
          profile_photo_url?: string | null
          rating?: number | null
          specializations?: string[] | null
          total_designs?: number | null
          total_reviews?: number | null
          years_experience?: number | null
        }
        Update: {
          bio?: string | null
          city?: string
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          instagram_url?: string | null
          is_verified?: boolean | null
          phone?: string
          portfolio_website?: string | null
          profile_photo_url?: string | null
          rating?: number | null
          specializations?: string[] | null
          total_designs?: number | null
          total_reviews?: number | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "designers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      designs: {
        Row: {
          category: string
          created_at: string | null
          customize_cost: number | null
          description: string
          designer_id: string | null
          execution_cost: number
          features: string[] | null
          id: string
          images: string[] | null
          is_published: boolean | null
          is_trending: boolean | null
          materials_cost: number
          name: string
          rating: number | null
          room_size: string | null
          style: string
          tags: string[] | null
          timeline: string | null
          total_cost: number
          total_reviews: number | null
          updated_at: string | null
          view_count: number | null
          warranty: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          customize_cost?: number | null
          description: string
          designer_id?: string | null
          execution_cost: number
          features?: string[] | null
          id?: string
          images?: string[] | null
          is_published?: boolean | null
          is_trending?: boolean | null
          materials_cost: number
          name: string
          rating?: number | null
          room_size?: string | null
          style: string
          tags?: string[] | null
          timeline?: string | null
          total_cost: number
          total_reviews?: number | null
          updated_at?: string | null
          view_count?: number | null
          warranty?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          customize_cost?: number | null
          description?: string
          designer_id?: string | null
          execution_cost?: number
          features?: string[] | null
          id?: string
          images?: string[] | null
          is_published?: boolean | null
          is_trending?: boolean | null
          materials_cost?: number
          name?: string
          rating?: number | null
          room_size?: string | null
          style?: string
          tags?: string[] | null
          timeline?: string | null
          total_cost?: number
          total_reviews?: number | null
          updated_at?: string | null
          view_count?: number | null
          warranty?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "designs_designer_id_fkey"
            columns: ["designer_id"]
            isOneToOne: false
            referencedRelation: "designers"
            referencedColumns: ["id"]
          },
        ]
      }
      floor_plans: {
        Row: {
          created_at: string | null
          id: string
          name: string
          plan_data: Json
          thumbnail_url: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          plan_data?: Json
          thumbnail_url?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          plan_data?: Json
          thumbnail_url?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          budget: string | null
          city: string | null
          created_at: string | null
          id: number
          message: string | null
          name: string | null
          phone: string | null
          service: string | null
        }
        Insert: {
          budget?: string | null
          city?: string | null
          created_at?: string | null
          id?: number
          message?: string | null
          name?: string | null
          phone?: string | null
          service?: string | null
        }
        Update: {
          budget?: string | null
          city?: string | null
          created_at?: string | null
          id?: number
          message?: string | null
          name?: string | null
          phone?: string | null
          service?: string | null
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string | null
          delivery_address: Json | null
          id: string
          items: Json | null
          status: string | null
          total: number | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          delivery_address?: Json | null
          id?: string
          items?: Json | null
          status?: string | null
          total?: number | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          delivery_address?: Json | null
          id?: string
          items?: Json | null
          status?: string | null
          total?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          key: string
          updated_at: string | null
          value: string | null
        }
        Insert: {
          key: string
          updated_at?: string | null
          value?: string | null
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: string | null
        }
        Relationships: []
      }
      products: {
        Row: {
          brand: string | null
          category: string | null
          discount: number | null
          id: number
          image_url: string | null
          in_stock: boolean | null
          name: string | null
          original_price: number | null
          price: number | null
          rating: number | null
          reviews: number | null
          specs: string | null
        }
        Insert: {
          brand?: string | null
          category?: string | null
          discount?: number | null
          id?: number
          image_url?: string | null
          in_stock?: boolean | null
          name?: string | null
          original_price?: number | null
          price?: number | null
          rating?: number | null
          reviews?: number | null
          specs?: string | null
        }
        Update: {
          brand?: string | null
          category?: string | null
          discount?: number | null
          id?: number
          image_url?: string | null
          in_stock?: boolean | null
          name?: string | null
          original_price?: number | null
          price?: number | null
          rating?: number | null
          reviews?: number | null
          specs?: string | null
        }
        Relationships: []
      }
      professional_reviews: {
        Row: {
          created_at: string | null
          id: number
          professional_id: string | null
          rating: number | null
          review: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          professional_id?: string | null
          rating?: number | null
          review?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          professional_id?: string | null
          rating?: number | null
          review?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "professional_reviews_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      professional_slots: {
        Row: {
          booked_by: string | null
          created_at: string | null
          date: string
          end_time: string
          id: number
          is_booked: boolean | null
          professional_id: string | null
          start_time: string
        }
        Insert: {
          booked_by?: string | null
          created_at?: string | null
          date: string
          end_time: string
          id?: number
          is_booked?: boolean | null
          professional_id?: string | null
          start_time: string
        }
        Update: {
          booked_by?: string | null
          created_at?: string | null
          date?: string
          end_time?: string
          id?: number
          is_booked?: boolean | null
          professional_id?: string | null
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "professional_slots_professional_id_fkey"
            columns: ["professional_id"]
            isOneToOne: false
            referencedRelation: "professionals"
            referencedColumns: ["id"]
          },
        ]
      }
      professionals: {
        Row: {
          address: string | null
          bio: string | null
          city: string
          created_at: string | null
          daily_rate: number | null
          email: string | null
          full_name: string
          hourly_rate: number | null
          id: string
          is_available: boolean | null
          is_verified: boolean | null
          languages: string[] | null
          phone: string
          pincode: string | null
          portfolio_urls: string[] | null
          profession: string
          profile_photo_url: string | null
          rate_currency: string | null
          rating: number | null
          skills: string[] | null
          total_jobs: number | null
          total_reviews: number | null
          updated_at: string | null
          years_experience: number | null
        }
        Insert: {
          address?: string | null
          bio?: string | null
          city: string
          created_at?: string | null
          daily_rate?: number | null
          email?: string | null
          full_name: string
          hourly_rate?: number | null
          id: string
          is_available?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          phone: string
          pincode?: string | null
          portfolio_urls?: string[] | null
          profession: string
          profile_photo_url?: string | null
          rate_currency?: string | null
          rating?: number | null
          skills?: string[] | null
          total_jobs?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          years_experience?: number | null
        }
        Update: {
          address?: string | null
          bio?: string | null
          city?: string
          created_at?: string | null
          daily_rate?: number | null
          email?: string | null
          full_name?: string
          hourly_rate?: number | null
          id?: string
          is_available?: boolean | null
          is_verified?: boolean | null
          languages?: string[] | null
          phone?: string
          pincode?: string | null
          portfolio_urls?: string[] | null
          profession?: string
          profile_photo_url?: string | null
          rate_currency?: string | null
          rating?: number | null
          skills?: string[] | null
          total_jobs?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "professionals_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          city: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          is_blocked: boolean | null
          last_cart_snapshot: Json | null
          last_cart_updated_at: string | null
          phone: string | null
          pincode: string | null
          role: string | null
          state: string | null
          wishlist: Json | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          is_blocked?: boolean | null
          last_cart_snapshot?: Json | null
          last_cart_updated_at?: string | null
          phone?: string | null
          pincode?: string | null
          role?: string | null
          state?: string | null
          wishlist?: Json | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_blocked?: boolean | null
          last_cart_snapshot?: Json | null
          last_cart_updated_at?: string | null
          phone?: string | null
          pincode?: string | null
          role?: string | null
          state?: string | null
          wishlist?: Json | null
        }
        Relationships: []
      }
      supplier_product_reviews: {
        Row: {
          created_at: string | null
          id: number
          product_id: string | null
          rating: number | null
          review: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          product_id?: string | null
          rating?: number | null
          review?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          product_id?: string | null
          rating?: number | null
          review?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "supplier_products"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_products: {
        Row: {
          brand: string
          bulk_min_qty: number | null
          bulk_price: number | null
          category: string
          created_at: string | null
          delivery_days: number | null
          delivery_info: string | null
          description: string | null
          discount: number | null
          id: string
          images: string[] | null
          in_stock: boolean | null
          is_featured: boolean | null
          is_published: boolean | null
          min_order_qty: number | null
          name: string
          original_price: number | null
          price: number
          quality_details: string[] | null
          rating: number | null
          return_policy: string | null
          specs: string | null
          stock_qty: number | null
          sub_category: string | null
          supplier_id: string | null
          tags: string[] | null
          total_reviews: number | null
          total_sold: number | null
          unit: string | null
          updated_at: string | null
          hex_color: string | null
          texture_url: string | null
          catalog_type: string | null
        }
        Insert: {
          brand: string
          bulk_min_qty?: number | null
          bulk_price?: number | null
          category: string
          created_at?: string | null
          delivery_days?: number | null
          delivery_info?: string | null
          description?: string | null
          discount?: number | null
          id?: string
          images?: string[] | null
          in_stock?: boolean | null
          is_featured?: boolean | null
          is_published?: boolean | null
          min_order_qty?: number | null
          name: string
          original_price?: number | null
          price: number
          quality_details?: string[] | null
          rating?: number | null
          return_policy?: string | null
          specs?: string | null
          stock_qty?: number | null
          sub_category?: string | null
          supplier_id?: string | null
          tags?: string[] | null
          total_reviews?: number | null
          total_sold?: number | null
          unit?: string | null
          updated_at?: string | null
          hex_color?: string | null
          texture_url?: string | null
          catalog_type?: string | null
        }
        Update: {
          brand?: string
          bulk_min_qty?: number | null
          bulk_price?: number | null
          category?: string
          created_at?: string | null
          delivery_days?: number | null
          delivery_info?: string | null
          description?: string | null
          discount?: number | null
          id?: string
          images?: string[] | null
          in_stock?: boolean | null
          is_featured?: boolean | null
          is_published?: boolean | null
          min_order_qty?: number | null
          name?: string
          original_price?: number | null
          price?: number
          quality_details?: string[] | null
          rating?: number | null
          return_policy?: string | null
          specs?: string | null
          stock_qty?: number | null
          sub_category?: string | null
          supplier_id?: string | null
          tags?: string[] | null
          total_reviews?: number | null
          total_sold?: number | null
          unit?: string | null
          updated_at?: string | null
          hex_color?: string | null
          texture_url?: string | null
          catalog_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "supplier_products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          bank_account_name: string | null
          bank_account_number: string | null
          bank_ifsc: string | null
          business_name: string
          business_type: string | null
          city: string
          created_at: string | null
          email: string
          gst_number: string | null
          id: string
          is_verified: boolean | null
          logo_url: string | null
          owner_name: string
          pan_number: string | null
          phone: string
          pincode: string | null
          rating: number | null
          state: string | null
          total_products: number | null
          total_reviews: number | null
          website: string | null
        }
        Insert: {
          address?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_ifsc?: string | null
          business_name: string
          business_type?: string | null
          city: string
          created_at?: string | null
          email: string
          gst_number?: string | null
          id: string
          is_verified?: boolean | null
          logo_url?: string | null
          owner_name: string
          pan_number?: string | null
          phone: string
          pincode?: string | null
          rating?: number | null
          state?: string | null
          total_products?: number | null
          total_reviews?: number | null
          website?: string | null
        }
        Update: {
          address?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_ifsc?: string | null
          business_name?: string
          business_type?: string | null
          city?: string
          created_at?: string | null
          email?: string
          gst_number?: string | null
          id?: string
          is_verified?: boolean | null
          logo_url?: string | null
          owner_name?: string
          pan_number?: string | null
          phone?: string
          pincode?: string | null
          rating?: number | null
          state?: string | null
          total_products?: number | null
          total_reviews?: number | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          admin_reply: string | null
          created_at: string | null
          id: number
          message: string
          priority: string | null
          status: string | null
          subject: string
          updated_at: string | null
          user_email: string | null
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          admin_reply?: string | null
          created_at?: string | null
          id?: never
          message: string
          priority?: string | null
          status?: string | null
          subject: string
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          admin_reply?: string | null
          created_at?: string | null
          id?: never
          message?: string
          priority?: string | null
          status?: string | null
          subject?: string
          updated_at?: string | null
          user_email?: string | null
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_is_admin: { Args: never; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
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
