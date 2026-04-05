'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

export default function DeleteWorkButton({
  workId,
  workTitle,
}: {
  workId: string
  workTitle: string
}) {
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(`Delete "${workTitle}"? This cannot be undone.`)) return

    const supabase = createClient()
    const { error } = await supabase.from('works').delete().eq('id', workId)

    if (error) {
      alert('Failed to delete work. Please try again.')
      return
    }

    router.refresh()
  }

  return (
    <button
      onClick={handleDelete}
      className="text-red-400 hover:text-red-600 transition-colors"
    >
      Delete
    </button>
  )
}
