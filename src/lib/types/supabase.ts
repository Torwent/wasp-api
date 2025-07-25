export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  _supavisor: {
    Tables: {
      [_ in never]: never
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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  info: {
    Tables: {
      discord: {
        Row: {
          created_at: string
          id: string
          response: string
        }
        Insert: {
          created_at?: string
          id?: string
          response: string
        }
        Update: {
          created_at?: string
          id?: string
          response?: string
        }
        Relationships: []
      }
      errors: {
        Row: {
          content: string
          created_at: string | null
          id: number
          title: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: number
          title: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: number
          title?: string
        }
        Relationships: []
      }
      privacy_policy: {
        Row: {
          content: string
          created_at: string
          id: string
          version: number
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          version?: number
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          version?: number
        }
        Relationships: []
      }
      questions: {
        Row: {
          content: string
          created_at: string | null
          id: number
          title: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: number
          title: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: number
          title?: string
        }
        Relationships: []
      }
      scripter_tos: {
        Row: {
          content: string
          created_at: string
          id: string
          version: number
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          version?: number
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          version?: number
        }
        Relationships: []
      }
      tutorials: {
        Row: {
          author_id: string
          content: string
          created_at: string
          description: string
          fts: unknown | null
          id: string
          level: number
          order: number
          published: boolean
          search: string | null
          title: string
          url: string
          username: string
        }
        Insert: {
          author_id?: string
          content: string
          created_at?: string
          description: string
          fts?: unknown | null
          id?: string
          level?: number
          order: number
          published?: boolean
          search?: string | null
          title: string
          url?: string
          username?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          description?: string
          fts?: unknown | null
          id?: string
          level?: number
          order?: number
          published?: boolean
          search?: string | null
          title?: string
          url?: string
          username?: string
        }
        Relationships: []
      }
      user_tos: {
        Row: {
          content: string
          created_at: string
          id: string
          version: number
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          version?: number
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          version?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_author:
        | {
            Args: {
              tutorial_id: string
            }
            Returns: boolean
          }
        | {
            Args: {
              tutorial_id: string
              user_id: string
            }
            Returns: boolean
          }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  pgbouncer: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_auth: {
        Args: {
          p_usename: string
        }
        Returns: {
          username: string
          password: string
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
  profiles: {
    Tables: {
      free_access: {
        Row: {
          date_end: string
          date_start: string
          id: string
          product: string
          row_id: string
        }
        Insert: {
          date_end?: string
          date_start?: string
          id: string
          product: string
          row_id?: string
        }
        Update: {
          date_end?: string
          date_start?: string
          id?: string
          product?: string
          row_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "free_access_id_fkey"
            columns: ["id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      free_access_old: {
        Row: {
          date_end: string
          date_start: string
          id: string
          product: string
          row_id: string
        }
        Insert: {
          date_end?: string
          date_start?: string
          id: string
          product: string
          row_id?: string
        }
        Update: {
          date_end?: string
          date_start?: string
          id?: string
          product?: string
          row_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "free_access_old_id_fkey"
            columns: ["id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      private: {
        Row: {
          email: string | null
          id: string
          warning: boolean
        }
        Insert: {
          email?: string | null
          id: string
          warning?: boolean
        }
        Update: {
          email?: string | null
          id?: string
          warning?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "private_id_fkey"
            columns: ["id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar: string
          customer_id: string | null
          discord: string
          id: string
          username: string | null
        }
        Insert: {
          avatar?: string
          customer_id?: string | null
          discord?: string
          id: string
          username?: string | null
        }
        Update: {
          avatar?: string
          customer_id?: string | null
          discord?: string
          id?: string
          username?: string | null
        }
        Relationships: []
      }
      roles: {
        Row: {
          administrator: boolean
          banned: boolean
          created_at: string
          developer: boolean
          id: string
          moderator: boolean
          premium: boolean
          scripter: boolean
          tester: boolean
          timeout: boolean
          vip: boolean
        }
        Insert: {
          administrator?: boolean
          banned?: boolean
          created_at?: string
          developer?: boolean
          id: string
          moderator?: boolean
          premium?: boolean
          scripter?: boolean
          tester?: boolean
          timeout?: boolean
          vip?: boolean
        }
        Update: {
          administrator?: boolean
          banned?: boolean
          created_at?: string
          developer?: boolean
          id?: string
          moderator?: boolean
          premium?: boolean
          scripter?: boolean
          tester?: boolean
          timeout?: boolean
          vip?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "roles_id_fkey"
            columns: ["id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      scripters: {
        Row: {
          content: string | null
          description: string | null
          fts: unknown
          github: string | null
          id: string
          paypal_id: string | null
          realname: string | null
          search: string
          stripe: string | null
          url: string
        }
        Insert: {
          content?: string | null
          description?: string | null
          fts: unknown
          github?: string | null
          id: string
          paypal_id?: string | null
          realname?: string | null
          search: string
          stripe?: string | null
          url?: string
        }
        Update: {
          content?: string | null
          description?: string | null
          fts?: unknown
          github?: string | null
          id?: string
          paypal_id?: string | null
          realname?: string | null
          search?: string
          stripe?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "scripters_id_fkey"
            columns: ["id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription: {
        Row: {
          cancel: boolean
          date_end: string
          date_start: string
          disabled: boolean
          id: string
          price: string
          product: string
          subscription: string
        }
        Insert: {
          cancel?: boolean
          date_end?: string
          date_start?: string
          disabled?: boolean
          id: string
          price: string
          product: string
          subscription: string
        }
        Update: {
          cancel?: boolean
          date_end?: string
          date_start?: string
          disabled?: boolean
          id?: string
          price?: string
          product?: string
          subscription?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_id_fkey"
            columns: ["id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions_old: {
        Row: {
          cancel: boolean
          date_end: string
          date_start: string
          disabled: boolean
          id: string
          price: string
          product: string
          subscription: string
        }
        Insert: {
          cancel?: boolean
          date_end?: string
          date_start?: string
          disabled?: boolean
          id: string
          price: string
          product: string
          subscription: string
        }
        Update: {
          cancel?: boolean
          date_end?: string
          date_start?: string
          disabled?: boolean
          id?: string
          price?: string
          product?: string
          subscription?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_old_id_fkey"
            columns: ["id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions_uc: {
        Row: {
          cancel: boolean
          date_end: string
          date_start: string
          external: boolean
          id: string
          price_id: string
          subscription_id: string | null
        }
        Insert: {
          cancel?: boolean
          date_end?: string
          date_start?: string
          external?: boolean
          id: string
          price_id?: string
          subscription_id?: string | null
        }
        Update: {
          cancel?: boolean
          date_end?: string
          date_start?: string
          external?: boolean
          id?: string
          price_id?: string
          subscription_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      random_scripters: {
        Row: {
          content: string | null
          description: string | null
          fts: unknown | null
          github: string | null
          id: string | null
          paypal_id: string | null
          realname: string | null
          search: string | null
          stripe: string | null
          url: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scripters_id_fkey"
            columns: ["id"]
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      auth_get_avatar: {
        Args: {
          user_id: string
        }
        Returns: string
      }
      auth_get_discord: {
        Args: {
          user_id: string
        }
        Returns: string
      }
      auth_get_username: {
        Args: {
          user_id: string
        }
        Returns: string
      }
      can_access:
        | {
            Args: {
              accesser_id: string
              script_id: string
            }
            Returns: boolean
          }
        | {
            Args: {
              script_id: string
            }
            Returns: boolean
          }
      can_view_subscription: {
        Args: {
          accesser: string
          product: string
        }
        Returns: boolean
      }
      create_stripe_customer: {
        Args: {
          id: string
          email: string
          discord_id: string
          username: string
        }
        Returns: number
      }
      cron_check_subscriptions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_avatar: {
        Args: {
          user_id: string
        }
        Returns: string
      }
      get_discord: {
        Args: {
          user_id: string
        }
        Returns: string
      }
      get_email: {
        Args: {
          user_id: string
        }
        Returns: string
      }
      get_profile:
        | {
            Args: Record<PropertyKey, never>
            Returns: Database["public"]["CompositeTypes"]["profile_data_type"]
          }
        | {
            Args: {
              user_id: string
            }
            Returns: Database["public"]["CompositeTypes"]["profile_data_type"]
          }
      get_stripe_user: {
        Args: {
          user_id: string
        }
        Returns: string
      }
      get_user_id: {
        Args: {
          disc_id: string
        }
        Returns: string
      }
      get_username:
        | {
            Args: Record<PropertyKey, never>
            Returns: string
          }
        | {
            Args: {
              user_id: string
            }
            Returns: string
          }
      is_role:
        | {
            Args: {
              role: string
            }
            Returns: boolean
          }
        | {
            Args: {
              user_id: string
              role: string
            }
            Returns: boolean
          }
      set_roles: {
        Args: {
          discord_id: string
          param_developer: boolean
          param_premium: boolean
          param_vip: boolean
          param_tester: boolean
          param_mod: boolean
        }
        Returns: undefined
      }
      set_user_roles: {
        Args: {
          user_id: string
          param_developer: boolean
          param_premium: boolean
          param_vip: boolean
          param_tester: boolean
          param_scripter: boolean
          param_moderator: boolean
          param_administrator: boolean
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      stats: {
        Row: {
          experience: number
          gold: number
          id: string
          levels: number
          password: string
          runtime: number
          updated_at: string | null
          username: string
        }
        Insert: {
          experience?: number
          gold?: number
          id: string
          levels?: number
          password?: string
          runtime?: number
          updated_at?: string | null
          username?: string
        }
        Update: {
          experience?: number
          gold?: number
          id?: string
          levels?: number
          password?: string
          runtime?: number
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      stats_bak: {
        Row: {
          experience: number | null
          gold: number | null
          id: string
          levels: number
          password: string
          runtime: number | null
          updated_at: string | null
          username: string
        }
        Insert: {
          experience?: number | null
          gold?: number | null
          id: string
          levels?: number
          password?: string
          runtime?: number | null
          updated_at?: string | null
          username?: string
        }
        Update: {
          experience?: number | null
          gold?: number | null
          id?: string
          levels?: number
          password?: string
          runtime?: number | null
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      mv_stats_total: {
        Row: {
          experience: number | null
          gold: number | null
          levels: number | null
          runtime: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      _array_remove: {
        Args: {
          arr: unknown
          values_to_remove: unknown
        }
        Returns: unknown
      }
      _array_reverse: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      _strip_html: {
        Args: {
          input_text: string
        }
        Returns: string
      }
      array_unique: {
        Args: {
          a: string[]
        }
        Returns: string[]
      }
      delete_user: {
        Args: {
          user_to_delete: string
        }
        Returns: undefined
      }
      encode_seo: {
        Args: {
          url: string
        }
        Returns: string
      }
      generate_search_vector: {
        Args: {
          id: string
          data: string[]
        }
        Returns: unknown
      }
      get_common_words:
        | {
            Args: {
              text_array: string[]
            }
            Returns: string[]
          }
        | {
            Args: {
              text_array: string[]
              limit_val: number
            }
            Returns: string[]
          }
      get_stats_total: {
        Args: Record<PropertyKey, never>
        Returns: {
          experience: number
          gold: number
          levels: number
          runtime: number
        }[]
      }
      insert_ten_year_sub:
        | {
            Args: {
              start: number
              user_ids: string[]
            }
            Returns: undefined
          }
        | {
            Args: {
              start: number
              user_ids: string[]
            }
            Returns: undefined
          }
      is_dashboard: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_owner: {
        Args: {
          id: string
        }
        Returns: boolean
      }
      normalize_nfkc: {
        Args: {
          input: string
        }
        Returns: string
      }
    }
    Enums: {
      script_category:
        | "combat"
        | "boss"
        | "minigame"
        | "moneymaker"
        | "tool"
        | "magic"
        | "prayer"
        | "mining"
        | "fishing"
        | "woodcutting"
        | "hunter"
        | "farming"
        | "cooking"
        | "smithing"
        | "fletching"
        | "firemaking"
        | "herblore"
        | "crafting"
        | "construction"
        | "agility"
        | "slayer"
        | "thieving"
        | "runecrafting"
      script_status: "official" | "community"
      script_type: "premium" | "free"
    }
    CompositeTypes: {
      profile_data_type: {
        id: string | null
        username: string | null
        avatar_url: string | null
        updated_at: string | null
        discord_id: string | null
        developer: boolean | null
        premium: boolean | null
        vip: boolean | null
        tester: boolean | null
        moderator: boolean | null
        administrator: boolean | null
        unlocked_ips: number | null
        scripter: boolean | null
        timeout: boolean | null
        subscription_external: boolean | null
        subscription_start: string | null
        subscription_end: string | null
        subscription_id: string | null
        cancel_at_period_end: boolean | null
        customer_id: string | null
        price_id: string | null
        dismissed_warning: boolean | null
        email: string | null
      }
    }
  }
  scripts: {
    Tables: {
      bundles: {
        Row: {
          id: string
          name: string
          product: string | null
          quantity: number | null
          scripts: string[]
          user_id: string
          username: string | null
        }
        Insert: {
          id?: string
          name?: string
          product?: string | null
          quantity?: number | null
          scripts: string[]
          user_id: string
          username?: string | null
        }
        Update: {
          id?: string
          name?: string
          product?: string | null
          quantity?: number | null
          scripts?: string[]
          user_id?: string
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bundles_product_fkey"
            columns: ["product"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          emoji: string
          name: string
        }
        Insert: {
          emoji: string
          name: string
        }
        Update: {
          emoji?: string
          name?: string
        }
        Relationships: []
      }
      featured: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "featured_id_fkey"
            columns: ["id"]
            referencedRelation: "scripts"
            referencedColumns: ["id"]
          },
        ]
      }
      metadata: {
        Row: {
          categories: Database["public"]["Enums"]["script_category"][]
          created_at: string
          id: string
          status: Database["public"]["Enums"]["script_status"]
          type: Database["public"]["Enums"]["script_type"]
          updated_at: string
        }
        Insert: {
          categories: Database["public"]["Enums"]["script_category"][]
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["script_status"]
          type?: Database["public"]["Enums"]["script_type"]
          updated_at?: string
        }
        Update: {
          categories?: Database["public"]["Enums"]["script_category"][]
          created_at?: string
          id?: string
          status?: Database["public"]["Enums"]["script_status"]
          type?: Database["public"]["Enums"]["script_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "metadata_id_fkey"
            columns: ["id"]
            referencedRelation: "scripts"
            referencedColumns: ["id"]
          },
        ]
      }
      prices: {
        Row: {
          active: boolean
          amount: number
          currency: string
          id: string
          interval: string
          product: string
        }
        Insert: {
          active?: boolean
          amount: number
          currency?: string
          id: string
          interval: string
          product: string
        }
        Update: {
          active?: boolean
          amount?: number
          currency?: string
          id?: string
          interval?: string
          product?: string
        }
        Relationships: [
          {
            foreignKeyName: "prices_product_fkey"
            columns: ["product"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          active: boolean
          bundle: string | null
          id: string
          name: string
          script: string | null
          stripe_user: string | null
          user_id: string
        }
        Insert: {
          active?: boolean
          bundle?: string | null
          id: string
          name: string
          script?: string | null
          stripe_user?: string | null
          user_id: string
        }
        Update: {
          active?: boolean
          bundle?: string | null
          id?: string
          name?: string
          script?: string | null
          stripe_user?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_bundle_fkey"
            columns: ["bundle"]
            referencedRelation: "bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_script_fkey"
            columns: ["script"]
            referencedRelation: "scripts"
            referencedColumns: ["id"]
          },
        ]
      }
      protected: {
        Row: {
          assets: string
          author_id: string
          avatar: string
          broken: boolean
          id: string
          revision: number
          revision_date: string
          username: string
        }
        Insert: {
          assets?: string
          author_id: string
          avatar?: string
          broken?: boolean
          id: string
          revision?: number
          revision_date?: string
          username?: string
        }
        Update: {
          assets?: string
          author_id?: string
          avatar?: string
          broken?: boolean
          id?: string
          revision?: number
          revision_date?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "protected_id_fkey"
            columns: ["id"]
            referencedRelation: "scripts"
            referencedColumns: ["id"]
          },
        ]
      }
      scripts: {
        Row: {
          categories: string[] | null
          content: string
          created_at: string
          description: string
          fts: unknown | null
          id: string
          max_gp: number | null
          max_xp: number | null
          min_gp: number | null
          min_xp: number | null
          product: string | null
          published: boolean
          search: string | null
          subcategories: string[] | null
          title: string
          tooltip_emojis: string[] | null
          tooltip_names: string[] | null
          url: string | null
        }
        Insert: {
          categories?: string[] | null
          content: string
          created_at?: string
          description: string
          fts?: unknown | null
          id?: string
          max_gp?: number | null
          max_xp?: number | null
          min_gp?: number | null
          min_xp?: number | null
          product?: string | null
          published?: boolean
          search?: string | null
          subcategories?: string[] | null
          title: string
          tooltip_emojis?: string[] | null
          tooltip_names?: string[] | null
          url?: string | null
        }
        Update: {
          categories?: string[] | null
          content?: string
          created_at?: string
          description?: string
          fts?: unknown | null
          id?: string
          max_gp?: number | null
          max_xp?: number | null
          min_gp?: number | null
          min_xp?: number | null
          product?: string | null
          published?: boolean
          search?: string | null
          subcategories?: string[] | null
          title?: string
          tooltip_emojis?: string[] | null
          tooltip_names?: string[] | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scripts_product_fkey"
            columns: ["product"]
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      stats_limits: {
        Row: {
          gp_max: number
          gp_min: number
          id: string
          xp_max: number
          xp_min: number
        }
        Insert: {
          gp_max?: number
          gp_min?: number
          id: string
          xp_max?: number
          xp_min?: number
        }
        Update: {
          gp_max?: number
          gp_min?: number
          id?: string
          xp_max?: number
          xp_min?: number
        }
        Relationships: [
          {
            foreignKeyName: "stats_limits_id_fkey"
            columns: ["id"]
            referencedRelation: "scripts"
            referencedColumns: ["id"]
          },
        ]
      }
      stats_simba: {
        Row: {
          experience: number
          gold: number
          id: string
          levels: number
          online_users: Json[]
          online_users_total: number
          runtime: number
          unique_users: string[]
          unique_users_total: number
        }
        Insert: {
          experience?: number
          gold?: number
          id: string
          levels?: number
          online_users?: Json[]
          online_users_total?: number
          runtime?: number
          unique_users?: string[]
          unique_users_total?: number
        }
        Update: {
          experience?: number
          gold?: number
          id?: string
          levels?: number
          online_users?: Json[]
          online_users_total?: number
          runtime?: number
          unique_users?: string[]
          unique_users_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "stats_simba_id_fkey"
            columns: ["id"]
            referencedRelation: "scripts"
            referencedColumns: ["id"]
          },
        ]
      }
      stats_site: {
        Row: {
          id: string
          month_anchor: string
          month_downloads: string[]
          month_downloads_total: number
          month_reports: string[]
          month_reports_total: number
          notified: boolean
          previous_months: Json[]
          unique_downloads: string[]
          unique_downloads_total: number
        }
        Insert: {
          id: string
          month_anchor?: string
          month_downloads?: string[]
          month_downloads_total?: number
          month_reports?: string[]
          month_reports_total?: number
          notified?: boolean
          previous_months?: Json[]
          unique_downloads?: string[]
          unique_downloads_total?: number
        }
        Update: {
          id?: string
          month_anchor?: string
          month_downloads?: string[]
          month_downloads_total?: number
          month_reports?: string[]
          month_reports_total?: number
          notified?: boolean
          previous_months?: Json[]
          unique_downloads?: string[]
          unique_downloads_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "stats_site_id_fkey"
            columns: ["id"]
            referencedRelation: "scripts"
            referencedColumns: ["id"]
          },
        ]
      }
      subcategories: {
        Row: {
          category: string
          emoji: string
          name: string
        }
        Insert: {
          category: string
          emoji: string
          name: string
        }
        Update: {
          category?: string
          emoji?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_fkey"
            columns: ["category"]
            referencedRelation: "categories"
            referencedColumns: ["name"]
          },
        ]
      }
    }
    Views: {
      author_scripts: {
        Row: {
          author_id: string | null
          premium: number | null
          scripts: string[] | null
        }
        Relationships: []
      }
      featured_mv: {
        Row: {
          id: string | null
          title: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      add_botter: {
        Args: {
          script_id: string
          user_id: string
        }
        Returns: undefined
      }
      add_downloader: {
        Args: {
          script_id: string
          user_id: string
        }
        Returns: undefined
      }
      add_reporter: {
        Args: {
          script_id: string
          user_id: string
        }
        Returns: undefined
      }
      bundle_contains: {
        Args: {
          bundle: string
          script: string
        }
        Returns: boolean
      }
      cron_refresh_featured: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      fix_categories:
        | {
            Args: {
              categories: string[]
            }
            Returns: string[]
          }
        | {
            Args: {
              user_id: string
              categories: string[]
            }
            Returns: string[]
          }
      get_assets: {
        Args: {
          script_id: string
        }
        Returns: string
      }
      get_bundle_scripts: {
        Args: {
          ids: string[]
        }
        Returns: string[]
      }
      get_month_downloads_total: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_month_premium_downloads_total: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_revision: {
        Args: {
          script_id: string
        }
        Returns: number
      }
      get_script_owner: {
        Args: {
          script_id: string
        }
        Returns: string
      }
      get_site_stats: {
        Args: {
          user_id: string
        }
        Returns: {
          total_scripts: number
          total_user_scripts: number
          user_scripts: string[]
          total_premium_scripts: number
          total_user_premium_scripts: number
          month_downloads: number
          month_user_downloads: number
          month_premium_downloads: number
          month_premium_user_downloads: number
        }[]
      }
      get_tooltip_emojis: {
        Args: {
          categories: string[]
          subcategories: string[]
        }
        Returns: string[]
      }
      get_tooltip_names: {
        Args: {
          categories: string[]
          subcategories: string[]
        }
        Returns: string[]
      }
      get_user_scripts: {
        Args: {
          user_id: string
        }
        Returns: {
          id: string
        }[]
      }
      get_virtual_level: {
        Args: {
          experience: number
        }
        Returns: number
      }
      is_author:
        | {
            Args: {
              script_id: string
            }
            Returns: boolean
          }
        | {
            Args: {
              script_id: string
              user_id: string
            }
            Returns: boolean
          }
      is_premium_script: {
        Args: {
          script_id: string
        }
        Returns: boolean
      }
      script_exists: {
        Args: {
          script_id: string
        }
        Returns: boolean
      }
      stats_site_monthly_reset: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      storage_can_download: {
        Args: {
          file_path: string
        }
        Returns: boolean
      }
      storage_can_edit: {
        Args: {
          file_path: string
        }
        Returns: boolean
      }
      storage_img_can_edit: {
        Args: {
          file_path: string
        }
        Returns: boolean
      }
    }
    Enums: {
      status: "Official" | "Community"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  storage: {
    Tables: {
      buckets: {
        Row: {
          allowed_mime_types: string[] | null
          avif_autodetection: boolean | null
          created_at: string | null
          file_size_limit: number | null
          id: string
          name: string
          owner: string | null
          owner_id: string | null
          public: boolean | null
          updated_at: string | null
        }
        Insert: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id: string
          name: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Update: {
          allowed_mime_types?: string[] | null
          avif_autodetection?: boolean | null
          created_at?: string | null
          file_size_limit?: number | null
          id?: string
          name?: string
          owner?: string | null
          owner_id?: string | null
          public?: boolean | null
          updated_at?: string | null
        }
        Relationships: []
      }
      migrations: {
        Row: {
          executed_at: string | null
          hash: string
          id: number
          name: string
        }
        Insert: {
          executed_at?: string | null
          hash: string
          id: number
          name: string
        }
        Update: {
          executed_at?: string | null
          hash?: string
          id?: number
          name?: string
        }
        Relationships: []
      }
      objects: {
        Row: {
          bucket_id: string | null
          created_at: string | null
          id: string
          last_accessed_at: string | null
          level: number | null
          metadata: Json | null
          name: string | null
          owner: string | null
          owner_id: string | null
          path_tokens: string[] | null
          updated_at: string | null
          user_metadata: Json | null
          version: string | null
        }
        Insert: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Update: {
          bucket_id?: string | null
          created_at?: string | null
          id?: string
          last_accessed_at?: string | null
          level?: number | null
          metadata?: Json | null
          name?: string | null
          owner?: string | null
          owner_id?: string | null
          path_tokens?: string[] | null
          updated_at?: string | null
          user_metadata?: Json | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "objects_bucketId_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      prefixes: {
        Row: {
          bucket_id: string
          created_at: string | null
          level: number
          name: string
          updated_at: string | null
        }
        Insert: {
          bucket_id: string
          created_at?: string | null
          level?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          bucket_id?: string
          created_at?: string | null
          level?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "prefixes_bucketId_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads: {
        Row: {
          bucket_id: string
          created_at: string
          id: string
          in_progress_size: number
          key: string
          owner_id: string | null
          upload_signature: string
          user_metadata: Json | null
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          id: string
          in_progress_size?: number
          key: string
          owner_id?: string | null
          upload_signature: string
          user_metadata?: Json | null
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          id?: string
          in_progress_size?: number
          key?: string
          owner_id?: string | null
          upload_signature?: string
          user_metadata?: Json | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_bucket_id_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
        ]
      }
      s3_multipart_uploads_parts: {
        Row: {
          bucket_id: string
          created_at: string
          etag: string
          id: string
          key: string
          owner_id: string | null
          part_number: number
          size: number
          upload_id: string
          version: string
        }
        Insert: {
          bucket_id: string
          created_at?: string
          etag: string
          id?: string
          key: string
          owner_id?: string | null
          part_number: number
          size?: number
          upload_id: string
          version: string
        }
        Update: {
          bucket_id?: string
          created_at?: string
          etag?: string
          id?: string
          key?: string
          owner_id?: string | null
          part_number?: number
          size?: number
          upload_id?: string
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "s3_multipart_uploads_parts_bucket_id_fkey"
            columns: ["bucket_id"]
            referencedRelation: "buckets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "s3_multipart_uploads_parts_upload_id_fkey"
            columns: ["upload_id"]
            referencedRelation: "s3_multipart_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_prefixes: {
        Args: {
          _bucket_id: string
          _name: string
        }
        Returns: undefined
      }
      can_insert_object: {
        Args: {
          bucketid: string
          name: string
          owner: string
          metadata: Json
        }
        Returns: undefined
      }
      delete_prefix: {
        Args: {
          _bucket_id: string
          _name: string
        }
        Returns: boolean
      }
      extension: {
        Args: {
          name: string
        }
        Returns: string
      }
      filename: {
        Args: {
          name: string
        }
        Returns: string
      }
      foldername: {
        Args: {
          name: string
        }
        Returns: string[]
      }
      get_level: {
        Args: {
          name: string
        }
        Returns: number
      }
      get_prefix: {
        Args: {
          name: string
        }
        Returns: string
      }
      get_prefixes: {
        Args: {
          name: string
        }
        Returns: string[]
      }
      get_size_by_bucket: {
        Args: Record<PropertyKey, never>
        Returns: {
          size: number
          bucket_id: string
        }[]
      }
      list_multipart_uploads_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          next_key_token?: string
          next_upload_token?: string
        }
        Returns: {
          key: string
          id: string
          created_at: string
        }[]
      }
      list_objects_with_delimiter: {
        Args: {
          bucket_id: string
          prefix_param: string
          delimiter_param: string
          max_keys?: number
          start_after?: string
          next_token?: string
        }
        Returns: {
          name: string
          id: string
          metadata: Json
          updated_at: string
        }[]
      }
      operation: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      search: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
      search_legacy_v1: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
      search_v1_optimised: {
        Args: {
          prefix: string
          bucketname: string
          limits?: number
          levels?: number
          offsets?: number
          search?: string
          sortcolumn?: string
          sortorder?: string
        }
        Returns: {
          name: string
          id: string
          updated_at: string
          created_at: string
          last_accessed_at: string
          metadata: Json
        }[]
      }
      search_v2: {
        Args: {
          prefix: string
          bucket_name: string
          limits?: number
          levels?: number
          start_after?: string
        }
        Returns: {
          key: string
          name: string
          id: string
          updated_at: string
          created_at: string
          metadata: Json
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
  stripe: {
    Tables: {
      customers: {
        Row: {
          attrs: Json | null
          created: string | null
          description: string | null
          email: string | null
          id: string | null
          name: string | null
        }
        Insert: {
          attrs?: Json | null
          created?: string | null
          description?: string | null
          email?: string | null
          id?: string | null
          name?: string | null
        }
        Update: {
          attrs?: Json | null
          created?: string | null
          description?: string | null
          email?: string | null
          id?: string | null
          name?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          attrs: Json | null
          currency: string | null
          customer: string | null
          id: string | null
          period_end: string | null
          period_start: string | null
          status: string | null
          subscription: string | null
          total: number | null
        }
        Insert: {
          attrs?: Json | null
          currency?: string | null
          customer?: string | null
          id?: string | null
          period_end?: string | null
          period_start?: string | null
          status?: string | null
          subscription?: string | null
          total?: number | null
        }
        Update: {
          attrs?: Json | null
          currency?: string | null
          customer?: string | null
          id?: string | null
          period_end?: string | null
          period_start?: string | null
          status?: string | null
          subscription?: string | null
          total?: number | null
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean | null
          attrs: Json | null
          created: string | null
          default_price: string | null
          description: string | null
          id: string | null
          name: string | null
          updated: string | null
        }
        Insert: {
          active?: boolean | null
          attrs?: Json | null
          created?: string | null
          default_price?: string | null
          description?: string | null
          id?: string | null
          name?: string | null
          updated?: string | null
        }
        Update: {
          active?: boolean | null
          attrs?: Json | null
          created?: string | null
          default_price?: string | null
          description?: string | null
          id?: string | null
          name?: string | null
          updated?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          attrs: Json | null
          currency: string | null
          current_period_end: string | null
          current_period_start: string | null
          customer: string | null
          id: string | null
        }
        Insert: {
          attrs?: Json | null
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          customer?: string | null
          id?: string | null
        }
        Update: {
          attrs?: Json | null
          currency?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          customer?: string | null
          id?: string | null
        }
        Relationships: []
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
