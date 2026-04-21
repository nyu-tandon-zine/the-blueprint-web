import type { Work } from '@/types'
import Link from 'next/link'

// Renders a line of text, converting *italic* spans to <em> tags
function renderLine(line: string, lineIndex: number) {
  const parts = line.split(/(\*[^*]+\*)/)
  return (
    <span key={lineIndex}>
      {parts.map((part, i) =>
        part.startsWith('*') && part.endsWith('*')
          ? <em key={i}>{part.slice(1, -1)}</em>
          : part
      )}
      {'\n'}
    </span>
  )
}

export default function PoetryViewer({ work }: { work: Work }) {
  return (
    <main className="max-w-3xl mx-auto px-8 py-10 w-full">
      {/* Back link */}
      <Link
        href="/"
        className="inline-block text-gray-500 hover:text-white mb-8 transition-colors"
        aria-label="Back to homepage"
      >
        ←
      </Link>

      {/* Genre label */}
      <p className="text-sm text-gray-500 mb-3 capitalize">{work.genre}</p>

      {/* Title + author */}
      <h1 className="text-4xl font-bold text-white leading-tight mb-2">
        {work.title}
      </h1>
      <p className="text-lg text-gray-400 mb-10">By {work.author?.name}</p>

      {/* Poem body — preserves line breaks and indentation, renders *italic* spans */}
      {work.content ? (
        <div className="text-gray-200 text-base leading-8 font-mono whitespace-pre-wrap">
          {work.content.split('\n').map((line, i) => renderLine(line, i))}
        </div>
      ) : (
        <p className="text-gray-500 italic">No content available.</p>
      )}
    </main>
  )
}
