import { supabase } from '@/lib/supabase'
import type { Work, Issue } from '@/types'
import HomepageClient from '@/components/HomepageClient'

export const dynamic = 'force-dynamic'

async function getCurrentIssue(): Promise<Issue | null> {
  const { data, error } = await supabase
    .from('issues')
    .select('*')
    .eq('is_current', true)
    .single()

  if (error) {
    console.error('Error fetching current issue:', error)
    return null
  }
  return data
}

async function getWorksForIssue(issueId: string): Promise<Work[]> {
  const { data, error } = await supabase
    .from('works')
    .select(`
      *,
      author:authors(*)
    `)
    .eq('issue_id', issueId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching works:', error)
    return []
  }
  return data as Work[]
}

export default async function HomePage() {
  const issue = await getCurrentIssue()

  if (!issue) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <p style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'sans-serif' }}>
          No current issue found.
        </p>
      </main>
    )
  }

  const works = await getWorksForIssue(issue.id)

  return <HomepageClient issue={issue} works={works} />
}
