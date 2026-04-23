'use client'

import { useEffect, useRef, useState } from 'react'
import type { Work } from '@/types'
import Link from 'next/link'
import { blueprintStyles } from './TextFormatter'

export default function ProseViewer({ work }: { work: Work }) {
  const date = work.created_at
    ? new Date(work.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  const headerRef = useRef<HTMLDivElement>(null)
  const [headerHidden, setHeaderHidden] = useState(false)

  useEffect(() => {
    const el = headerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => setHeaderHidden(!entry.isIntersecting),
      { threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <main
      className="min-h-screen w-full"
      style={{ background: 'linear-gradient(160deg, var(--bp-dark-blue) 0%, var(--bp-blue) 100%)' }}
    >
      {/* Back link */}
      <Link
        href="/"
        className="inline-block text-gray-500 hover:text-white mb-8 transition-colors"
        aria-label="Back to homepage"
      >
        ←
      </Link>

      {/* Genre label */}
      <p className="text-sm text-gray-500 mb-3 capitalize">{work.genre}</p>

      {/* Title + author */}
      <h1 className="text-4xl font-bold text-white leading-tight mb-2">
        {work.title}
      </h1>
      <p className="text-lg text-gray-400 mb-10">By {work.author?.name}</p>

      {/* Body text */}
      {work.content ? (
        <div className="text-gray-200 leading-relaxed space-y-5">
          {work.content.split('\n\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 italic">No content available.</p>
      )}

      {/* Works Cited */}
      {work.works_cited && (
        <div className="mt-16">
          <hr className="border-gray-700 mb-6" />
          <h2 className="text-lg font-semibold text-white mb-3">Works Cited</h2>
          <div className="text-sm text-gray-400 leading-relaxed space-y-2">
            {work.works_cited.split('\n').map((entry, i) => (
              <p key={i}>{entry}</p>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
