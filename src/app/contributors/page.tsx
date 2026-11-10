import type { Metadata } from 'next'
import Link from 'next/link'
import { getContributors } from '@/lib/contributors'
import { contributorPath } from '@/lib/credits'
import Masthead from '@/components/Masthead'
import { currentMasthead } from '@/content/masthead'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Contributors & Masthead — The Blueprint',
  description: 'Everyone published in The Blueprint, the NYU Tandon zine, and the team that makes it.',
}

export default async function ContributorsPage() {
  const people = await getContributors()

  return (
    <main className="flex-1 bg-[#0a0a0a] text-white min-h-[calc(100vh-64px)]">
      <div className="mx-auto max-w-[760px] px-5 pt-[100px] pb-24 md:px-8">
        <h1
          className="text-center uppercase"
          style={{
            fontFamily: 'var(--font-blue-screen)',
            fontSize: 'clamp(28px, 6vw, 42px)',
            letterSpacing: 4,
          }}
        >
          Contributors
        </h1>
        <div className="mx-auto mt-4 mb-12 h-px w-10 bg-[#c0392b]" />

        {people.length === 0 ? (
          <p className="text-center text-white/40" style={{ fontFamily: 'sans-serif' }}>
            No contributors yet.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-x-10 sm:grid-cols-2">
            {people.map((p) => (
              <li key={p.slug} className="border-b border-white/10">
                <Link
                  href={contributorPath(p.slug)}
                  className="flex items-baseline justify-between gap-4 py-3 text-white no-underline hover:text-[#FFBDD0] transition-colors"
                >
                  <span className="text-lg" style={{ fontFamily: 'var(--font-new-science)' }}>
                    {p.name}
                  </span>
                  <span className="shrink-0 text-xs text-white/35" style={{ fontFamily: 'sans-serif' }}>
                    {p.workCount} {p.workCount === 1 ? 'work' : 'works'}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        {currentMasthead && (
          <Masthead masthead={currentMasthead} />
        )}
      </div>
    </main>
  )
}
