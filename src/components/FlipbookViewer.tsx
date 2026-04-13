'use client'

import { useState } from 'react'
import Image from 'next/image'
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
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-400 text-sm">No pages uploaded yet.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-8 py-12">
      <p className="text-sm text-gray-400 uppercase tracking-widest">{issue.title}</p>

      {/* Two-page spread */}
      <div className="flex gap-2 w-full max-w-5xl">

        {/* Left page */}
        <div className="relative w-1/2 aspect-[3/4] bg-gray-100">
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
        <div className="relative w-1/2 aspect-[3/4] bg-gray-100">
          {rightPage && (
            <Image
              src={rightPage.image_url}
              alt={`Page ${rightPage.page_number}`}
              fill
              className="object-cover"
            />
          )}
        </div>

      </div>

      {/* Navigation */}
      <div className="flex items-center gap-6">
        <button
          onClick={() => setSpread((s) => s - 1)}
          disabled={spread === 0}
          className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ← Previous
        </button>

        <span className="text-sm text-gray-400">
          {spread + 1} / {totalSpreads}
        </span>

        <button
          onClick={() => setSpread((s) => s + 1)}
          disabled={spread === totalSpreads - 1}
          className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Next →
        </button>
      </div>
    </div>
  )
}