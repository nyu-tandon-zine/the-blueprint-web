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
      <div className="max-w-6xl mx-auto px-8 pt-8">
        <Link
          href="/"
          className="inline-block text-bp-blue-3/70 hover:text-bp-off-white transition-colors text-sm"
          aria-label="Back to homepage"
          style={blueprintStyles.body}
        >
          ← Back
        </Link>
      </div>

      {/* Two-column layout — matches design guidelines p.12 */}
      <div className="max-w-6xl mx-auto px-8 py-16 flex flex-col md:flex-row gap-10 md:gap-0">

        {/* Left column — Genre section title + sticky info */}
        <div className="md:w-5/12 flex-shrink-0 md:border-r border-bp-blue-3/20 md:pr-12">
          <div className="md:sticky md:top-16">
            <h2
              className="text-4xl md:text-5xl text-bp-blue-3/80 leading-tight break-words"
              style={blueprintStyles.sectionTitle}
            >
              {work.genre}
            </h2>

            {/* Title/author/date that fades in when header scrolls away */}
            <div
              className="mt-8 transition-all duration-500 ease-in-out"
              style={{
                opacity: headerHidden ? 1 : 0,
                transform: headerHidden ? 'translateY(0)' : 'translateY(12px)',
                pointerEvents: headerHidden ? 'auto' : 'none',
              }}
            >
              {/* Corner brackets — top */}
              <div className="flex justify-between mb-4 text-bp-blue-3/30">
                <span className="text-xl leading-none">&#x250C;</span>
                <span className="text-xl leading-none">&#x2510;</span>
              </div>

              <div className="px-4">
                <h3
                  className="text-3xl md:text-4xl text-bp-off-white leading-tight mb-3 text-left"
                  style={blueprintStyles.pageTitle}
                >
                  {work.title}
                </h3>
                {work.author?.name && (
                  <p
                    className="text-lg md:text-xl text-bp-blue-3 mb-2 text-left"
                    style={blueprintStyles.subtitle}
                  >
                    By {work.author.name}
                  </p>
                )}
                {date && (
                  <p
                    className="text-sm text-bp-blue-3/50 mb-4 text-left"
                    style={blueprintStyles.body}
                  >
                    {date}
                  </p>
                )}
              </div>

              {/* Corner brackets — bottom */}
              <div className="flex justify-between text-bp-blue-3/30">
                <span className="text-xl leading-none">&#x2514;</span>
                <span className="text-xl leading-none">&#x2518;</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column — Article content */}
        <div className="md:w-7/12 md:pl-12 min-w-0">
          {/* Corner brackets — top */}
          <div className="flex justify-between mb-6 text-bp-blue-3/30">
            <span className="text-xl leading-none">&#x250C;</span>
            <span className="text-xl leading-none">&#x2510;</span>
          </div>

          {/* Header block — observed for scroll detection */}
          <div ref={headerRef}>
            {/* Title — H2 (New Science) */}
            <h1
              className="text-3xl md:text-4xl text-bp-off-white leading-tight mb-3"
              style={blueprintStyles.pageTitle}
            >
              {work.title}
            </h1>

            {/* Author — H3 (New Science italic) */}
            {work.author?.name && (
              <p
                className="text-lg md:text-xl text-bp-blue-3 mb-2"
                style={blueprintStyles.subtitle}
              >
                By {work.author.name}
              </p>
            )}

            {/* Date */}
            {date && (
              <p
                className="text-sm text-bp-blue-3/50 mb-8"
                style={blueprintStyles.body}
              >
                {date}
              </p>
            )}
          </div>

          {/* Subheading divider */}
          <div className="border-t border-bp-blue-3/15 mb-8" />

          {/* Body text */}
          {work.content ? (
            <div
              className="text-bp-off-white/85 leading-relaxed space-y-5 text-base break-words"
              style={blueprintStyles.body}
            >
              {work.content.split('\n\n').map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          ) : (
            <p className="text-bp-blue-3/40 italic">No content available.</p>
          )}

          {/* Works Cited */}
          {work.works_cited && (
            <div className="mt-14">
              <div className="border-t border-bp-blue-3/15 mb-6" />
              <h2
                className="text-sm text-bp-off-white/80 mb-4"
                style={blueprintStyles.subheading}
              >
                Works Cited
              </h2>
              <div
                className="text-sm text-bp-blue-3/60 leading-relaxed space-y-2"
                style={blueprintStyles.body}
              >
                {work.works_cited.split('\n').map((entry, i) => (
                  <p key={i}>{entry}</p>
                ))}
              </div>
            </div>
          )}

          {/* Corner brackets — bottom */}
          <div className="flex justify-between mt-10 text-bp-blue-3/30">
            <span className="text-xl leading-none">&#x2514;</span>
            <span className="text-xl leading-none">&#x2518;</span>
          </div>
        </div>
      </div>
    </main>
  )
}
