import { createClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Work } from '@/types'
import AdminLogout from '@/components/AdminLogout'
import DeleteWorkButton from '@/components/DeleteWorkButton'

export default async function AdminDashboard() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const { data: works } = await supabase
    .from('works')
    .select('*, author:authors(*), issue:issues(*)')
    .order('created_at', { ascending: false })

  return (
    <main className="flex-1" style={{ background: '#0a0a0a', color: '#fff', minHeight: '100vh' }}>
      <div className="max-w-5xl mx-auto px-8 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: '#fff', marginBottom: 4 }}>Admin Dashboard</h1>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', fontFamily: 'sans-serif' }}>{user.email}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/pages"
              style={{
                border: '0.5px solid rgba(255,255,255,0.2)',
                color: 'rgba(255,255,255,0.7)',
                padding: '7px 14px',
                borderRadius: 6,
                fontSize: 13,
                fontFamily: 'sans-serif',
                textDecoration: 'none',
              }}
            >
              Manage Pages
            </Link>
            <Link
              href="/admin/works/new"
              style={{
                background: '#c0392b',
                color: '#fff',
                padding: '7px 14px',
                borderRadius: 6,
                fontSize: 13,
                fontFamily: 'sans-serif',
                textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              + Add Work
            </Link>
            <AdminLogout />
          </div>
        </div>

        {/* Works table */}
        {!works || works.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.3)', fontFamily: 'sans-serif', fontSize: 14 }}>No works yet. Add your first one above.</p>
        ) : (
          <div style={{ border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 8, overflow: 'hidden' }}>
            <table className="w-full" style={{ fontSize: 13, borderCollapse: 'collapse' }}>
              <thead style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '0.5px solid rgba(255,255,255,0.1)' }}>
                <tr>
                  <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: 'rgba(255,255,255,0.5)', fontFamily: 'sans-serif' }}>Title</th>
                  <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: 'rgba(255,255,255,0.5)', fontFamily: 'sans-serif' }}>Author</th>
                  <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: 'rgba(255,255,255,0.5)', fontFamily: 'sans-serif' }}>Type</th>
                  <th style={{ textAlign: 'left', padding: '10px 16px', fontWeight: 500, color: 'rgba(255,255,255,0.5)', fontFamily: 'sans-serif' }}>Issue</th>
                  <th style={{ padding: '10px 16px' }} />
                </tr>
              </thead>
              <tbody>
                {(works as Work[]).map((work, i) => (
                  <tr
                    key={work.id}
                    style={{
                      borderTop: i > 0 ? '0.5px solid rgba(255,255,255,0.06)' : undefined,
                    }}
                    className="admin-row"
                  >
                    <td style={{ padding: '12px 16px', color: '#fff', fontFamily: 'sans-serif' }}>
                      <Link href={`/works/${work.id}`} target="_blank" style={{ color: '#fff', textDecoration: 'none' }}
                        className="hover:underline">
                        {work.title}
                      </Link>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.55)', fontFamily: 'sans-serif' }}>{work.author?.name ?? '—'}</td>
                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.55)', fontFamily: 'sans-serif', textTransform: 'capitalize' }}>{work.media_type}</td>
                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.55)', fontFamily: 'sans-serif' }}>{work.issue?.semester ?? '—'}</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div className="flex items-center justify-end gap-4">
                        <Link
                          href={`/admin/works/${work.id}/edit`}
                          style={{ color: 'rgba(255,255,255,0.45)', fontFamily: 'sans-serif', fontSize: 13, textDecoration: 'none' }}
                          className="hover:text-white transition-colors"
                        >
                          Edit
                        </Link>
                        <DeleteWorkButton workId={work.id} workTitle={work.title} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  )
}
