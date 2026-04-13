import { supabase } from '@/lib/supabase'
import type { Issue, Page } from '@/types'
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

export default async function ReadPage() {
  const issue = await getCurrentIssue()

  if (!issue) {
    return (
      <main className="flex-1 bg-white flex items-center justify-center">
        <p className="text-gray-500">No current issue found.</p>
      </main>
    )
  }

  const pages = await getPagesForIssue(issue.id)

  return (
    <main className="flex-1 bg-white">
      <FlipbookViewer pages={pages} issue={issue} />
    </main>
  )
}
