import type { Credit, Work } from '@/types'

/**
 * The embed to use whenever a public query needs a work's authors.
 * Only public author columns — never `authors(*)`.
 *
 *   .from('works').select(`*, ${CREDITS_SELECT}`)
 */
export const CREDITS_SELECT =
  'credits:work_authors(position, role, author:authors(id, name, slug))'

/** Credits in byline order (PostgREST doesn't guarantee embed order). */
export function sortedCredits(work: Pick<Work, 'credits'>): Credit[] {
  return (work.credits ?? []).slice().sort((a, b) => a.position - b.position)
}

/** "Ana", "Ana & Ben", "Ana, Ben & Cy" — plain text, for places that can't hold links. */
export function creditNames(credits: Credit[]): string {
  const names = credits.map((c) => c.author.name)
  if (names.length <= 1) return names[0] ?? ''
  return `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]}`
}

export function contributorPath(slug: string): string {
  return `/contributors/${slug}`
}
