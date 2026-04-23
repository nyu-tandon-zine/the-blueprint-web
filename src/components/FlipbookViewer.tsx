'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Page, Issue } from '@/types'

interface Props {
  pages: Page[]
  issue: Issue
}

export default function FlipbookViewer({ pages, issue }: Props) {
  const [spread, setSpread] = useState(0)

  const totalSpreads = Math.ceil(pages.length / 2)
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
      <div className="flex flex-col items-center gap-3">
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
          fontSize: 12,
          color: 'rgba(255,255,255,0.35)',
          fontFamily: 'sans-serif',
          letterSpacing: 2,
          textDecoration: 'none',
        }}>
          ↳ Web Mode
        </Link>
      </div>

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
