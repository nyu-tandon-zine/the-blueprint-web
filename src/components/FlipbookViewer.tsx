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

// One shared `sizes` for every page image. Because the browser chooses which
// image candidate to download from `sizes` (not from the element's actual box),
// giving the visible pages AND the hidden preloaded pages the same `sizes` means
// they resolve to the *same* file — so a preloaded page is already in cache when
// the reader flips to it, and there's no flicker.
const PAGE_SIZES = '(max-width: 768px) 45vw, 480px'

export default function FlipbookViewer({ pages, issue, works }: Props) {
  const searchParams = useSearchParams()

  // Page 1 (the cover) is shown ALONE, then interior pages pair as real
  // spreads: (2,3), (4,5), … A lone trailing page (e.g. the back cover) is
  // also shown alone. Spread 0 = cover; spread s>=1 = pages[2s-1], pages[2s].
  const total = pages.length
  const totalSpreads = total === 0 ? 0 : 1 + Math.ceil((total - 1) / 2)

  // Which spread does a given page number live on?
  const spreadForPage = (pageNumber: number) =>
    pageNumber <= 1 ? 0 : Math.floor(pageNumber / 2)

  // The page(s) that make up a given spread.
  const pagesForSpread = (s: number): Page[] => {
    if (s < 0 || s >= totalSpreads) return []
    if (s === 0) return pages[0] ? [pages[0]] : []
    return [pages[s * 2 - 1], pages[s * 2]].filter(Boolean) as Page[]
  }

  // Initialise spread from ?work= param if present
  const initialSpread = (() => {
    const workId = searchParams.get('work')
    if (workId) {
      const match = works.find((w) => w.id === workId)
      if (match?.start_page != null) return spreadForPage(match.start_page)
    }
    return 0
  })()

  const [spread, setSpread] = useState(initialSpread)

  const isCover = spread === 0
  const leftPage = isCover ? undefined : pages[spread * 2 - 1]
  const rightPage = isCover ? undefined : pages[spread * 2]

  // A spread shows a single centered page for the cover and for a lone
  // trailing page (a left page with no facing right page, e.g. the back cover).
  const singlePage = isCover ? pages[0] : leftPage && !rightPage ? leftPage : undefined

  // Preload window: warm the next two spreads and the previous one, so flipping
  // is instant. We skip the pages already on screen and de-dupe.
  const shownIds = new Set(
    (singlePage ? [singlePage] : ([leftPage, rightPage].filter(Boolean) as Page[])).map((p) => p.id),
  )
  const preloadPages: Page[] = []
  const seenIds = new Set<string>()
  for (const s of [spread + 1, spread - 1, spread + 2]) {
    for (const p of pagesForSpread(s)) {
      if (!shownIds.has(p.id) && !seenIds.has(p.id)) {
        seenIds.add(p.id)
        preloadPages.push(p)
      }
    }
  }

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

      {/* Jump-to dropdown */}
      {works.length > 0 && (
        <select
          value=""
          onChange={(e) => {
            const work = works.find((w) => w.id === e.target.value)
            if (work?.start_page != null) {
              setSpread(spreadForPage(work.start_page))
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

      {/* Arrows + page spread */}
      <div className="flex items-center gap-6 w-full max-w-5xl">

        {/* Left arrow */}
        <button
          onClick={() => setSpread((s) => s - 1)}
          disabled={spread === 0}
          className="text-2xl text-[#B6CCFF] hover:text-white disabled:opacity-20 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          ←
        </button>

        {/* A single page (cover / back cover) is centered; interior pages show as a spread */}
        {singlePage ? (
          <div className="flex flex-1 justify-center shadow-2xl">
            <div className="relative w-1/2 aspect-[85/110] bg-[#F8F1E2]">
              <Image
                src={singlePage.image_url}
                alt={`Page ${singlePage.page_number}`}
                fill
                sizes={PAGE_SIZES}
                priority={isCover}
                className="object-cover"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-1 shadow-2xl">
            {/* Left page */}
            <div className="relative w-1/2 aspect-[85/110] bg-[#F8F1E2]">
              {leftPage && (
                <Image
                  src={leftPage.image_url}
                  alt={`Page ${leftPage.page_number}`}
                  fill
                  sizes={PAGE_SIZES}
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
                  sizes={PAGE_SIZES}
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[#F8F1E2]" />
              )}
            </div>
          </div>
        )}

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

      {/* Off-screen preloader — fetches upcoming pages so flips don't flicker.
          Hidden from layout and screen readers; `loading="eager"` forces the
          fetch now, and the shared PAGE_SIZES makes it the same file the visible
          page will use. */}
      <div
        aria-hidden
        style={{ position: 'absolute', width: 1, height: 1, overflow: 'hidden', opacity: 0, pointerEvents: 'none' }}
      >
        {preloadPages.map((p) => (
          <div key={p.id} style={{ position: 'relative', width: 2, height: 2 }}>
            <Image src={p.image_url} alt="" fill sizes={PAGE_SIZES} loading="eager" />
          </div>
        ))}
      </div>

    </div>
  )
}
