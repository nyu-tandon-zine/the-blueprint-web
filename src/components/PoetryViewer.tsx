import type { Work } from '@/types'
import Link from 'next/link'

export default function PoetryViewer({ work }: { work: Work }) {
  return (
    <main className="max-w-3xl mx-auto px-8 py-10 w-full">
      {/* Back link */}
      <Link
        href="/"
        className="inline-block text-gray-400 hover:text-gray-700 mb-8 transition-colors"
        aria-label="Back to homepage"
      >
        ←
      </Link>

      {/* Genre label */}
      <p className="text-sm text-gray-400 mb-3 capitalize">{work.genre}</p>

      {/* Title + author */}
      <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-2">
        {work.title}
      </h1>
      <p className="text-lg text-gray-600 mb-10">By {work.author?.name}</p>

      {/* Poem body — whitespace-pre-wrap preserves line breaks and indentation */}
      {work.content ? (
        <div
          className="text-gray-800 text-base leading-8 font-mono whitespace-pre-wrap"
        >
          {work.content}
        </div>
      ) : (
        <p className="text-gray-400 italic">No content available.</p>
      )}
    </main>
  )
}
