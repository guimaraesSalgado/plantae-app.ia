// AVOID UPDATING THIS FILE DIRECTLY. It is automatically generated.
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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      notifications: {
        Row: {
          data_hora: string
          id: string
          lida: boolean | null
          mensagem: string | null
          tipo: string
          titulo: string
          user_id: string
        }
        Insert: {
          data_hora?: string
          id?: string
          lida?: boolean | null
          mensagem?: string | null
          tipo: string
          titulo: string
          user_id: string
        }
        Update: {
          data_hora?: string
          id?: string
          lida?: boolean | null
          mensagem?: string | null
          tipo?: string
          titulo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      plants: {
        Row: {
          apelido: string
          created_at: string
          cuidados_recomendados: Json | null
          datas_importantes: Json | null
          foto_url: string
          id: string
          logs: Json | null
          nome_cientifico: string | null
          nome_conhecido: string
          observacoes: string | null
          pontos_negativos: string[] | null
          pontos_positivos: string[] | null
          sexo: string | null
          status_saude: string | null
          tempo_de_vida_aproximado_dias: number | null
          updated_at: string | null
          user_id: string
          vitaminas_e_adubos: Json | null
        }
        Insert: {
          apelido: string
          created_at?: string
          cuidados_recomendados?: Json | null
          datas_importantes?: Json | null
          foto_url: string
          id?: string
          logs?: Json | null
          nome_cientifico?: string | null
          nome_conhecido: string
          observacoes?: string | null
          pontos_negativos?: string[] | null
          pontos_positivos?: string[] | null
          sexo?: string | null
          status_saude?: string | null
          tempo_de_vida_aproximado_dias?: number | null
          updated_at?: string | null
          user_id: string
          vitaminas_e_adubos?: Json | null
        }
        Update: {
          apelido?: string
          created_at?: string
          cuidados_recomendados?: Json | null
          datas_importantes?: Json | null
          foto_url?: string
          id?: string
          logs?: Json | null
          nome_cientifico?: string | null
          nome_conhecido?: string
          observacoes?: string | null
          pontos_negativos?: string[] | null
          pontos_positivos?: string[] | null
          sexo?: string | null
          status_saude?: string | null
          tempo_de_vida_aproximado_dias?: number | null
          updated_at?: string | null
          user_id?: string
          vitaminas_e_adubos?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "plants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activities: {
        Row: {
          data_hora: string
          descricao_resumida: string | null
          id: string
          origem: string | null
          planta_id: string | null
          tipo: string
          user_id: string
        }
        Insert: {
          data_hora?: string
          descricao_resumida?: string | null
          id?: string
          origem?: string | null
          planta_id?: string | null
          tipo: string
          user_id: string
        }
        Update: {
          data_hora?: string
          descricao_resumida?: string | null
          id?: string
          origem?: string | null
          planta_id?: string | null
          tipo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activities_planta_id_fkey"
            columns: ["planta_id"]
            isOneToOne: false
            referencedRelation: "plant_logs_view"
            referencedColumns: ["plant_id"]
          },
          {
            foreignKeyName: "user_activities_planta_id_fkey"
            columns: ["planta_id"]
            isOneToOne: false
            referencedRelation: "plants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activities_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_security_questions: {
        Row: {
          answer_hash: string
          created_at: string | null
          id: string
          question: string
          user_id: string
        }
        Insert: {
          answer_hash: string
          created_at?: string | null
          id?: string
          question: string
          user_id: string
        }
        Update: {
          answer_hash?: string
          created_at?: string | null
          id?: string
          question?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_security_questions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          data_criacao: string
          data_nascimento: string | null
          email: string
          foto_perfil_url: string | null
          id: string
          nome: string | null
          username: string | null
        }
        Insert: {
          data_criacao?: string
          data_nascimento?: string | null
          email: string
          foto_perfil_url?: string | null
          id: string
          nome?: string | null
          username?: string | null
        }
        Update: {
          data_criacao?: string
          data_nascimento?: string | null
          email?: string
          foto_perfil_url?: string | null
          id?: string
          nome?: string | null
          username?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      plant_logs_view: {
        Row: {
          log_date: string | null
          log_id: string | null
          log_note: string | null
          log_type: string | null
          plant_id: string | null
          plant_name: string | null
          plant_photo: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
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

