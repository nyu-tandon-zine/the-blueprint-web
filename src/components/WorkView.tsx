'use client'

// ----------------------------------------------------------------
// WorkView
//
// Wraps a work's page and provides the custom/default toggle. The default
// view is rendered on the server and passed in as `defaultSlot`, so the
// existing per-media-type viewers are completely untouched. When a work
// has a registered custom page, a small toggle appears; in custom view we
// render the sandboxed CustomFrame plus a slim bar with the site chrome
// (back link + credit) so the isolated page can stay a pure canvas.
// ----------------------------------------------------------------

import { useState } from 'react'
import Link from 'next/link'
import CustomFrame from '@/components/CustomFrame'
import type { CustomFrameData } from '@/custom-pages/frame-data'

type View = 'default' | 'custom'

export default function WorkView({
  hasCustom,
  initialView,
  customSrc,
  frameData,
  defaultSlot,
}: {
  hasCustom: boolean
  initialView: View
  customSrc: string
  frameData: CustomFrameData
  defaultSlot: React.ReactNode
}) {
  const [view, setView] = useState<View>(hasCustom ? initialView : 'default')

  // No custom page → just the default view, no chrome added.
  if (!hasCustom) return <>{defaultSlot}</>

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#0a0a0a' }}>
      {view === 'custom' ? (
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {/* Slim site chrome — the isolated page has none of its own */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              padding: '14px 24px',
              borderBottom: '0.5px solid rgba(255,255,255,0.08)',
              background: '#0d0d0d',
            }}
          >
            <Link
              href="/"
              style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: 13, fontFamily: 'sans-serif', letterSpacing: 1 }}
            >
              ← Back
            </Link>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', fontFamily: 'sans-serif' }}>
              {frameData.title}
              {frameData.author.name ? ` · ${frameData.author.name}` : ''}
            </span>
          </div>
          <CustomFrame src={customSrc} data={frameData} />
        </div>
      ) : (
        defaultSlot
      )}

      {/* Floating view toggle */}
      <div
        style={{
          position: 'fixed',
          right: 16,
          bottom: 16,
          zIndex: 100,
          display: 'flex',
          gap: 2,
          padding: 3,
          borderRadius: 999,
          background: 'rgba(13,13,13,0.9)',
          border: '0.5px solid rgba(255,255,255,0.15)',
          backdropFilter: 'blur(6px)',
        }}
      >
        {(['custom', 'default'] as View[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            aria-pressed={view === v}
            style={{
              padding: '6px 16px',
              borderRadius: 999,
              border: 'none',
              cursor: 'pointer',
              fontSize: 12,
              fontFamily: 'sans-serif',
              letterSpacing: 0.4,
              textTransform: 'capitalize',
              background: view === v ? '#c0392b' : 'transparent',
              color: view === v ? '#fff' : 'rgba(255,255,255,0.6)',
              transition: 'background 0.15s, color 0.15s',
            }}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  )
}
