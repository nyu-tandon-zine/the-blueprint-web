// ----------------------------------------------------------------
// Database types — mirrors the Supabase schema
//
// To auto-generate after schema changes, run:
//   npx supabase gen types typescript --project-id llcgqjqgdahpjwqsrfot > src/types/database.ts
// ----------------------------------------------------------------

export type Database = {
  public: {
    Tables: {
      issues: {
        Row: {
          id: string
          title: string
          semester: string
          published_at: string
          is_current: boolean
        }
        Insert: {
          id?: string
          title: string
          semester: string
          published_at: string
          is_current?: boolean
        }
        Update: {
          id?: string
          title?: string
          semester?: string
          published_at?: string
          is_current?: boolean
        }
      }
      authors: {
        Row: {
          id: string
          name: string
          nyu_school: string | null
          graduation_year: number | null
          bio: string | null
        }
        Insert: {
          id?: string
          name: string
          nyu_school?: string | null
          graduation_year?: number | null
          bio?: string | null
        }
        Update: {
          id?: string
          name?: string
          nyu_school?: string | null
          graduation_year?: number | null
          bio?: string | null
        }
      }
      works: {
        Row: {
          id: string
          title: string
          media_type: string
          genre: string
          description: string | null
          media_url: string | null
          created_at: string
          issue_id: string
          author_id: string
        }
        Insert: {
          id?: string
          title: string
          media_type: string
          genre: string
          description?: string | null
          media_url?: string | null
          created_at?: string
          issue_id: string
          author_id: string
        }
        Update: {
          id?: string
          title?: string
          media_type?: string
          genre?: string
          description?: string | null
          media_url?: string | null
          created_at?: string
          issue_id?: string
          author_id?: string
        }
      }
    }
  }
}
