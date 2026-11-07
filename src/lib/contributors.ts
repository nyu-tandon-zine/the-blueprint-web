import { cache } from 'react'
import { supabase } from '@/lib/supabase'
import type { Credit, Issue, MediaType } from '@/types'
import { sortedCredits } from '@/lib/credits'

// ----------------------------------------------------------------
// Data access for /contributors. Public columns only.
//
// Visibility rule: a work shows up on a contributor page only once its
// issue is published (issues.published_at <= now). That keeps works for an
// issue still being assembled in the admin from leaking out early through
// someone's profile. Set published_at when an issue goes live.
// ----------------------------------------------------------------

type IssueSummary = Pick<Issue, 'id' | 'title' | 'semester' | 'published_at'>

export interface ContributorWork {
  id: string
  title: string
  media_type: MediaType
  genre: string | null
  position: number | null
  issue: IssueSummary | null
  credits?: Credit[]
}

export interface ContributorProfile {
  id: string
  name: string
  slug: string
  bio: string | null
  /** Published works grouped by issue, newest issue first. */
  issues: {
    issue: IssueSummary
    works: (ContributorWork & { role: string | null; coCredits: Credit[] })[]
  }[]
}

function isPublished(issue: IssueSummary | null): issue is IssueSummary {
  return !!issue?.published_at && new Date(issue.published_at) <= new Date()
}

/** One contributor + their published works. null if the slug doesn't exist. */
export const getContributor = cache(async (slug: string): Promise<ContributorProfile | null> => {
  const { data, error } = await supabase
    .from('authors')
    .select(`
      id, name, slug, bio,
      credits:work_authors(
        role,
        work:works(
          id, title, media_type, genre, position,
          issue:issues(id, title, semester, published_at),
          credits:work_authors(position, role, author:authors(id, name, slug))
        )
      )
    `)
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw error   // real failures → error page, not a fake 404
  if (!data) return null

  const row = data as unknown as {
    id: string; name: string; slug: string; bio: string | null
    credits: { role: string | null; work: ContributorWork | null }[]
  }

  const byIssue = new Map<string, ContributorProfile['issues'][number]>()
  for (const { role, work } of row.credits ?? []) {
    if (!work || !isPublished(work.issue)) continue
    const group = byIssue.get(work.issue.id) ?? { issue: work.issue, works: [] }
    group.works.push({
      ...work,
      role,
      coCredits: sortedCredits(work).filter((c) => c.author.id !== row.id),
    })
    byIssue.set(work.issue.id, group)
  }

  const issues = [...byIssue.values()]
    .sort((a, b) => b.issue.published_at.localeCompare(a.issue.published_at))
    .map((g) => ({ ...g, works: g.works.sort((a, b) => (a.position ?? 0) - (b.position ?? 0)) }))

  return { id: row.id, name: row.name, slug: row.slug, bio: row.bio, issues }
})

/** Everyone with at least one published work, A→Z, with their work count. */
export async function getContributors(): Promise<{ name: string; slug: string; workCount: number }[]> {
  const { data, error } = await supabase
    .from('authors')
    .select('name, slug, credits:work_authors!inner(work:works(issue:issues(published_at)))')
    .order('name')

  if (error) throw error

  const rows = (data ?? []) as unknown as {
    name: string; slug: string
    credits: { work: { issue: IssueSummary | null } | null }[]
  }[]

  return rows
    .map((r) => ({
      name: r.name,
      slug: r.slug,
      workCount: r.credits.filter((c) => isPublished(c.work?.issue ?? null)).length,
    }))
    .filter((r) => r.workCount > 0)
}
