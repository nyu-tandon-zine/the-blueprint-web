'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

export default function AdminLogout() {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: 13,
        color: 'rgba(255,255,255,0.35)',
        fontFamily: 'sans-serif',
        padding: 0,
      }}
    >
      Log out
    </button>
  )
}
