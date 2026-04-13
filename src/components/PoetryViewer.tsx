import type { Work } from '@/types'
import Link from 'next/link'
import { ArticleHeader, PoetryBody } from './TextFormatter'

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

      <ArticleHeader work={work} />

      {/* Poem body — whitespace-pre-wrap preserves line breaks and indentation */}
      {work.content ? (
        <PoetryBody content={work.content} />
      ) : (
        <p className="text-gray-400 italic">No content available.</p>
      )}
    </main>
  )
}
