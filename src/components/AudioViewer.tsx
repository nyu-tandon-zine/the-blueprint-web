'use client'

import type { Work } from '@/types'
import Link from 'next/link'

export default function AudioViewer({ work }: { work: Work }) {
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
      <p className="text-lg text-gray-600 mb-8">By {work.author?.name}</p>

      {/* Audio player */}
      {work.media_url ? (
        <audio
          controls
          className="w-full mb-8"
          src={work.media_url}
        >
          Your browser does not support the audio element.
        </audio>
      ) : (
        <div className="w-full bg-gray-100 rounded p-6 flex items-center justify-center mb-8">
          <p className="text-gray-400 text-sm">Audio not yet available</p>
        </div>
      )}

      {/* Description */}
      {work.description && (
        <p className="text-gray-700 leading-relaxed mb-8">{work.description}</p>
      )}

      {/* External link (Spotify, SoundCloud, etc.) */}
      {work.external_link && (
        <a
          href={work.external_link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-500 hover:text-gray-900 underline underline-offset-4 transition-colors"
        >
          Listen in New Tab →
        </a>
      )}
    </main>
  )
}
