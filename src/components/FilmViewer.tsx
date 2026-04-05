import type { Work } from '@/types'
import Link from 'next/link'

export default function FilmViewer({ work }: { work: Work }) {
  return (
    <main className="max-w-3xl mx-auto px-8 py-10 w-full">
      <Link
        href="/"
        className="inline-block text-gray-400 hover:text-gray-700 mb-8 transition-colors"
        aria-label="Back to homepage"
      >
        ←
      </Link>

      <p className="text-sm text-gray-400 mb-3 capitalize">{work.genre}</p>

      <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-2">
        {work.title}
      </h1>
      <p className="text-lg text-gray-600 mb-8">By {work.author?.name}</p>

      {work.external_link ? (
        <div className="mb-8">
          <a
            href={work.external_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded hover:bg-black transition-colors text-sm font-medium"
          >
            Watch on YouTube →
          </a>
        </div>
      ) : (
        <div className="w-full bg-gray-100 rounded p-6 flex items-center justify-center mb-8">
          <p className="text-gray-400 text-sm">Video link not yet available</p>
        </div>
      )}

      {work.description && (
        <p className="text-gray-700 leading-relaxed">{work.description}</p>
      )}
    </main>
  )
}
