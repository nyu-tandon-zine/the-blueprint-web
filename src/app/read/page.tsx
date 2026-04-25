import { supabase } from '@/lib/supabase'
import type { Issue, Page, Work } from '@/types'
import FlipbookViewer from '@/components/FlipbookViewer'

export const dynamic = 'force-dynamic'

async function getCurrentIssue(): Promise<Issue | null> {
  const { data, error } = await supabase
    .from('issues')
    .select('*')
    .eq('is_current', true)
    .single()

  if (error) return null
  return data
}

async function getPagesForIssue(issueId: string): Promise<Page[]> {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('issue_id', issueId)
    .order('page_number', { ascending: true })

  if (error) return []
  return data
}

async function getWorksForIssue(issueId: string): Promise<Work[]> {
  const { data, error } = await supabase
    .from('works')
    .select('id, title, media_type, genre, start_page, author_id, issue_id, created_at, description, content, works_cited, media_url, external_link')
    .eq('issue_id', issueId)
    .not('start_page', 'is', null)
    .order('start_page', { ascending: true })

  if (error) return []
  return data as Work[]
}

export default async function ReadPage() {
  const issue = await getCurrentIssue()

  if (!issue) {
    return (
      <main className="flex-1 bg-black flex items-center justify-center">
        <p className="text-gray-500">No current issue found.</p>
      </main>
    )
  }

  const [pages, works] = await Promise.all([
    getPagesForIssue(issue.id),
    getWorksForIssue(issue.id),
  ])

  return (
    <main className="flex-1 bg-black">
      <FlipbookViewer pages={pages} issue={issue} works={works} />
    </main>
  )
}
