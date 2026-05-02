'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <main className="flex-1 flex items-center justify-center px-8" style={{ background: '#0a0a0a' }}>
      <div className="w-full max-w-sm">

        {/* Logo + title */}
        <div className="flex items-center gap-3 mb-8">
          <Image src="/logo.png" alt="The Blueprint" width={28} height={40} style={{ objectFit: 'contain' }} />
          <div>
            <p style={{ fontFamily: "'Blue Screen', 'Courier New', monospace", fontSize: 13, letterSpacing: 3, color: '#B6CCFF' }}>
              The Blueprint
            </p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', fontFamily: 'sans-serif', letterSpacing: 1 }}>
              Admin
            </p>
          </div>
        </div>

        <h1 style={{ fontSize: 22, fontWeight: 600, color: '#fff', marginBottom: 6 }}>Sign in</h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 28, fontFamily: 'sans-serif' }}>NYU Tandon Zine</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 6, fontFamily: 'sans-serif', letterSpacing: 0.5 }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@nyu.edu"
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '0.5px solid rgba(255,255,255,0.15)',
                borderRadius: 6,
                padding: '10px 12px',
                fontSize: 14,
                color: '#fff',
                outline: 'none',
                fontFamily: 'sans-serif',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label htmlFor="password" style={{ display: 'block', fontSize: 12, color: 'rgba(255,255,255,0.55)', marginBottom: 6, fontFamily: 'sans-serif', letterSpacing: 0.5 }}>
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.05)',
                border: '0.5px solid rgba(255,255,255,0.15)',
                borderRadius: 6,
                padding: '10px 12px',
                fontSize: 14,
                color: '#fff',
                outline: 'none',
                fontFamily: 'sans-serif',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {error && (
            <p style={{ fontSize: 13, color: '#ff6b6b', fontFamily: 'sans-serif' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: '#c0392b',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '10px',
              fontSize: 14,
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              fontFamily: 'sans-serif',
              marginTop: 4,
            }}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </main>
  )
}
