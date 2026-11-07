// ----------------------------------------------------------------
// The "content contract" between the site and a custom page.
//
// This is the exact shape of the object your custom page receives via
// postMessage (see the starter template). It is a deliberately trimmed,
// safe subset of the work — enough to render real content, nothing that
// exposes internals. Keep this in sync with docs/custom-pages.md.
// ----------------------------------------------------------------

import type { Work } from '@/types'
import { sortedCredits, creditNames } from '@/lib/credits'

export interface CustomFrameData {
  id: string
  title: string
  genre: string | null
  mediaType: string
  description: string | null
  content: string | null
  author: { name: string | null }   // all names joined: "Ana & Ben" (kept for older custom pages)
  authors: { name: string; slug: string; role: string | null }[]   // byline order
  images: string[]
  audio: { title: string; url: string }[]
}

/** Trim a full Work down to the documented shape sent into the frame. */
export function toFrameData(work: Work): CustomFrameData {
  const credits = sortedCredits(work)
  return {
    id: work.id,
    title: work.title,
    genre: work.genre ?? null,
    mediaType: work.media_type,
    description: work.description ?? null,
    content: work.content ?? null,
    author: { name: creditNames(credits) || null },
    authors: credits.map((c) => ({ name: c.author.name, slug: c.author.slug, role: c.role })),
    images: (work.work_images ?? [])
      .slice()
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map((i) => i.image_url),
    audio: (work.work_audio_files ?? [])
      .slice()
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
      .map((a) => ({ title: a.track_title, url: a.audio_url })),
  }
}
