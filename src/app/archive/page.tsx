import type { Metadata } from 'next'
import { supabase } from '@/lib/supabase'   // ← uncomment with the working version below
import type { Issue } from '@/types'
import ArchiveView from '@/components/ArchiveView'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Archive — The Blueprint',
}

// ----------------------------------------------------------------
// WORKING VERSION (real Supabase data), commented out while designing.
// To restore: uncomment this block + the supabase import above,
// then delete the MOCK VERSION below.
// ----------------------------------------------------------------
async function getPastIssues(): Promise<Issue[]> {
  const { data, error } = await supabase
    .from('issues')
    .select('id, title, semester, published_at, is_current, cover_image_url')
    .eq('is_current', true)
    .lte('published_at', new Date().toISOString())
    .order('published_at', {ascending: false})

  if (error) {
    console.error('Error fetching past issues:', error)
    return []
  }
  return data as Issue[]
}

export default async function ArchivePage() {
  const issues = await getPastIssues()   // ← the data. Keep this.
  return <ArchiveView issues={issues} columns={3} />
         // ← the UI. Anything you like.
}

// ----------------------------------------------------------------
// MOCK VERSION: fake past issues for designing the layout.
// cover_image_url is null, so each card shows a blank white 8.5×11 mockup.
// ----------------------------------------------------------------
// const MOCK_ISSUES: Issue[] = [
//   { id: 'mock-7', title: '2026 Spring Issue', semester: 'Spring 2026', published_at: '2026-04-15', is_current: false, cover_image_url: null },
//   { id: 'mock-6', title: '2025 Fall Issue',   semester: 'Fall 2025',   published_at: '2025-12-01', is_current: false, cover_image_url: null },
//   { id: 'mock-5', title: '2025 Spring Issue', semester: 'Spring 2025', published_at: '2025-04-15', is_current: false, cover_image_url: null },
//   { id: 'mock-4', title: '2024 Fall Issue',   semester: 'Fall 2024',   published_at: '2024-12-01', is_current: false, cover_image_url: null },
//   { id: 'mock-3', title: '2024 Spring Issue', semester: 'Spring 2024', published_at: '2024-04-15', is_current: false, cover_image_url: null },
//   { id: 'mock-2', title: '2023 Fall Issue',   semester: 'Fall 2023',   published_at: '2023-12-01', is_current: false, cover_image_url: null },
//   { id: 'mock-1', title: '2023 Spring Issue', semester: 'Spring 2023', published_at: '2023-04-15', is_current: false, cover_image_url: null },
// ]

// export default async function ArchivePage() {
//   return <ArchiveView issues={MOCK_ISSUES} columns={3} />
// }
