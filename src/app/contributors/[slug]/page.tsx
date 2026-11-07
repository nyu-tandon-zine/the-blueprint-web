import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Byline from '@/components/Byline'
import { getContributor } from '@/lib/contributors'

export const dynamic = 'force-dynamic'

const MEDIA_LABEL: Record<string, string> = {
  prose: 'Prose',
  poetry: 'Poetry',
  'visual-art': 'Visual Art',
  audio: 'Audio',
  film: 'Film',
  game: 'Game',
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const person = await getContributor(slug)   // cached: same query as the page
  if (!person) return { title: 'Contributor not found — The Blueprint' }

  const description = person.bio
    ? person.bio.slice(0, 160)
    : `Work by ${person.name} in The Blueprint, the NYU Tandon zine.`
  return {
    title: `${person.name} — The Blueprint`,
    description,
    openGraph: { title: person.name, description },
  }
}

export default async function ContributorPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const person = await getContributor(slug)
  if (!person) notFound()

  const workCount = person.issues.reduce((n, g) => n + g.works.length, 0)

  return (
    <main className="flex-1 bg-[#0a0a0a] text-white min-h-[calc(100vh-64px)]">
      <div className="mx-auto max-w-[760px] px-5 pt-6 pb-24 md:px-8">
        <Link
          href="/contributors"
          className="text-[13px] tracking-[1px] text-white/60 no-underline hover:text-white"
          style={{ fontFamily: 'sans-serif' }}
        >
          ← All contributors
        </Link>

        {/* Header */}
        <header className="mt-14 mb-12">
          <h1
            className="text-white uppercase break-words"
            style={{
              fontFamily: 'var(--font-blue-screen)',
              fontSize: 'clamp(28px, 6vw, 42px)',
              letterSpacing: 4,
              lineHeight: 1.15,
            }}
          >
            {person.name}
          </h1>
          <div className="mt-4 mb-6 h-px w-10 bg-[#c0392b]" />
          {person.bio && (
            <p
              className="max-w-[640px] text-base leading-relaxed text-white/85 whitespace-pre-line"
              style={{ fontFamily: 'sans-serif' }}
            >
              {person.bio}
            </p>
          )}
        </header>

        {/* Works, grouped by issue */}
        {workCount === 0 ? (
          <p className="text-white/40" style={{ fontFamily: 'sans-serif' }}>
            No published work yet.
          </p>
        ) : (
          person.issues.map(({ issue, works }) => (
            <section key={issue.id} className="mb-12">
              <h2
                className="mb-2 text-[13px] uppercase text-white/45"
                // New Science, not Blue Screen: the Blue Screen demo font has no real digits
                style={{ fontFamily: 'var(--font-new-science)', letterSpacing: 3 }}
              >
                {issue.title}
              </h2>
              <ul className="border-t border-white/10">
                {works.map((w) => (
                  <li key={w.id} className="border-b border-white/10 py-5">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                      <Link
                        href={`/works/${w.id}`}
                        className="text-2xl leading-snug text-white no-underline hover:text-[#FFBDD0] transition-colors"
                        style={{ fontFamily: 'var(--font-new-science)' }}
                      >
                        {w.title}
                      </Link>
                      <span
                        className="shrink-0 rounded-full border border-[#c0392b]/40 px-3 py-[3px] text-[11px] text-[#e74c3c]/80"
                        style={{ fontFamily: 'sans-serif' }}
                      >
                        {w.genre || MEDIA_LABEL[w.media_type] || w.media_type}
                      </span>
                    </div>
                    {(w.role || w.coCredits.length > 0) && (
                      <p className="mt-2 text-sm text-white/50" style={{ fontFamily: 'sans-serif' }}>
                        {w.role && <span className="capitalize">{w.role}</span>}
                        {w.role && w.coCredits.length > 0 && ' · '}
                        {w.coCredits.length > 0 && (
                          <>with <Byline credits={w.coCredits} /></>
                        )}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ))
        )}
      </div>
    </main>
  )
}
