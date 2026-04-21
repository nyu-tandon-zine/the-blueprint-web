import type { Work } from '@/types'
import Link from 'next/link'
import Image from 'next/image'

export default function VisualArtViewer({ work }: { work: Work }) {
  const images = work.work_images ?? []

  return (
    <main className="max-w-4xl mx-auto px-8 py-10 w-full">
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
      <p className="text-lg text-gray-400 mb-8">By {work.author?.name}</p>

      {/* Images */}
      {images.length > 0 ? (
        <div className="space-y-6 mb-8">
          {images
            .sort((a, b) => a.position - b.position)
            .map((img) => (
              <div key={img.id} className="relative w-full aspect-[4/3] bg-white/5 rounded overflow-hidden">
                <Image
                  src={img.image_url}
                  alt={`${work.title} — image ${img.position}`}
                  fill
                  className="object-contain"
                />
              </div>
            ))}
        </div>
      ) : work.media_url ? (
        // Fallback to legacy single media_url
        <div className="relative w-full aspect-[4/3] bg-white/5 rounded overflow-hidden mb-8">
          <Image
            src={work.media_url}
            alt={work.title}
            fill
            className="object-contain"
          />
        </div>
      ) : (
        <div className="w-full aspect-[4/3] bg-white/5 rounded flex items-center justify-center mb-8">
          <p className="text-gray-500 text-sm">Image not yet available</p>
        </div>
      )}

      {/* Description */}
      {work.description && (
        <p className="text-gray-300 leading-relaxed max-w-2xl">{work.description}</p>
      )}
    </main>
  )
}
