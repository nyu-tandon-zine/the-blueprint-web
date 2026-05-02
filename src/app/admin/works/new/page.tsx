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
  const [newAudioFiles, setNewAudioFiles] = useState<{ file: File; title: string }[]>([])

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

      // Step 2: insert the work (audio tracks go into work_audio_files, not media_url)
      const { data: newWork, error: workError } = await supabase.from('works').insert({
        title: title.trim(),
        media_type: mediaType,
        genre,
        description: description.trim() || null,
        content: content.trim() || null,
        works_cited: worksCited.trim() || null,
        media_url: null,
        external_link: externalLink.trim() || null,
        issue_id: issueId,
        author_id: resolvedAuthorId,
      }).select('id').single()
      if (workError) throw workError

      // Step 3b: upload audio tracks into work_audio_files
      if (mediaType === 'audio' && newAudioFiles.length > 0) {
        for (let i = 0; i < newAudioFiles.length; i++) {
          setUploadProgress(`Uploading track ${i + 1} of ${newAudioFiles.length}…`)
          const { file, title } = newAudioFiles[i]
          const ext = file.name.split('.').pop()
          const path = `audio/${Date.now()}-${i}.${ext}`
          const { error: uploadError } = await supabase.storage.from('media').upload(path, file)
          if (uploadError) throw uploadError
          const { data: urlData } = supabase.storage.from('media').getPublicUrl(path)
          const { error: insertError } = await supabase.from('work_audio_files').insert({
            work_id: newWork.id,
            audio_url: urlData.publicUrl,
            track_title: title,
            position: i + 1,
          })
          if (insertError) throw insertError
        }
        setUploadProgress('')
      }

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
    <main style={{ flex: 1, background: '#0a0a0a', color: '#fff', minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto px-8 py-10">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: 18 }}>←</Link>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: '#fff' }}>Add New Work</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Media type */}
          <Field label="Media Type">
            <select
              value={mediaType}
              onChange={(e) => setMediaType(e.target.value as MediaType)}
              style={selectStyle}
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
              style={inputStyle}
              placeholder="Title of the work"
            />
          </Field>

          {/* Genre */}
          <Field label="Genre">
            <input
              type="text"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              style={inputStyle}
              placeholder="e.g. fiction, nonfiction, fashion, photography"
            />
          </Field>

          {/* Issue */}
          <Field label="Issue">
            <select
              value={issueId}
              onChange={(e) => setIssueId(e.target.value)}
              required
              style={selectStyle}
            >
              {issues.map((issue) => (
                <option key={issue.id} value={issue.id}>{issue.semester}</option>
              ))}
            </select>
          </Field>

          {/* Author */}
          <div>
            <label style={labelStyle}>Author</label>
            <div className="flex gap-4 mb-3">
              {(['new', 'existing'] as const).map((mode) => (
                <label key={mode} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', color: 'rgba(255,255,255,0.65)', fontFamily: 'sans-serif' }}>
                  <input
                    type="radio"
                    value={mode}
                    checked={authorMode === mode}
                    onChange={() => setAuthorMode(mode)}
                    style={{ accentColor: '#c0392b' }}
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
                style={selectStyle}
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
                  style={inputStyle}
                />
                <input
                  type="email"
                  value={authorEmail}
                  onChange={(e) => setAuthorEmail(e.target.value)}
                  placeholder="Email (optional)"
                  style={inputStyle}
                />
                <textarea
                  value={authorBio}
                  onChange={(e) => setAuthorBio(e.target.value)}
                  placeholder="Bio (optional)"
                  rows={3}
                  style={inputStyle}
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={authorMajor}
                    onChange={(e) => setAuthorMajor(e.target.value)}
                    placeholder="Major (optional)"
                    style={inputStyle}
                  />
                  <input
                    type="number"
                    value={authorGradYear}
                    onChange={(e) => setAuthorGradYear(e.target.value)}
                    placeholder="Grad year (optional)"
                    min={2020}
                    max={2040}
                    style={inputStyle}
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
              style={inputStyle}
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
                style={{ ...inputStyle, fontFamily: mediaType === 'poetry' ? 'monospace' : 'sans-serif' }}
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
                style={inputStyle}
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
                style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontFamily: 'sans-serif' }}
              />
              {files.length > 0 && (
                <p style={hintStyle}>{files.length} image{files.length > 1 ? 's' : ''} selected</p>
              )}
              {uploadProgress && (
                <p style={hintStyle}>{uploadProgress}</p>
              )}
            </Field>
          )}

          {/* File upload — audio (multi-track) */}
          {mediaType === 'audio' && (
            <Field label="Audio tracks">
              <input
                type="file"
                accept="audio/*,video/mp4"
                multiple
                onChange={(e) => {
                  const picked = Array.from(e.target.files ?? [])
                  setNewAudioFiles(picked.map((f) => ({ file: f, title: f.name.replace(/\.[^/.]+$/, '') })))
                }}
                style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontFamily: 'sans-serif', marginBottom: 8 }}
              />
              {newAudioFiles.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <p style={{ ...hintStyle, fontWeight: 500, marginBottom: 6 }}>Edit track titles:</p>
                  {newAudioFiles.map((af, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, background: 'rgba(255,255,255,0.04)', borderRadius: 5, padding: '5px 8px' }}>
                      {/* Reorder buttons */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginRight: 2 }}>
                        <button
                          type="button"
                          onClick={() => setNewAudioFiles((prev) => {
                            if (i === 0) return prev
                            const next = [...prev]
                            ;[next[i - 1], next[i]] = [next[i], next[i - 1]]
                            return next
                          })}
                          disabled={i === 0}
                          style={{ background: 'none', border: 'none', cursor: i === 0 ? 'default' : 'pointer', color: i === 0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.45)', fontSize: 9, padding: 0, lineHeight: 1 }}
                          title="Move up"
                        >▲</button>
                        <button
                          type="button"
                          onClick={() => setNewAudioFiles((prev) => {
                            if (i === prev.length - 1) return prev
                            const next = [...prev]
                            ;[next[i], next[i + 1]] = [next[i + 1], next[i]]
                            return next
                          })}
                          disabled={i === newAudioFiles.length - 1}
                          style={{ background: 'none', border: 'none', cursor: i === newAudioFiles.length - 1 ? 'default' : 'pointer', color: i === newAudioFiles.length - 1 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.45)', fontSize: 9, padding: 0, lineHeight: 1 }}
                          title="Move down"
                        >▼</button>
                      </div>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'sans-serif', width: 16 }}>{i + 1}.</span>
                      <input
                        type="text"
                        value={af.title}
                        onChange={(e) => setNewAudioFiles((prev) => prev.map((x, j) => j === i ? { ...x, title: e.target.value } : x))}
                        style={{ ...inputStyle, fontSize: 12, padding: '4px 10px' }}
                      />
                      <button
                        type="button"
                        onClick={() => setNewAudioFiles((prev) => prev.filter((_, j) => j !== i))}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(192,57,43,0.7)', fontSize: 14, padding: '0 2px', lineHeight: 1 }}
                        title="Remove track"
                      >×</button>
                    </div>
                  ))}
                </div>
              )}
              {uploadProgress && <p style={hintStyle}>{uploadProgress}</p>}
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
                style={inputStyle}
                placeholder="https://"
              />
            </Field>
          )}

          {error && <p style={{ fontSize: 13, color: '#ff6b6b', fontFamily: 'sans-serif' }}>{error}</p>}

          <div className="flex gap-4 pt-2">
            <button
              type="submit"
              disabled={loading}
              style={{
                background: '#c0392b',
                color: '#fff',
                border: 'none',
                padding: '8px 20px',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 500,
                fontFamily: 'sans-serif',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
              }}
            >
              {loading ? 'Saving…' : 'Add Work'}
            </button>
            {needsContent && (
              <button
                type="button"
                onClick={() => setShowPreview((v) => !v)}
                style={{
                  background: 'none',
                  border: '0.5px solid rgba(255,255,255,0.2)',
                  color: 'rgba(255,255,255,0.65)',
                  padding: '8px 20px',
                  borderRadius: 6,
                  fontSize: 13,
                  fontFamily: 'sans-serif',
                  cursor: 'pointer',
                }}
              >
                {showPreview ? 'Hide Preview' : 'Preview'}
              </button>
            )}
            <Link
              href="/admin"
              style={{
                padding: '8px 20px',
                borderRadius: 6,
                fontSize: 13,
                fontFamily: 'sans-serif',
                color: 'rgba(255,255,255,0.4)',
                textDecoration: 'none',
              }}
            >
              Cancel
            </Link>
          </div>
        </form>

        {/* Live preview */}
        {showPreview && needsContent && (
          <div style={{ marginTop: 40, borderTop: '0.5px solid rgba(255,255,255,0.1)', paddingTop: 32 }}>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'sans-serif', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 24 }}>
              Live Preview
            </p>
            <div style={{ border: '0.5px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: 32, background: 'rgba(255,255,255,0.03)' }}>
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
                <p style={{ color: 'rgba(255,255,255,0.25)', fontStyle: 'italic', fontSize: 13, fontFamily: 'sans-serif' }}>
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

// Shared styles
const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,255,255,0.05)',
  border: '0.5px solid rgba(255,255,255,0.15)',
  borderRadius: 6,
  padding: '8px 12px',
  fontSize: 13,
  color: '#fff',
  fontFamily: 'sans-serif',
  outline: 'none',
  boxSizing: 'border-box',
}

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: 'pointer',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 500,
  color: 'rgba(255,255,255,0.55)',
  fontFamily: 'sans-serif',
  marginBottom: 6,
  letterSpacing: '0.02em',
}

const hintStyle: React.CSSProperties = {
  fontSize: 12,
  color: 'rgba(255,255,255,0.35)',
  fontFamily: 'sans-serif',
  marginTop: 4,
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}
