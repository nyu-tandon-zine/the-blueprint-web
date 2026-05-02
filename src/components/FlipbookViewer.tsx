'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Page, Issue, Work } from '@/types'

interface Props {
  pages: Page[]
  issue: Issue
  works: Work[]
}

export default function FlipbookViewer({ pages, issue, works }: Props) {
  const searchParams = useSearchParams()
  const totalSpreads = Math.ceil(pages.length / 2)

  // Initialise spread from ?work= param if present
  const initialSpread = (() => {
    const workId = searchParams.get('work')
    if (workId) {
      const match = works.find((w) => w.id === workId)
      if (match?.start_page != null) {
        return Math.floor((match.start_page - 1) / 2)
      }
    }
    return 0
  })()

  const [spread, setSpread] = useState(initialSpread)

  const leftPage = pages[spread * 2]
  const rightPage = pages[spread * 2 + 1]

  if (pages.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] bg-black">
        <p className="text-[#B6CCFF] text-sm uppercase tracking-widest">No pages uploaded yet.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] bg-black gap-8 px-8 py-12">

      {/* Issue title + back link */}
      <div className="flex flex-col items-center" style={{ gap: 12 }}>
        <p style={{
          fontSize: 'clamp(20px, 3vw, 28px)',
          fontWeight: 700,
          letterSpacing: 5,
          color: '#3a8ec0',
          fontFamily: "'New Science', 'Courier New', monospace",
          textAlign: 'center',
        }}>
          {issue.semester.toUpperCase()}
        </p>
        <Link href="/" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          fontSize: 13,
          fontWeight: 500,
          color: 'rgba(255,255,255,0.75)',
          fontFamily: 'sans-serif',
          letterSpacing: '0.05em',
          textDecoration: 'none',
          border: '0.5px solid rgba(255,255,255,0.25)',
          borderRadius: 999,
          padding: '8px 20px',
        }}>
          <span style={{ fontSize: 15 }}>☰</span> Web Mode
        </Link>
      </div>

      {/* Jump-to dropdown — only shown if any works have start_page set */}
      {works.length > 0 && (
        <select
          value=""
          onChange={(e) => {
            const work = works.find((w) => w.id === e.target.value)
            if (work?.start_page != null) {
              setSpread(Math.floor((work.start_page - 1) / 2))
            }
          }}
          style={{
            background: 'rgba(255,255,255,0.06)',
            border: '0.5px solid rgba(255,255,255,0.15)',
            borderRadius: 6,
            color: 'rgba(255,255,255,0.7)',
            fontFamily: 'sans-serif',
            fontSize: 13,
            padding: '8px 14px',
            cursor: 'pointer',
            outline: 'none',
            minWidth: 220,
          }}
        >
          <option value="" disabled style={{ background: '#111' }}>Jump to…</option>
          {works.map((w) => (
            <option key={w.id} value={w.id} style={{ background: '#111' }}>
              {w.title}
            </option>
          ))}
        </select>
      )}

      {/* Arrows + two-page spread */}
      <div className="flex items-center gap-6 w-full max-w-5xl">

        {/* Left arrow */}
        <button
          onClick={() => setSpread((s) => s - 1)}
          disabled={spread === 0}
          className="text-2xl text-[#B6CCFF] hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          ←
        </button>

        {/* Pages */}
        <div className="flex flex-1 shadow-2xl">

          {/* Left page */}
          <div className="relative w-1/2 aspect-[85/110] bg-[#F8F1E2]">
            {leftPage && (
              <Image
                src={leftPage.image_url}
                alt={`Page ${leftPage.page_number}`}
                fill
                className="object-cover"
              />
            )}
          </div>

          {/* Right page */}
          <div className="relative w-1/2 aspect-[85/110] bg-[#F8F1E2]">
            {rightPage ? (
              <Image
                src={rightPage.image_url}
                alt={`Page ${rightPage.page_number}`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#F8F1E2]" />
            )}
          </div>

        </div>

        {/* Right arrow */}
        <button
          onClick={() => setSpread((s) => s + 1)}
          disabled={spread === totalSpreads - 1}
          className="text-2xl text-[#B6CCFF] hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          →
        </button>

      </div>

      {/* Page counter */}
      <span className="text-xs text-[#B6CCFF] uppercase tracking-widest">
        {spread + 1} / {totalSpreads}
      </span>

    </div>
  )
}
