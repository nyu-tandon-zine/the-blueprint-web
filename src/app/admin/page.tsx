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
    <main className="flex-1 bg-white">
      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-sm text-gray-500 mt-1">{user.email}</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/pages"
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Manage Pages
            </Link>
            <Link
              href="/admin/works/new"
              className="bg-gray-900 text-white px-4 py-2 rounded text-sm font-medium hover:bg-black transition-colors"
            >
              + Add Work
            </Link>
            <AdminLogout />
          </div>
        </div>

        {!works || works.length === 0 ? (
          <p className="text-gray-400">No works yet. Add your first one above.</p>
        ) : (
          <div className="border border-gray-200 rounded overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Author</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Issue</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(works as Work[]).map((work) => (
                  <tr key={work.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">
                      <Link href={`/works/${work.id}`} className="hover:underline" target="_blank">
                        {work.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{work.author?.name ?? '—'}</td>
                    <td className="px-4 py-3 text-gray-600 capitalize">{work.media_type}</td>
                    <td className="px-4 py-3 text-gray-600">{work.issue?.semester ?? '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/works/${work.id}/edit`}
                          className="text-gray-500 hover:text-gray-900 transition-colors"
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
