import Link from 'next/link'
import Image from 'next/image'

export default function Navbar() {
  return (
    <header
      className="w-full sticky top-0 z-50"
      style={{
        background: '#0d0d0d',
        borderBottom: '0.5px solid rgba(255,255,255,0.08)',
      }}
    >
      <div className="flex items-center justify-between px-8 h-16">

        {/* Logo + wordmark */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
          <Image
            src="/logo.png"
            alt="The Blueprint"
            width={28}
            height={40}
            style={{ objectFit: 'contain' }}
          />
          <span style={{
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
        <nav className="flex items-center gap-6">
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
