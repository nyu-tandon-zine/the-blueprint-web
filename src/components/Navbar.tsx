import Link from 'next/link'

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

        {/* Logo box */}
        <Link href="/" style={{
          width: 40,
          height: 40,
          border: '1.5px solid #3a8ec0',
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          fontSize: 11,
          fontWeight: 700,
          color: '#3a8ec0',
          letterSpacing: '-0.5px',
          lineHeight: 1.1,
          textAlign: 'center',
          padding: 3,
          textDecoration: 'none',
          fontFamily: 'monospace',
        }}>
          <span>THE</span>
          <span>B</span>
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
                color: 'rgba(255,255,255,0.55)',
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
              color: 'rgba(255,255,255,0.35)',
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
