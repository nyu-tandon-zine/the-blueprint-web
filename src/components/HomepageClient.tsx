'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Work, Issue } from '@/types'

type Tab = 'Visual' | 'Written' | 'Other'

const TABS: Tab[] = ['Visual', 'Written', 'Other']

const TAB_MEDIA_TYPES: Record<Tab, string[]> = {
  Visual:  ['visual-art', 'film'],
  Written: ['prose', 'poetry'],
  Other:   ['audio', 'game'],
}

interface Props {
  issue: Issue
  works: Work[]
}

export default function HomepageClient({ issue, works }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('Written')

  const tabWorks = works.filter((w) =>
    TAB_MEDIA_TYPES[activeTab].includes(w.media_type)
  )

  const handleScrollDown = () => {
    document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div style={{ background: '#0a0a0a', minHeight: '100vh', color: '#fff', fontFamily: "'Motiva Sans', sans-serif" }}>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <div style={{
        position: 'relative',
        height: 'calc(100vh - 64px)',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: issue.cover_image_url
          ? `url(${issue.cover_image_url}) center top / cover no-repeat`
          : 'linear-gradient(135deg, #8b0000 0%, #5a0010 30%, #0d1a2e 65%, #081222 100%)',
      }}>
        {/* Dark overlay (always present over cover image; subtle over gradient) */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: issue.cover_image_url
            ? 'rgba(0,0,0,0.55)'
            : `
              radial-gradient(ellipse 60% 80% at 30% 60%, rgba(180,20,20,0.55) 0%, transparent 70%),
              radial-gradient(ellipse 50% 60% at 70% 30%, rgba(10,40,80,0.8) 0%, transparent 70%)
            `,
        }} />

        {/* Title */}
        <div style={{ position: 'relative', textAlign: 'center' }}>
          <div style={{
            fontSize: 'clamp(60px, 9vw, 100px)',
            fontWeight: 100,
            letterSpacing: 10,
            color: '#fff',
            fontFamily: "'Blue Screen', 'Courier New', monospace",
            textShadow: '0 0 40px rgba(255,255,255,1)',
          }}>
            THE BLUEPRINT
          </div>
          <div style={{
            fontSize: 16,
            color: 'rgba(255,255,255,0.75)',
            marginTop: 12,
            letterSpacing: 5,
            fontFamily: 'Helvetica, sans-serif',
            fontWeight: 100,
          }}>
            An NYU Tandon Zine
          </div>
        </div>

        {/* Animated scroll chevron */}
        <button className="chevron-btn" onClick={handleScrollDown} aria-label="Scroll to content">
          <svg width="60" height="30" viewBox="0 0 60 30" fill="none">
            <polyline points="4,4 30,26 56,4" stroke="rgba(255,255,255,0.9)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </button>
      </div>

      {/* ── Section label ────────────────────────────────────────────────── */}
      <div id="main-content" style={{
        textAlign: 'center',
        padding: '40px 32px 0',
        fontSize: 'clamp(20px, 3vw, 28px)',
        fontWeight: 700,
        letterSpacing: 5,
        color: '#3a8ec0',
        fontFamily: "'New Science', 'Courier New', monospace",
      }}>
        {issue.semester.toUpperCase()}
      </div>

      {/* Flipbook link */}
      <div style={{ textAlign: 'center', padding: '12px 32px 0' }}>
        <Link href="/read" style={{
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
          transition: 'border-color 0.15s, color 0.15s',
        }}>
          <span style={{ fontSize: 15 }}>⧉</span> Flipbook Mode
        </Link>
      </div>

      {/* ── Tab bar ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 4, padding: '28px 32px 0' }}>
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '9px 28px',
              borderRadius: 999,
              fontSize: 15,
              fontWeight: 500,
              cursor: 'pointer',
              border: 'none',
              background: activeTab === tab ? '#c0392b' : 'transparent',
              color: activeTab === tab ? '#fff' : 'rgba(255,255,255,0.5)',
              fontFamily: 'sans-serif',
              transition: 'all 0.2s',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Works list ───────────────────────────────────────────────────── */}
      <div style={{ padding: '16px 32px 64px' }}>
        {tabWorks.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontFamily: 'sans-serif', fontSize: 14, padding: '32px 0' }}>
            No {activeTab.toLowerCase()} works published yet.
          </p>
        ) : (
          <div style={{ maxWidth: 820, margin: '0 auto' }}>
            {tabWorks.map((work) => (
              <Link key={work.id} href={`/works/${work.id}`} className="work-row">
                {/* Red accent dot */}
                <div style={{
                  width: 10,
                  height: 10,
                  background: '#c0392b',
                  borderRadius: 2,
                  flexShrink: 0,
                  margin: '0 16px 0 8px',
                }} />

                {/* Title */}
                <div style={{
                  flex: 1,
                  fontSize: 14,
                  color: 'rgba(255,255,255,0.85)',
                  padding: '16px 0',
                  fontFamily: 'sans-serif',
                }}>
                  {work.title}
                </div>

                {/* Genre tag */}
                {work.genre && (
                  <span style={{
                    padding: '3px 12px',
                    border: '1px solid rgba(192,57,43,0.4)',
                    borderRadius: 999,
                    fontSize: 11,
                    color: 'rgba(231,76,60,0.8)',
                    fontFamily: 'sans-serif',
                    marginRight: 16,
                    flexShrink: 0,
                  }}>
                    {work.genre}
                  </span>
                )}

                {/* Author */}
                <div style={{
                  width: 140,
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.35)',
                  fontFamily: 'sans-serif',
                  flexShrink: 0,
                }}>
                  {work.author?.name}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
