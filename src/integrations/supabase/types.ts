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
      chat_messages: {
        Row: {
          consultation_id: string
          content: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          consultation_id: string
          content: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          consultation_id?: string
          content?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      consultations: {
        Row: {
          created_at: string
          doctor_id: string | null
          id: string
          locale: string
          patient_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          doctor_id?: string | null
          id?: string
          locale?: string
          patient_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          doctor_id?: string | null
          id?: string
          locale?: string
          patient_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      doctor_payment_details: {
        Row: {
          created_at: string
          updated_at: string
          user_id: string
          vodafone_holder: string | null
          vodafone_number: string | null
        }
        Insert: {
          created_at?: string
          updated_at?: string
          user_id: string
          vodafone_holder?: string | null
          vodafone_number?: string | null
        }
        Update: {
          created_at?: string
          updated_at?: string
          user_id?: string
          vodafone_holder?: string | null
          vodafone_number?: string | null
        }
        Relationships: []
      }
      doctor_profiles: {
        Row: {
          availability: string
          bio: string | null
          created_at: string
          fee: number
          full_name_ar: string | null
          full_name_en: string | null
          is_demo: boolean
          languages: string[]
          photo_url: string | null
          rating: number
          specialty: string
          specialty_ar: string | null
          specialty_en: string | null
          user_id: string
          years_experience: number
        }
        Insert: {
          availability?: string
          bio?: string | null
          created_at?: string
          fee?: number
          full_name_ar?: string | null
          full_name_en?: string | null
          is_demo?: boolean
          languages?: string[]
          photo_url?: string | null
          rating?: number
          specialty: string
          specialty_ar?: string | null
          specialty_en?: string | null
          user_id: string
          years_experience?: number
        }
        Update: {
          availability?: string
          bio?: string | null
          created_at?: string
          fee?: number
          full_name_ar?: string | null
          full_name_en?: string | null
          is_demo?: boolean
          languages?: string[]
          photo_url?: string | null
          rating?: number
          specialty?: string
          specialty_ar?: string | null
          specialty_en?: string | null
          user_id?: string
          years_experience?: number
        }
        Relationships: []
      }
      intake_messages: {
        Row: {
          consultation_id: string
          content: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          consultation_id: string
          content: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          consultation_id?: string
          content?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "intake_messages_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_reviews: {
        Row: {
          ai_summary: string | null
          alternative_specialty: string | null
          chief_complaint: string | null
          clinical_notes: string | null
          consultation_id: string
          created_at: string
          duration: string | null
          emergency_reasons: string[]
          id: string
          is_emergency: boolean
          primary_specialty: string | null
          reasoning: string | null
          risk_level: string | null
          risk_score: number | null
          secondary_specialty: string | null
          severity: string | null
          symptoms: string[] | null
        }
        Insert: {
          ai_summary?: string | null
          alternative_specialty?: string | null
          chief_complaint?: string | null
          clinical_notes?: string | null
          consultation_id: string
          created_at?: string
          duration?: string | null
          emergency_reasons?: string[]
          id?: string
          is_emergency?: boolean
          primary_specialty?: string | null
          reasoning?: string | null
          risk_level?: string | null
          risk_score?: number | null
          secondary_specialty?: string | null
          severity?: string | null
          symptoms?: string[] | null
        }
        Update: {
          ai_summary?: string | null
          alternative_specialty?: string | null
          chief_complaint?: string | null
          clinical_notes?: string | null
          consultation_id?: string
          created_at?: string
          duration?: string | null
          emergency_reasons?: string[]
          id?: string
          is_emergency?: boolean
          primary_specialty?: string | null
          reasoning?: string | null
          risk_level?: string | null
          risk_score?: number | null
          secondary_specialty?: string | null
          severity?: string | null
          symptoms?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_reviews_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: true
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          consultation_id: string
          created_at: string
          doctor_id: string
          id: string
          patient_id: string
          payment_method: string
          receipt_image_url: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          transaction_reference: string
          updated_at: string
        }
        Insert: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          consultation_id: string
          created_at?: string
          doctor_id: string
          id?: string
          patient_id: string
          payment_method?: string
          receipt_image_url: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          transaction_reference: string
          updated_at?: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          consultation_id?: string
          created_at?: string
          doctor_id?: string
          id?: string
          patient_id?: string
          payment_method?: string
          receipt_image_url?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          transaction_reference?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      prescriptions: {
        Row: {
          consultation_id: string
          doctor_id: string
          id: string
          instructions: string | null
          issued_at: string
          medications: Json
        }
        Insert: {
          consultation_id: string
          doctor_id: string
          id?: string
          instructions?: string | null
          issued_at?: string
          medications?: Json
        }
        Update: {
          consultation_id?: string
          doctor_id?: string
          id?: string
          instructions?: string | null
          issued_at?: string
          medications?: Json
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: false
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          locale: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          locale?: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          locale?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_payment: {
        Args: { p_payment_id: string }
        Returns: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          consultation_id: string
          created_at: string
          doctor_id: string
          id: string
          patient_id: string
          payment_method: string
          receipt_image_url: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          transaction_reference: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "payments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      reject_payment: {
        Args: { p_payment_id: string; p_reason: string }
        Returns: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          consultation_id: string
          created_at: string
          doctor_id: string
          id: string
          patient_id: string
          payment_method: string
          receipt_image_url: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          transaction_reference: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "payments"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      app_role: "patient" | "doctor" | "admin"
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
    Enums: {
      app_role: ["patient", "doctor", "admin"],
    },
  },
} as const
