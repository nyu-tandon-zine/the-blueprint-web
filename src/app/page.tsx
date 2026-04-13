import { supabase } from '@/lib/supabase'
import type { Work, Issue } from '@/types'
import Link from 'next/link'

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
      <main className="flex-1 bg-white flex items-center justify-center">
        <p className="text-gray-500">No current issue found.</p>
      </main>
    )
  }

  const works = await getWorksForIssue(issue.id)

  // Group works by media type
  const grouped = works.reduce<Record<string, Work[]>>((acc, work) => {
    const key = work.media_type
    if (!acc[key]) acc[key] = []
    acc[key].push(work)
    return acc
  }, {})

  return (
    <main className="flex-1 bg-white">
      <div className="max-w-4xl mx-auto px-8 py-12">
      <header className="mb-12">
        <p className="text-sm uppercase tracking-widest text-gray-400 mb-2">
          The Blueprint
        </p>
        <h1 className="text-4xl font-bold text-gray-900">{issue.title}</h1>
        <p className="text-gray-500 mt-1">{issue.semester}</p>
        <Link
          href="/read"
          className="inline-block mt-4 text-sm text-gray-500 underline hover:text-gray-900 transition-colors"
        >
          Flipbook Mode →
        </Link>
      </header>

      {works.length === 0 ? (
        <p className="text-gray-400">No works published yet.</p>
      ) : (
        <div className="space-y-12">
          {Object.entries(grouped).map(([mediaType, items]) => (
            <section key={mediaType}>
              <h2 className="text-xs uppercase tracking-widest text-gray-400 border-b border-gray-100 pb-2 mb-4">
                {mediaType.replace('-', ' ')}
              </h2>
              <ul className="space-y-4">
                {items.map((work) => (
                  <li key={work.id}>
                    <Link
                      href={`/works/${work.id}`}
                      className="group flex justify-between items-baseline hover:bg-gray-50 px-2 py-1 -mx-2 rounded transition-colors"
                    >
                      <span className="font-medium text-gray-900 group-hover:text-black">
                        {work.title}
                      </span>
                      <span className="text-sm text-gray-400 ml-4 shrink-0">
                        {work.author?.name}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
      </div>
    </main>
  )
}
