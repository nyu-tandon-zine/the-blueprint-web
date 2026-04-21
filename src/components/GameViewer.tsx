import type { Work } from '@/types'
import Link from 'next/link'

export default function GameViewer({ work }: { work: Work }) {
  return (
    <main className="max-w-3xl mx-auto px-8 py-10 w-full">
      <Link
        href="/"
        className="inline-block text-gray-500 hover:text-white mb-8 transition-colors"
        aria-label="Back to homepage"
      >
        ←
      </Link>

      <p className="text-sm text-gray-500 mb-3 capitalize">{work.genre}</p>

      <h1 className="text-4xl font-bold text-white leading-tight mb-2">
        {work.title}
      </h1>
      <p className="text-lg text-gray-400 mb-8">By {work.author?.name}</p>

      {work.external_link ? (
        <div className="mb-8">
          <a
            href={work.external_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white/10 text-white px-6 py-3 rounded hover:bg-white/20 transition-colors text-sm font-medium"
          >
            Play on itch.io →
          </a>
        </div>
      ) : (
        <div className="w-full bg-white/5 rounded p-6 flex items-center justify-center mb-8">
          <p className="text-gray-500 text-sm">Game link not yet available</p>
        </div>
      )}

      {work.description && (
        <p className="text-gray-300 leading-relaxed">{work.description}</p>
      )}
    </main>
  )
}
