import type { Work } from '@/types'
import Link from 'next/link'

export default function ProseViewer({ work }: { work: Work }) {
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

      {/* Body text */}
      {work.content ? (
        <div className="prose prose-gray max-w-none text-gray-800 leading-relaxed space-y-5">
          {work.content.split('\n\n').map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 italic">No content available.</p>
      )}

      {/* Works Cited */}
      {work.works_cited && (
        <div className="mt-16">
          <hr className="border-gray-200 mb-6" />
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Works Cited</h2>
          <div className="text-sm text-gray-600 leading-relaxed space-y-2">
            {work.works_cited.split('\n').map((entry, i) => (
              <p key={i}>{entry}</p>
            ))}
          </div>
        </div>
      )}
    </main>
  )
}
