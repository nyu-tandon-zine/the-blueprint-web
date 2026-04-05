import Link from 'next/link'

export default function Navbar() {
  return (
    <header className="w-full border-b border-gray-200 bg-white">
      <div className="max-w-6xl mx-auto px-8 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight text-gray-900 hover:text-black transition-colors"
        >
          The Blueprint
        </Link>
        <nav className="flex items-center gap-8">
          <Link
            href="/archive"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Archive
          </Link>
          <Link
            href="/about"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            About
          </Link>
          <Link
            href="/admin"
            className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  )
}
