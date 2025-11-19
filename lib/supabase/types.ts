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
      books: {
        Row: {
          category_id: number
          created_at: string | null
          file_path: string
          id: string
          title: string
          toc: Json | null
        }
        Insert: {
          category_id: number
          created_at?: string | null
          file_path: string
          id?: string
          title: string
          toc?: Json | null
        }
        Update: {
          category_id?: number
          created_at?: string | null
          file_path?: string
          id?: string
          title?: string
          toc?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "books_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          code: string
          created_at: string | null
          id: number
          name_ar: string
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: number
          name_ar: string
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: number
          name_ar?: string
        }
        Relationships: []
      }
      hadith_topics: {
        Row: {
          created_at: string | null
          global_tid: number
          topic_id: number
        }
        Insert: {
          created_at?: string | null
          global_tid: number
          topic_id: number
        }
        Update: {
          created_at?: string | null
          global_tid?: number
          topic_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "hadith_topics_global_tid_fkey"
            columns: ["global_tid"]
            isOneToOne: false
            referencedRelation: "hadiths"
            referencedColumns: ["global_tid"]
          },
          {
            foreignKeyName: "hadith_topics_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      hadiths: {
        Row: {
          aya: number | null
          book_id: string
          created_at: string | null
          global_tid: number | null
          id: number
          nass: string
          page: string | null
          part: string | null
        }
        Insert: {
          aya?: number | null
          book_id: string
          created_at?: string | null
          global_tid?: number | null
          id: number
          nass: string
          page?: string | null
          part?: string | null
        }
        Update: {
          aya?: number | null
          book_id?: string
          created_at?: string | null
          global_tid?: number | null
          id?: number
          nass?: string
          page?: string | null
          part?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hadiths_book_id_fkey"
            columns: ["book_id"]
            isOneToOne: false
            referencedRelation: "books"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          created_at: string | null
          id: number
          level: number
          parent_id: number | null
          title: string
        }
        Insert: {
          created_at?: string | null
          id: number
          level: number
          parent_id?: number | null
          title: string
        }
        Update: {
          created_at?: string | null
          id?: number
          level?: number
          parent_id?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "topics_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
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

