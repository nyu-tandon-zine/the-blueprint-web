'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

// Below this width (portrait phones) OR below this height (landscape
// phones — a rotated iPhone is ~812px wide, past any reasonable width
// breakpoint, but only ~375-430px tall) the navbar hides on scroll-down and
// reappears on scroll-up, to give back the vertical space it eats on small
// screens — most noticeably the flipbook in landscape, where the bar alone
// can claim a big share of the available height. Desktop keeps the bar
// always visible.
const HIDE_ON_SCROLL_QUERY = '(max-width: 767px), (max-height: 500px)'

export default function Navbar() {
  const [hidden, setHidden] = useState(false)
  const lastY = useRef(0)

  useEffect(() => {
    const mq = window.matchMedia(HIDE_ON_SCROLL_QUERY)
    lastY.current = window.scrollY

    function onScroll() {
      const y = window.scrollY

      // Desktop, or barely scrolled: bar always shown.
      if (!mq.matches || y < 64) {
        setHidden(false)
        lastY.current = y
        return
      }

      const delta = y - lastY.current
      // Ignore sub-pixel/momentum jitter; only react to a deliberate scroll.
      if (Math.abs(delta) > 8) {
        setHidden(delta > 0)
        lastY.current = y
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className="w-full sticky top-0 z-50"
      style={{
        background: '#0d0d0d',
        borderBottom: '0.5px solid rgba(255,255,255,0.08)',
        transform: hidden ? 'translateY(-100%)' : 'translateY(0)',
        transition: 'transform 0.25s ease',
      }}
    >
      <div className="flex items-center justify-between px-4 sm:px-8 h-16">

        {/* Logo + wordmark */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <Image
            src="/logo.png"
            alt="The Blueprint"
            width={28}
            height={40}
            style={{ objectFit: 'contain' }}
          />
          <span className="hidden sm:inline" style={{
            fontFamily: "'Blue Screen', 'Courier New', monospace",
            fontSize: 13,
            letterSpacing: 3,
            color: '#B6CCFF',
            textTransform: 'uppercase',
          }}>
            The Blueprint
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-4 sm:gap-6">
          {[
            { label: 'Home', href: '/' },
            { label: 'Archive', href: '/archive' },
            { label: 'About', href: '/about' },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              style={{
                fontSize: 14,
                textDecoration: 'none',
                color: 'rgba(255,255,255,0.85)',
                fontFamily: 'sans-serif',
              }}
            >
              {label}
            </Link>
          ))}

          {/* Admin button */}
          <Link
            href="/admin"
            style={{
              background: 'none',
              border: '0.5px solid rgba(255,255,255,0.15)',
              borderRadius: 4,
              padding: '4px 12px',
              fontSize: 12,
              color: 'rgba(255,255,255,0.6)',
              fontFamily: 'sans-serif',
              letterSpacing: 1,
              textDecoration: 'none',
            }}
          >
            Admin
          </Link>
        </nav>

      </div>
    </header>
  )
}
