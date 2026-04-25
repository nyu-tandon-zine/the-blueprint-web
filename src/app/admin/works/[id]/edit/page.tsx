'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import type { MediaType } from '@/types'
import Link from 'next/link'

type Author = { id: string; name: string }
type Issue = { id: string; semester: string }

const MEDIA_TYPES: { value: MediaType; label: string }[] = [
  { value: 'prose', label: 'Prose' },
  { value: 'poetry', label: 'Poetry' },
  { value: 'visual-art', label: 'Visual Art' },
  { value: 'audio', label: 'Audio' },
  { value: 'film', label: 'Film' },
  { value: 'game', label: 'Game' },
]

export default function EditWorkPage() {
  const router = useRouter()
  const params = useParams()
  const workId = params.id as string
  const supabase = createClient()

  // Form state
  const [mediaType, setMediaType] = useState<MediaType>('prose')
  const [title, setTitle] = useState('')
  const [genre, setGenre] = useState('fiction')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [worksCited, setWorksCited] = useState('')
  const [externalLink, setExternalLink] = useState('')
  const [issueId, setIssueId] = useState('')
  const [authorId, setAuthorId] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [currentMediaUrl, setCurrentMediaUrl] = useState<string | null>(null)
  const [newImages, setNewImages] = useState<File[]>([])
  const [existingImages, setExistingImages] = useState<{ id: string; image_url: string; position: number }[]>([])
  const [startPage, setStartPage] = useState<string>('')

  // Dropdown data
  const [authors, setAuthors] = useState<Author[]>([])
  const [issues, setIssues] = useState<Issue[]>([])

  // UI state
  const [loading, setLoading] = useState(false)
  const [fetchingWork, setFetchingWork] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState('')

  useEffect(() => {
    async function loadAll() {
      const [{ data: work }, { data: authorsData }, { data: issuesData }, { data: imagesData }] =
        await Promise.all([
          supabase.from('works').select('*').eq('id', workId).single(),
          supabase.from('authors').select('id, name').order('name'),
          supabase.from('issues').select('id, semester').order('published_at', { ascending: false }),
          supabase.from('work_images').select('*').eq('work_id', workId).order('position'),
        ])

      if (authorsData) setAuthors(authorsData)
      if (issuesData) setIssues(issuesData)
      if (imagesData) setExistingImages(imagesData)

      if (work) {
        setMediaType(work.media_type as MediaType)
        setTitle(work.title)
        setGenre(work.genre)
        setDescription(work.description ?? '')
        setContent(work.content ?? '')
        setWorksCited(work.works_cited ?? '')
        setExternalLink(work.external_link ?? '')
        setIssueId(work.issue_id)
        setAuthorId(work.author_id)
        setCurrentMediaUrl(work.media_url)
        setStartPage(work.start_page != null ? String(work.start_page) : '')
      }

      setFetchingWork(false)
    }
    loadAll()
  }, [workId])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      let mediaUrl = currentMediaUrl

      // Upload new file if one was selected
      if (file) {
        setUploadProgress('Uploading file…')
        const ext = file.name.split('.').pop()
        const path = `${mediaType}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(path, file)
        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage.from('media').getPublicUrl(path)
        mediaUrl = urlData.publicUrl
        setUploadProgress('')
      }

      const { error: updateError } = await supabase
        .from('works')
        .update({
          title: title.trim(),
          media_type: mediaType,
          genre,
          description: description.trim() || null,
          content: content.trim() || null,
          works_cited: worksCited.trim() || null,
          media_url: mediaUrl,
          external_link: externalLink.trim() || null,
          issue_id: issueId,
          author_id: authorId,
          start_page: startPage !== '' ? parseInt(startPage, 10) : null,
        })
        .eq('id', workId)

      if (updateError) throw updateError

      // Upload any new images for visual-art
      if (mediaType === 'visual-art' && newImages.length > 0) {
        const nextPosition = existingImages.length + 1
        for (let i = 0; i < newImages.length; i++) {
          setUploadProgress(`Uploading image ${i + 1} of ${newImages.length}…`)
          const f = newImages[i]
          const ext = f.name.split('.').pop()
          const path = `visual-art/${Date.now()}-${i}.${ext}`
          const { error: uploadError } = await supabase.storage.from('media').upload(path, f)
          if (uploadError) throw uploadError
          const { data: urlData } = supabase.storage.from('media').getPublicUrl(path)
          const { error: imgError } = await supabase.from('work_images').insert({
            work_id: workId,
            image_url: urlData.publicUrl,
            position: nextPosition + i,
          })
          if (imgError) throw imgError
        }
        setUploadProgress('')
      }

      router.push('/admin')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
      setUploadProgress('')
    }
  }

  const needsContent = mediaType === 'prose' || mediaType === 'poetry'
  const needsExternalLink = mediaType === 'film' || mediaType === 'game' || mediaType === 'audio'

  if (fetchingWork) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading…</p>
      </main>
    )
  }

  return (
    <main className="flex-1 bg-white">
      <div className="max-w-2xl mx-auto px-8 py-10">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="text-gray-400 hover:text-gray-700 transition-colors">←</Link>
          <h1 className="text-2xl font-bold text-gray-900">Edit Work</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Media type */}
          <Field label="Media Type">
            <select
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value as MediaType)}
              className={inputClass}
            >
              {MEDIA_TYPES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </Field>

          {/* Title */}
          <Field label="Title">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={inputClass}
            />
          </Field>

          {/* Genre */}
          <Field label="Genre">
            <input
              type="text"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className={inputClass}
              placeholder="e.g. fiction, nonfiction, fashion, photography"
            />
          </Field>

          {/* Issue */}
          <Field label="Issue">
            <select value={issueId} onChange={(e) => setIssueId(e.target.value)} required className={inputClass}>
              {issues.map((issue) => (
                <option key={issue.id} value={issue.id}>{issue.semester}</option>
              ))}
            </select>
          </Field>

          {/* Author */}
          <Field label="Author">
            <select value={authorId} onChange={(e) => setAuthorId(e.target.value)} required className={inputClass}>
              <option value="">Select an author…</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </Field>

          {/* Description */}
          <Field label="Description (optional)">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={inputClass}
            />
          </Field>

          {/* Content */}
          {needsContent && (
            <Field label={mediaType === 'poetry' ? 'Poem text' : 'Body text'}>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={16}
                className={`${inputClass} ${mediaType === 'poetry' ? 'font-mono' : ''}`}
              />
            </Field>
          )}

          {/* Works cited */}
          {mediaType === 'prose' && (
            <Field label="Works Cited (optional)">
              <textarea
                value={worksCited}
                onChange={(e) => setWorksCited(e.target.value)}
                rows={4}
                className={inputClass}
              />
            </Field>
          )}

          {/* File upload — visual art (multiple) */}
          {mediaType === 'visual-art' && (
            <Field label="Images">
              {existingImages.length > 0 && (
                <p className="text-xs text-gray-400 mb-2">
                  {existingImages.length} image{existingImages.length > 1 ? 's' : ''} currently uploaded.
                </p>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setNewImages(Array.from(e.target.files ?? []))}
                className="text-sm text-gray-600"
              />
              {newImages.length > 0 && (
                <p className="text-xs text-gray-400 mt-1">{newImages.length} new image{newImages.length > 1 ? 's' : ''} selected — will be appended</p>
              )}
              {uploadProgress && <p className="text-xs text-gray-400 mt-1">{uploadProgress}</p>}
            </Field>
          )}

          {/* File upload — audio (single) */}
          {mediaType === 'audio' && (
            <Field label="Replace audio (optional)">
              {currentMediaUrl && (
                <p className="text-xs text-gray-400 mb-2">
                  Current file: <a href={currentMediaUrl} target="_blank" rel="noopener noreferrer" className="underline">view</a>
                </p>
              )}
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="text-sm text-gray-600"
              />
              {uploadProgress && <p className="text-xs text-gray-400 mt-1">{uploadProgress}</p>}
            </Field>
          )}

          {/* External link */}
          {needsExternalLink && (
            <Field label={
              mediaType === 'film' ? 'YouTube / Vimeo URL' :
              mediaType === 'game' ? 'itch.io URL' :
              'External link (optional)'
            }>
              <input
                type="url"
                value={externalLink}
                onChange={(e) => setExternalLink(e.target.value)}
                required={mediaType === 'film' || mediaType === 'game'}
                className={inputClass}
                placeholder="https://"
              />
            </Field>
          )}

          {/* Flipbook start page + QR code */}
          <Field label="Flipbook start page (optional)">
            <input
              type="number"
              min={1}
              value={startPage}
              onChange={(e) => setStartPage(e.target.value)}
              placeholder="e.g. 12"
              className={inputClass}
            />
            <p className="text-xs text-gray-400 mt-1">
              The page number in the print zine where this work begins. Used for the flipbook jump menu and QR codes.
            </p>
            {startPage !== '' && (
              <div className="mt-3 flex items-start gap-4">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(`${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/read?work=${workId}`)}&size=120x120&margin=4`}
                  alt="QR code for this work in flipbook"
                  width={120}
                  height={120}
                  className="border border-gray-200 rounded"
                />
                <div>
                  <p className="text-xs text-gray-500 font-medium mb-1">QR code</p>
                  <p className="text-xs text-gray-400">Points to <code className="bg-gray-100 px-1 rounded">/read?work={workId}</code></p>
                  <p className="text-xs text-gray-400 mt-1">Right-click the QR image to save it for print.</p>
                </div>
              </div>
            )}
          </Field>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-gray-900 text-white px-6 py-2 rounded text-sm font-medium hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
            <Link href="/admin" className="px-6 py-2 rounded text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </main>
  )
}

const inputClass =
  'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  )
}
