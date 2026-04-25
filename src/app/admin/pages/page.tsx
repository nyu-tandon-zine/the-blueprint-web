import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Issue, Page } from '@/types'
import AdminPagesClient from '@/components/AdminPagesClient'

export const dynamic = 'force-dynamic'

export default async function AdminPagesPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: issueData } = await supabase
    .from('issues')
    .select('*')
    .eq('is_current', true)
    .single()

  const issue = issueData as Issue | null

  const pages: Page[] = issue ? await (async () => {
    const { data } = await supabase
      .from('pages')
      .select('*')
      .eq('issue_id', issue.id)
      .order('page_number', { ascending: true })
    return (data ?? []) as Page[]
  })() : []

  return (
    <main className="flex-1 bg-white">
      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-gray-400 hover:text-gray-700 transition-colors">←</Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Flipbook Pages</h1>
              {issue && (
                <p className="text-sm text-gray-500 mt-0.5">{issue.semester} — {pages.length} page{pages.length !== 1 ? 's' : ''}</p>
              )}
            </div>
          </div>
          <Link
            href="/read"
            target="_blank"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors border border-gray-200 rounded px-3 py-1.5"
          >
            Preview flipbook ↗
          </Link>
        </div>

        {!issue ? (
          <p className="text-gray-400 text-sm">No current issue found. Set an issue as current in Supabase first.</p>
        ) : (
          <AdminPagesClient issue={issue} initialPages={pages} />
        )}
      </div>
    </main>
  )
}
