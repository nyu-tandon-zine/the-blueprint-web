// ----------------------------------------------------------------
// Domain types — the shape of data used throughout the application
// ----------------------------------------------------------------

export type MediaType = 'prose' | 'poetry' | 'visual-art' | 'audio' | 'film' | 'game'

export type Genre =
  | 'fiction'
  | 'nonfiction'
  | 'poetry'
  | 'visual-art'
  | 'photography'
  | 'music'
  | 'film'
  | 'other'

export interface Issue {
  id: string
  title: string           // e.g. "2026 Spring Issue"
  semester: string        // e.g. "Spring 2026"
  published_at: string    // ISO date string
  is_current: boolean     // true for the issue shown on the homepage
}

export interface Author {
  id: string
  name: string
  major: string | null
  graduation_year: number | null
  bio: string | null
}

export interface Work {
  id: string
  title: string
  media_type: MediaType
  genre: Genre
  description: string | null
  content: string | null          // Full text body for prose and poetry
  works_cited: string | null      // Optional citations section for prose
  media_url: string | null        // URL to file in Supabase Storage
  external_link: string | null    // External link for audio (Spotify, SoundCloud, etc.)
  created_at: string
  issue_id: string
  author_id: string
  // Joined relations (populated when fetched with select)
  issue?: Issue
  author?: Author
}
