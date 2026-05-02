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
  const [newAudioFiles, setNewAudioFiles] = useState<{ file: File; title: string }[]>([])
  const [existingAudioFiles, setExistingAudioFiles] = useState<{ id: string; audio_url: string; track_title: string; position: number }[]>([])

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
      const [{ data: work }, { data: authorsData }, { data: issuesData }, { data: imagesData }, { data: audioData }] =
        await Promise.all([
          supabase.from('works').select('*').eq('id', workId).single(),
          supabase.from('authors').select('id, name').order('name'),
          supabase.from('issues').select('id, semester').order('published_at', { ascending: false }),
          supabase.from('work_images').select('*').eq('work_id', workId).order('position'),
          supabase.from('work_audio_files').select('*').eq('work_id', workId).order('position'),
        ])

      if (authorsData) setAuthors(authorsData)
      if (issuesData) setIssues(issuesData)
      if (imagesData) setExistingImages(imagesData)
      if (audioData) setExistingAudioFiles(audioData)

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

      // Upload any new audio files
      if (mediaType === 'audio' && newAudioFiles.length > 0) {
        const nextPosition = existingAudioFiles.length + 1
        for (let i = 0; i < newAudioFiles.length; i++) {
          setUploadProgress(`Uploading track ${i + 1} of ${newAudioFiles.length}…`)
          const { file, title } = newAudioFiles[i]
          const ext = file.name.split('.').pop()
          const path = `audio/${Date.now()}-${i}.${ext}`
          const { error: uploadError } = await supabase.storage.from('media').upload(path, file)
          if (uploadError) throw uploadError
          const { data: urlData } = supabase.storage.from('media').getPublicUrl(path)
          const { error: insertError } = await supabase.from('work_audio_files').insert({
            work_id: workId,
            audio_url: urlData.publicUrl,
            track_title: title,
            position: nextPosition + i,
          })
          if (insertError) throw insertError
        }
        setUploadProgress('')
      }

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

  async function handleReorderTrack(index: number, direction: 'up' | 'down') {
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= existingAudioFiles.length) return

    const a = existingAudioFiles[index]
    const b = existingAudioFiles[swapIndex]

    // Swap positions in DB (use temp to avoid unique constraint)
    const tempPos = Math.max(...existingAudioFiles.map((f) => f.position)) + 999
    const { error: e1 } = await supabase.from('work_audio_files').update({ position: tempPos }).eq('id', a.id)
    if (e1) { setError(e1.message); return }
    const { error: e2 } = await supabase.from('work_audio_files').update({ position: a.position }).eq('id', b.id)
    if (e2) { setError(e2.message); return }
    const { error: e3 } = await supabase.from('work_audio_files').update({ position: b.position }).eq('id', a.id)
    if (e3) { setError(e3.message); return }

    // Swap in local state and re-sort
    setExistingAudioFiles((prev) => {
      const next = prev.map((f) => {
        if (f.id === a.id) return { ...f, position: b.position }
        if (f.id === b.id) return { ...f, position: a.position }
        return f
      })
      return next.sort((x, y) => x.position - y.position)
    })
  }

  async function handleDeleteTrack(trackId: string) {
    if (!confirm('Remove this track? This cannot be undone.')) return
    const { error: delError } = await supabase.from('work_audio_files').delete().eq('id', trackId)
    if (delError) { setError(delError.message); return }
    setExistingAudioFiles((prev) => prev.filter((f) => f.id !== trackId))
  }

  const needsContent = mediaType === 'prose' || mediaType === 'poetry'
  const needsExternalLink = mediaType === 'film' || mediaType === 'game' || mediaType === 'audio'

  if (fetchingWork) {
    return (
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0a', minHeight: '100vh' }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, fontFamily: 'sans-serif' }}>Loading…</p>
      </main>
    )
  }

  return (
    <main style={{ flex: 1, background: '#0a0a0a', color: '#fff', minHeight: '100vh' }}>
      <div className="max-w-2xl mx-auto px-8 py-10">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none', fontSize: 18 }}>←</Link>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: '#fff' }}>Edit Work</h1>
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
            <select value={issueId} onChange={(e) => setIssueId(e.target.value)} required style={selectStyle}>
              {issues.map((issue) => (
                <option key={issue.id} value={issue.id}>{issue.semester}</option>
              ))}
            </select>
          </Field>

          {/* Author */}
          <Field label="Author">
            <select value={authorId} onChange={(e) => setAuthorId(e.target.value)} required style={selectStyle}>
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
              style={inputStyle}
            />
          </Field>

          {/* Content */}
          {needsContent && (
            <Field label={mediaType === 'poetry' ? 'Poem text' : 'Body text'}>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={16}
                style={{ ...inputStyle, fontFamily: mediaType === 'poetry' ? 'monospace' : 'sans-serif' }}
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
                style={inputStyle}
              />
            </Field>
          )}

          {/* File upload — visual art (multiple) */}
          {mediaType === 'visual-art' && (
            <Field label="Images">
              {existingImages.length > 0 && (
                <p style={hintStyle}>
                  {existingImages.length} image{existingImages.length > 1 ? 's' : ''} currently uploaded.
                </p>
              )}
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setNewImages(Array.from(e.target.files ?? []))}
                style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontFamily: 'sans-serif' }}
              />
              {newImages.length > 0 && (
                <p style={hintStyle}>{newImages.length} new image{newImages.length > 1 ? 's' : ''} selected — will be appended</p>
              )}
              {uploadProgress && <p style={hintStyle}>{uploadProgress}</p>}
            </Field>
          )}

          {/* File upload — audio (multi-track) */}
          {mediaType === 'audio' && (
            <Field label="Audio tracks">
              {existingAudioFiles.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <p style={{ ...hintStyle, fontWeight: 500, marginBottom: 6 }}>Existing tracks:</p>
                  {existingAudioFiles.map((f, i) => (
                    <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'rgba(255,255,255,0.55)', fontFamily: 'sans-serif', marginBottom: 4, background: 'rgba(255,255,255,0.04)', borderRadius: 5, padding: '5px 8px' }}>
                      {/* Reorder buttons */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginRight: 2 }}>
                        <button
                          type="button"
                          onClick={() => handleReorderTrack(i, 'up')}
                          disabled={i === 0}
                          style={{ background: 'none', border: 'none', cursor: i === 0 ? 'default' : 'pointer', color: i === 0 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.45)', fontSize: 9, padding: 0, lineHeight: 1 }}
                          title="Move up"
                        >▲</button>
                        <button
                          type="button"
                          onClick={() => handleReorderTrack(i, 'down')}
                          disabled={i === existingAudioFiles.length - 1}
                          style={{ background: 'none', border: 'none', cursor: i === existingAudioFiles.length - 1 ? 'default' : 'pointer', color: i === existingAudioFiles.length - 1 ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.45)', fontSize: 9, padding: 0, lineHeight: 1 }}
                          title="Move down"
                        >▼</button>
                      </div>
                      <span style={{ color: 'rgba(255,255,255,0.3)', width: 14 }}>{i + 1}.</span>
                      <span style={{ flex: 1 }}>{f.track_title}</span>
                      <a href={f.audio_url} target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'underline' }}>play</a>
                      <button
                        type="button"
                        onClick={() => handleDeleteTrack(f.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(192,57,43,0.7)', fontSize: 14, padding: '0 2px', lineHeight: 1 }}
                        title="Remove track"
                      >×</button>
                    </div>
                  ))}
                </div>
              )}
              <p style={hintStyle}>Add new tracks (appended after existing):</p>
              <input
                type="file"
                accept="audio/*,video/mp4"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files ?? [])
                  setNewAudioFiles(files.map((f) => ({ file: f, title: f.name.replace(/\.[^/.]+$/, '') })))
                }}
                style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', fontFamily: 'sans-serif', marginBottom: 8 }}
              />
              {newAudioFiles.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <p style={{ ...hintStyle, fontWeight: 500, marginBottom: 6 }}>Edit track titles:</p>
                  {newAudioFiles.map((af, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'sans-serif', width: 16 }}>{existingAudioFiles.length + i + 1}.</span>
                      <input
                        type="text"
                        value={af.title}
                        onChange={(e) => setNewAudioFiles((prev) => prev.map((x, j) => j === i ? { ...x, title: e.target.value } : x))}
                        style={{ ...inputStyle, fontSize: 12, padding: '4px 10px' }}
                      />
                    </div>
                  ))}
                </div>
              )}
              {uploadProgress && <p style={hintStyle}>{uploadProgress}</p>}
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
                style={inputStyle}
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
              style={inputStyle}
            />
            <p style={hintStyle}>
              The page number in the print zine where this work begins. Used for the flipbook jump menu and QR codes.
            </p>
            {startPage !== '' && (
              <div style={{ marginTop: 12, display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(`${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/read?work=${workId}`)}&size=120x120&margin=4`}
                  alt="QR code for this work in flipbook"
                  width={120}
                  height={120}
                  style={{ border: '0.5px solid rgba(255,255,255,0.15)', borderRadius: 6 }}
                />
                <div>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', fontFamily: 'sans-serif', fontWeight: 500, marginBottom: 4 }}>QR code</p>
                  <p style={hintStyle}>Points to <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: 3, fontSize: 11 }}>/read?work={workId}</code></p>
                  <p style={{ ...hintStyle, marginTop: 4 }}>Right-click the QR image to save it for print.</p>
                </div>
              </div>
            )}
          </Field>

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
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
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
