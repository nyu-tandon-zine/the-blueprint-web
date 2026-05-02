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
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: 13,
        color: 'rgba(220,60,60,0.7)',
        fontFamily: 'sans-serif',
        padding: 0,
      }}
    >
      Delete
    </button>
  )
}
