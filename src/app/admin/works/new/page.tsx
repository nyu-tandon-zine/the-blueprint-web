'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

import type { MediaType, Work } from '@/types'
import Link from 'next/link'
import { ArticleHeader, ProseBody, PoetryBody, WorksCited } from '@/components/TextFormatter'

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

export default function NewWorkPage() {
  const router = useRouter()
  const supabase = createClient()

  // Form state
  const [mediaType, setMediaType] = useState<MediaType>('prose')
  const [title, setTitle] = useState('')
  const [genre, setGenre] = useState('')
  const [description, setDescription] = useState('')
  const [content, setContent] = useState('')
  const [worksCited, setWorksCited] = useState('')
  const [externalLink, setExternalLink] = useState('')
  const [issueId, setIssueId] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [file, setFile] = useState<File | null>(null)

  // Author state — pick existing or create new
  const [authorMode, setAuthorMode] = useState<'existing' | 'new'>('new')
  const [authorId, setAuthorId] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [authorEmail, setAuthorEmail] = useState('')
  const [authorBio, setAuthorBio] = useState('')
  const [authorMajor, setAuthorMajor] = useState('')
  const [authorGradYear, setAuthorGradYear] = useState('')

  // Data for dropdowns
  const [authors, setAuthors] = useState<Author[]>([])
  const [issues, setIssues] = useState<Issue[]>([])

  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadProgress, setUploadProgress] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    async function loadData() {
      const [{ data: authorsData }, { data: issuesData }] = await Promise.all([
        supabase.from('authors').select('id, name').order('name'),
        supabase.from('issues').select('id, semester').order('published_at', { ascending: false }),
      ])
      if (authorsData) setAuthors(authorsData)
      if (issuesData) {
        setIssues(issuesData)
        if (issuesData.length > 0) setIssueId(issuesData[0].id)
      }
    }
    loadData()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Step 1: resolve author
      let resolvedAuthorId = authorId
      if (authorMode === 'new') {
        if (!authorName.trim()) throw new Error('Author name is required')
        const { data, error } = await supabase
          .from('authors')
          .insert({
            name: authorName.trim(),
            email: authorEmail.trim() || null,
            bio: authorBio.trim() || null,
            major: authorMajor.trim() || null,
            graduation_year: authorGradYear ? parseInt(authorGradYear) : null,
          })
          .select('id')
          .single()
        if (error) throw error
        resolvedAuthorId = data.id
      }

      // Step 2: upload single audio file if present
      let mediaUrl: string | null = null
      if (mediaType === 'audio' && file) {
        setUploadProgress('Uploading file…')
        const ext = file.name.split('.').pop()
        const path = `audio/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(path, file)
        if (uploadError) throw uploadError
        const { data: urlData } = supabase.storage.from('media').getPublicUrl(path)
        mediaUrl = urlData.publicUrl
        setUploadProgress('')
      }

      // Step 3: insert the work
      const { data: newWork, error: workError } = await supabase.from('works').insert({
        title: title.trim(),
        media_type: mediaType,
        genre,
        description: description.trim() || null,
        content: content.trim() || null,
        works_cited: worksCited.trim() || null,
        media_url: mediaUrl,
        external_link: externalLink.trim() || null,
        issue_id: issueId,
        author_id: resolvedAuthorId,
      }).select('id').single()
      if (workError) throw workError

      // Step 4: upload images for visual-art
      if (mediaType === 'visual-art' && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          setUploadProgress(`Uploading image ${i + 1} of ${files.length}…`)
          const f = files[i]
          const ext = f.name.split('.').pop()
          const path = `visual-art/${Date.now()}-${i}.${ext}`
          const { error: uploadError } = await supabase.storage.from('media').upload(path, f)
          if (uploadError) throw uploadError
          const { data: urlData } = supabase.storage.from('media').getPublicUrl(path)
          const { error: imgError } = await supabase.from('work_images').insert({
            work_id: newWork.id,
            image_url: urlData.publicUrl,
            position: i + 1,
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

  return (
    <main className="flex-1 bg-white">
      <div className="max-w-2xl mx-auto px-8 py-10">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" className="text-gray-400 hover:text-gray-700 transition-colors">←</Link>
          <h1 className="text-2xl font-bold text-gray-900">Add New Work</h1>
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
              placeholder="Title of the work"
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
            <select
              value={issueId}
              onChange={(e) => setIssueId(e.target.value)}
              required
              className={inputClass}
            >
              {issues.map((issue) => (
                <option key={issue.id} value={issue.id}>{issue.semester}</option>
              ))}
            </select>
          </Field>

          {/* Author */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
            <div className="flex gap-4 mb-3">
              {(['new', 'existing'] as const).map((mode) => (
                <label key={mode} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="radio"
                    value={mode}
                    checked={authorMode === mode}
                    onChange={() => setAuthorMode(mode)}
                  />
                  {mode === 'new' ? 'New author' : 'Existing author'}
                </label>
              ))}
            </div>

            {authorMode === 'existing' ? (
              <select
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
                required
                className={inputClass}
              >
                <option value="">Select an author…</option>
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Full name"
                  required
                  className={inputClass}
                />
                <input
                  type="email"
                  value={authorEmail}
                  onChange={(e) => setAuthorEmail(e.target.value)}
                  placeholder="Email (optional)"
                  className={inputClass}
                />
                <textarea
                  value={authorBio}
                  onChange={(e) => setAuthorBio(e.target.value)}
                  placeholder="Bio (optional)"
                  rows={3}
                  className={inputClass}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={authorMajor}
                    onChange={(e) => setAuthorMajor(e.target.value)}
                    placeholder="Major (optional)"
                    className={inputClass}
                  />
                  <input
                    type="number"
                    value={authorGradYear}
                    onChange={(e) => setAuthorGradYear(e.target.value)}
                    placeholder="Grad year (optional)"
                    min={2020}
                    max={2040}
                    className={inputClass}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <Field label="Description (optional)">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={inputClass}
              placeholder="Short description or blurb"
            />
          </Field>

          {/* Content — prose and poetry */}
          {needsContent && (
            <Field label={mediaType === 'poetry' ? 'Poem text' : 'Body text'}>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={16}
                className={`${inputClass} ${mediaType === 'poetry' ? 'font-mono' : ''}`}
                placeholder={
                  mediaType === 'poetry'
                    ? 'Paste poem here. Line breaks and indentation will be preserved exactly.'
                    : 'Paste or type the full text. Separate paragraphs with a blank line.'
                }
              />
            </Field>
          )}

          {/* Works cited — prose only */}
          {mediaType === 'prose' && (
            <Field label="Works Cited (optional)">
              <textarea
                value={worksCited}
                onChange={(e) => setWorksCited(e.target.value)}
                rows={4}
                className={inputClass}
                placeholder="One citation per line"
              />
            </Field>
          )}

          {/* File upload — visual art (multiple) */}
          {mediaType === 'visual-art' && (
            <Field label="Images (select one or more)">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                className="text-sm text-gray-600"
              />
              {files.length > 0 && (
                <p className="text-xs text-gray-400 mt-1">{files.length} image{files.length > 1 ? 's' : ''} selected</p>
              )}
              {uploadProgress && (
                <p className="text-xs text-gray-400 mt-1">{uploadProgress}</p>
              )}
            </Field>
          )}

          {/* File upload — audio (single) */}
          {mediaType === 'audio' && (
            <Field label="Audio file">
              <input
                type="file"
                accept="audio/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="text-sm text-gray-600"
              />
              {uploadProgress && (
                <p className="text-xs text-gray-400 mt-1">{uploadProgress}</p>
              )}
            </Field>
          )}

          {/* External link — film, game, and optionally audio */}
          {needsExternalLink && (
            <Field label={
              mediaType === 'film' ? 'YouTube / Vimeo URL' :
              mediaType === 'game' ? 'itch.io URL' :
              'External link (Spotify, SoundCloud, etc.) — optional'
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

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-gray-900 text-white px-6 py-2 rounded text-sm font-medium hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving…' : 'Add Work'}
            </button>
            {needsContent && (
              <button
                type="button"
                onClick={() => setShowPreview((v) => !v)}
                className="px-6 py-2 rounded text-sm font-medium border border-gray-300 text-gray-600 hover:border-gray-500 transition-colors"
              >
                {showPreview ? 'Hide Preview' : 'Preview'}
              </button>
            )}
            <Link
              href="/admin"
              className="px-6 py-2 rounded text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>

        {/* Live preview */}
        {showPreview && needsContent && (
          <div className="mt-10 border-t border-gray-200 pt-8">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-6">
              Live Preview
            </p>
            <div className="border border-gray-200 rounded-lg p-8 bg-white">
              <ArticleHeader
                work={{
                  id: '',
                  title: title || 'Untitled',
                  media_type: mediaType,
                  genre: genre as Work['genre'],
                  description: null,
                  content: content || null,
                  works_cited: worksCited || null,
                  media_url: null,
                  external_link: null,
                  created_at: new Date().toISOString(),
                  issue_id: '',
                  author_id: '',
                  start_page: null,
                  author: {
                    id: '',
                    name: authorMode === 'existing'
                      ? authors.find((a) => a.id === authorId)?.name ?? 'Unknown'
                      : authorName || 'Author Name',
                    email: null,
                    major: null,
                    graduation_year: null,
                    bio: null,
                  },
                }}
              />
              {content ? (
                mediaType === 'poetry' ? (
                  <PoetryBody content={content} />
                ) : (
                  <ProseBody content={content} />
                )
              ) : (
                <p className="text-gray-300 italic text-sm">
                  Start typing or paste content above to see the preview...
                </p>
              )}
              {worksCited && <WorksCited text={worksCited} />}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

// Small helper components to reduce repetition
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
