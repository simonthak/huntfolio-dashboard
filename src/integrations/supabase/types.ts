export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      animal_subtypes: {
        Row: {
          animal_type_id: number | null
          created_at: string
          id: number
          name: string
        }
        Insert: {
          animal_type_id?: number | null
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          animal_type_id?: number | null
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "animal_subtypes_animal_type_id_fkey"
            columns: ["animal_type_id"]
            isOneToOne: false
            referencedRelation: "animal_types"
            referencedColumns: ["id"]
          },
        ]
      }
      animal_types: {
        Row: {
          created_at: string
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          content_type: string
          created_at: string
          file_path: string
          id: string
          name: string
          size: number
          team_id: string
          uploaded_by: string
        }
        Insert: {
          content_type: string
          created_at?: string
          file_path: string
          id?: string
          name: string
          size: number
          team_id: string
          uploaded_by: string
        }
        Update: {
          content_type?: string
          created_at?: string
          file_path?: string
          id?: string
          name?: string
          size?: number
          team_id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      drive_areas: {
        Row: {
          boundary: Json
          created_at: string
          created_by: string
          id: string
          name: string
          team_id: string
        }
        Insert: {
          boundary: Json
          created_at?: string
          created_by: string
          id?: string
          name: string
          team_id: string
        }
        Update: {
          boundary?: Json
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "drive_areas_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drive_areas_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      email_notification_history: {
        Row: {
          id: string
          notification_type: string
          sent_at: string
          sent_date: string
          user_id: string
        }
        Insert: {
          id?: string
          notification_type: string
          sent_at?: string
          sent_date?: string
          user_id: string
        }
        Update: {
          id?: string
          notification_type?: string
          sent_at?: string
          sent_date?: string
          user_id?: string
        }
        Relationships: []
      }
      event_participants: {
        Row: {
          event_id: string
          joined_at: string
          participant_type: string
          user_id: string
        }
        Insert: {
          event_id: string
          joined_at?: string
          participant_type?: string
          user_id: string
        }
        Update: {
          event_id?: string
          joined_at?: string
          participant_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_participants_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          created_by: string
          date: string
          description: string | null
          dog_handlers_limit: number
          end_date: string | null
          hunt_type_id: number
          id: string
          participant_limit: number
          start_time: string | null
          team_id: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          date: string
          description?: string | null
          dog_handlers_limit?: number
          end_date?: string | null
          hunt_type_id: number
          id?: string
          participant_limit: number
          start_time?: string | null
          team_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          date?: string
          description?: string | null
          dog_handlers_limit?: number
          end_date?: string | null
          hunt_type_id?: number
          id?: string
          participant_limit?: number
          start_time?: string | null
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_hunt_type"
            columns: ["hunt_type_id"]
            isOneToOne: false
            referencedRelation: "hunt_types"
            referencedColumns: ["id"]
          },
        ]
      }
      hunt_types: {
        Row: {
          created_at: string
          id: number
          name: string
        }
        Insert: {
          created_at?: string
          id?: number
          name: string
        }
        Update: {
          created_at?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      hunting_grounds: {
        Row: {
          boundary: Json
          created_at: string
          created_by: string
          id: string
          name: string
          team_id: string
        }
        Insert: {
          boundary: Json
          created_at?: string
          created_by: string
          id?: string
          name: string
          team_id: string
        }
        Update: {
          boundary?: Json
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hunting_grounds_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hunting_grounds_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      hunting_passes: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          drive_area_id: string
          id: string
          location: Json
          name: string
          team_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          drive_area_id: string
          id?: string
          location: Json
          name: string
          team_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          drive_area_id?: string
          id?: string
          location?: Json
          name?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hunting_passes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hunting_passes_drive_area_id_fkey"
            columns: ["drive_area_id"]
            isOneToOne: false
            referencedRelation: "drive_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hunting_passes_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      hunting_reports: {
        Row: {
          created_at: string
          created_by: string
          date: string
          description: string | null
          hunt_type_id: number | null
          id: string
          participant_count: number
          team_id: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          date: string
          description?: string | null
          hunt_type_id?: number | null
          id?: string
          participant_count: number
          team_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          date?: string
          description?: string | null
          hunt_type_id?: number | null
          id?: string
          participant_count?: number
          team_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hunting_reports_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hunting_reports_hunt_type_id_fkey"
            columns: ["hunt_type_id"]
            isOneToOne: false
            referencedRelation: "hunt_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hunting_reports_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      hunting_towers: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          location: Json
          name: string
          team_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          location: Json
          name: string
          team_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          location?: Json
          name?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "hunting_towers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hunting_towers_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string | null
          firstname: string | null
          full_name: string | null
          id: string
          lastname: string | null
          phone_number: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          firstname?: string | null
          full_name?: string | null
          id: string
          lastname?: string | null
          phone_number?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          firstname?: string | null
          full_name?: string | null
          id?: string
          lastname?: string | null
          phone_number?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      report_animals: {
        Row: {
          animal_subtype_id: number | null
          animal_type_id: number
          created_at: string
          id: string
          quantity: number
          report_id: string
        }
        Insert: {
          animal_subtype_id?: number | null
          animal_type_id: number
          created_at?: string
          id?: string
          quantity: number
          report_id: string
        }
        Update: {
          animal_subtype_id?: number | null
          animal_type_id?: number
          created_at?: string
          id?: string
          quantity?: number
          report_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "report_animals_animal_subtype_id_fkey"
            columns: ["animal_subtype_id"]
            isOneToOne: false
            referencedRelation: "animal_subtypes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_animals_animal_type_id_fkey"
            columns: ["animal_type_id"]
            isOneToOne: false
            referencedRelation: "animal_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "report_animals_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "hunting_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      team_contacts: {
        Row: {
          contact_type: Database["public"]["Enums"]["contact_type"]
          created_at: string
          created_by: string
          email: string | null
          id: string
          name: string
          note: string | null
          phone: string | null
          team_id: string
        }
        Insert: {
          contact_type: Database["public"]["Enums"]["contact_type"]
          created_at?: string
          created_by: string
          email?: string | null
          id?: string
          name: string
          note?: string | null
          phone?: string | null
          team_id: string
        }
        Update: {
          contact_type?: Database["public"]["Enums"]["contact_type"]
          created_at?: string
          created_by?: string
          email?: string | null
          id?: string
          name?: string
          note?: string | null
          phone?: string | null
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_contacts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_contacts_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          joined_at: string
          role: string
          team_id: string
          user_id: string
        }
        Insert: {
          joined_at?: string
          role: string
          team_id: string
          user_id: string
        }
        Update: {
          joined_at?: string
          role?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          areal: number | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          invite_code: string
          location: string | null
          name: string
        }
        Insert: {
          areal?: number | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          invite_code?: string
          location?: string | null
          name: string
        }
        Update: {
          areal?: number | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          invite_code?: string
          location?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          created_at: string
          email_notifications: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_notifications?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_unique_invite_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      contact_type: "eftersok" | "granne" | "markagare"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
