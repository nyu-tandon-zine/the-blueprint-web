'use client'

import { useRef } from 'react'
import type { Work } from '@/types'
import Link from 'next/link'

export default function ProseViewer({ work }: { work: Work }) {
  const date = work.created_at
    ? new Date(work.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(160deg, #07061f 0%, #0b0950 60%, #0d0b5e 100%)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* ── Top bar ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px' }}>
        <Link
          href="/"
          style={{
            color: 'rgba(255,255,255,0.6)',
            textDecoration: 'none',
            fontSize: 13,
            fontFamily: 'sans-serif',
            letterSpacing: 1,
          }}
        >
          ← Back
        </Link>
      </div>

      {/* ── Two-column body ── */}
      <div style={{ display: 'flex', flex: 1, padding: '24px 40px 60px' }}>

        {/* Left: genre label */}
        <div style={{ width: 220, flexShrink: 0, paddingTop: 4 }}>
          <p style={{
            fontFamily: "'Blue Screen', 'Courier New', monospace",
            fontSize: 22,
            letterSpacing: '0.25em',
            color: 'rgba(255,255,255,0.85)',
            textTransform: 'uppercase',
            wordBreak: 'break-all',
          }}>
            {work.genre}
          </p>
        </div>

        {/* Vertical divider */}
        <div style={{ width: 1, background: 'rgba(255,255,255,0.2)', flexShrink: 0, marginRight: 48 }} />

        {/* Right: article content */}
        <div style={{ flex: 1, maxWidth: 680 }}>

          {/* Corner brackets */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, color: 'rgba(255,255,255,0.4)', fontSize: 18, lineHeight: 1 }}>
            <span>┌</span>
            <span>┐</span>
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: 'clamp(28px, 4vw, 42px)',
            fontWeight: 400,
            color: '#fff',
            fontFamily: "'New Science', 'Courier New', monospace",
            lineHeight: 1.2,
            marginBottom: 10,
          }}>
            {work.title}
          </h1>

          {/* Author */}
          <p style={{
            fontSize: 16,
            color: 'rgba(255,255,255,0.75)',
            fontStyle: 'italic',
            fontFamily: 'sans-serif',
            marginBottom: 4,
          }}>
            By {work.author?.name}
          </p>

          {/* Date */}
          {date && (
            <p style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.45)',
              fontFamily: 'sans-serif',
              marginBottom: 40,
              letterSpacing: 0.5,
            }}>
              {date}
            </p>
          )}

          {/* Body */}
          {work.content ? (
            <div style={{
              fontSize: 15,
              lineHeight: 1.8,
              color: 'rgba(255,255,255,0.85)',
              fontFamily: "'Motiva Sans', sans-serif",
              fontWeight: 400,
            }}>
              {work.content.split('\n\n').map((paragraph, i) => (
                <p key={i} style={{ marginBottom: '1.25em' }}>{paragraph}</p>
              ))}
            </div>
          ) : (
            <p style={{ color: 'rgba(255,255,255,0.35)', fontStyle: 'italic', fontFamily: 'sans-serif' }}>
              No content available.
            </p>
          )}

          {/* Works Cited */}
          {work.works_cited && (
            <div style={{ marginTop: 64 }}>
              <hr style={{ borderColor: 'rgba(255,255,255,0.15)', marginBottom: 24 }} />
              <h2 style={{
                fontSize: 13,
                fontFamily: "'New Science', 'Courier New', monospace",
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.5)',
                marginBottom: 16,
              }}>
                Works Cited
              </h2>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7, fontFamily: 'sans-serif' }}>
                {work.works_cited.split('\n').map((entry, i) => (
                  <p key={i} style={{ marginBottom: '0.5em' }}>{entry}</p>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
