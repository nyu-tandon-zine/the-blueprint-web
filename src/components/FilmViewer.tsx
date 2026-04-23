import type { Work } from '@/types'
import Link from 'next/link'

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url)

    // https://youtu.be/VIDEO_ID
    if (parsed.hostname === 'youtu.be') {
      const id = parsed.pathname.slice(1)
      return id ? `https://www.youtube.com/embed/${id}` : null
    }

    // https://www.youtube.com/watch?v=VIDEO_ID
    if (parsed.hostname.includes('youtube.com')) {
      // Already an embed URL
      if (parsed.pathname.startsWith('/embed/')) return url

      const id = parsed.searchParams.get('v')
      return id ? `https://www.youtube.com/embed/${id}` : null
    }

    return null
  } catch {
    return null
  }
}

export default function FilmViewer({ work }: { work: Work }) {
  const embedUrl = work.external_link ? getYouTubeEmbedUrl(work.external_link) : null

  return (
    <main className="max-w-4xl mx-auto px-8 py-10 w-full">
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

      {embedUrl ? (
        <div className="w-full aspect-video rounded overflow-hidden bg-white/5 mb-8">
          <iframe
            src={embedUrl}
            title={work.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      ) : work.external_link ? (
        // Fallback for non-YouTube links (e.g. Vimeo) — just show a button
        <div className="mb-8">
          <a
            href={work.external_link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white/10 text-white px-6 py-3 rounded hover:bg-white/20 transition-colors text-sm font-medium"
          >
            Watch Film →
          </a>
        </div>
      ) : (
        <div className="w-full aspect-video bg-white/5 rounded flex items-center justify-center mb-8">
          <p className="text-gray-500 text-sm">Video link not yet available</p>
        </div>
      )}

      {work.description && (
        <p className="text-gray-300 leading-relaxed max-w-2xl">{work.description}</p>
      )}
    </main>
  )
}
