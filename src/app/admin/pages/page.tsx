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
    <main className="flex-1" style={{ background: '#0a0a0a', color: '#fff', minHeight: '100vh' }}>
      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: 18 }}>←</Link>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 600, color: '#fff', marginBottom: 2 }}>Flipbook Pages</h1>
              {issue && (
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: 'sans-serif' }}>
                  {issue.semester} — {pages.length} page{pages.length !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
          <Link
            href="/read"
            target="_blank"
            style={{
              fontSize: 13,
              color: 'rgba(255,255,255,0.5)',
              fontFamily: 'sans-serif',
              textDecoration: 'none',
              border: '0.5px solid rgba(255,255,255,0.15)',
              borderRadius: 6,
              padding: '6px 12px',
            }}
          >
            Preview flipbook ↗
          </Link>
        </div>

        {!issue ? (
          <p style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'sans-serif', fontSize: 14 }}>
            No current issue found. Set an issue as current in Supabase first.
          </p>
        ) : (
          <AdminPagesClient issue={issue} initialPages={pages} />
        )}
      </div>
    </main>
  )
}
