import type { Metadata } from 'next'
import { cache } from 'react'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Issue, Page, Work } from '@/types'
import FlipbookViewer from '@/components/FlipbookViewer'

export const dynamic = 'force-dynamic'

// issues.id is a UUID. Checking the format first means a junk URL like
// /archive/hello gets a 404 instead of a Postgres "invalid uuid" error.
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** One published issue by id, or null. cache() lets the page and generateMetadata share one query. */
const getIssue = cache(async (id: string): Promise<Issue | null> => {
  if (!UUID.test(id)) return null

  const { data, error } = await supabase
    .from('issues')
    .select('id, title, semester, published_at, is_current, cover_image_url')
    .eq('id', id)
    .maybeSingle()

  if (error) throw error            // real failures → error page, not a fake 404
  if (!data) return null

  const issue = data as Issue
  // Don't expose an issue that's still being assembled in the admin
  if (new Date(issue.published_at) > new Date()) return null

  return issue
})

async function getPagesForIssue(issueId: string): Promise<Page[]> {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('issue_id', issueId)
    .order('page_number', { ascending: true })

  if (error) throw error
  return (data ?? []) as Page[]
}

async function getWorksForIssue(issueId: string): Promise<Work[]> {
  const { data, error } = await supabase
    .from('works')
    .select('id, title, media_type, genre, start_page, author_id, issue_id, created_at, description, content, works_cited, media_url, external_link')
    .eq('issue_id', issueId)
    .not('start_page', 'is', null)
    .order('start_page', { ascending: true })

  if (error) throw error
  return (data ?? []) as Work[]
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const issue = await getIssue(id)
  if (!issue) return { title: 'Issue not found — The Blueprint' }
  return { title: `${issue.title} — The Blueprint` }
}

export default async function ArchiveIssuePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const issue = await getIssue(id)
  if (!issue) notFound()

  const [pages, works] = await Promise.all([
    getPagesForIssue(issue.id),
    getWorksForIssue(issue.id),
  ])

  if (pages.length === 0) {
    return (
      <main className="flex-1 bg-black flex items-center justify-center">
        <p className="text-gray-500">This issue doesn&apos;t have any pages yet.</p>
      </main>
    )
  }

  return (
    <main className="flex-1 bg-black">
      <FlipbookViewer pages={pages} issue={issue} works={works} />
    </main>
  )
}
