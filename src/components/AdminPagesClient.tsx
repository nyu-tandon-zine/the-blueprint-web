'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase-browser'
import type { Issue, Page } from '@/types'

interface Props {
  issue: Issue
  initialPages: Page[]
}

export default function AdminPagesClient({ issue, initialPages }: Props) {
  const supabase = createClient()
  const [pages, setPages] = useState<Page[]>(initialPages)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length === 0) return

    setUploading(true)
    setError(null)

    try {
      // Sort files by name so they upload in alphabetical/numeric order
      files.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))

      const nextPageNumber = pages.length > 0
        ? Math.max(...pages.map((p) => p.page_number)) + 1
        : 1

      const newPages: Page[] = []

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const pageNumber = nextPageNumber + i
        setProgress(`Uploading page ${pageNumber} (${i + 1} of ${files.length})…`)

        const ext = file.name.split('.').pop()
        const path = `pages/${issue.id}/${pageNumber}-${Date.now()}.${ext}`

        const { error: uploadError } = await supabase.storage
          .from('media')
          .upload(path, file)
        if (uploadError) throw uploadError

        const { data: urlData } = supabase.storage.from('media').getPublicUrl(path)

        const { data: inserted, error: insertError } = await supabase
          .from('pages')
          .insert({
            issue_id: issue.id,
            page_number: pageNumber,
            image_url: urlData.publicUrl,
          })
          .select()
          .single()

        if (insertError) throw insertError
        newPages.push(inserted as Page)
      }

      setPages((prev) => [...prev, ...newPages].sort((a, b) => a.page_number - b.page_number))
      setProgress('')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      setProgress('')
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  async function handleDelete(page: Page) {
    if (!confirm(`Delete page ${page.page_number}? This cannot be undone.`)) return

    const { error: deleteError } = await supabase
      .from('pages')
      .delete()
      .eq('id', page.id)

    if (deleteError) {
      setError(deleteError.message)
      return
    }

    setPages((prev) => prev.filter((p) => p.id !== page.id))
  }

  async function handleRenumber(page: Page, newNumber: number) {
    if (isNaN(newNumber) || newNumber < 1 || newNumber === page.page_number) return

    const conflict = pages.find((p) => p.page_number === newNumber && p.id !== page.id)

    if (conflict) {
      // Swap via a temporary number to avoid the unique constraint
      const tempNumber = Math.max(...pages.map((p) => p.page_number)) + 999

      const { error: e1 } = await supabase.from('pages').update({ page_number: tempNumber }).eq('id', page.id)
      if (e1) { setError(e1.message); return }

      const { error: e2 } = await supabase.from('pages').update({ page_number: page.page_number }).eq('id', conflict.id)
      if (e2) { setError(e2.message); return }

      const { error: e3 } = await supabase.from('pages').update({ page_number: newNumber }).eq('id', page.id)
      if (e3) { setError(e3.message); return }

      setPages((prev) =>
        prev.map((p) => {
          if (p.id === page.id) return { ...p, page_number: newNumber }
          if (p.id === conflict.id) return { ...p, page_number: page.page_number }
          return p
        }).sort((a, b) => a.page_number - b.page_number)
      )
    } else {
      const { error: updateError } = await supabase
        .from('pages')
        .update({ page_number: newNumber })
        .eq('id', page.id)

      if (updateError) { setError(updateError.message); return }

      setPages((prev) =>
        prev.map((p) => p.id === page.id ? { ...p, page_number: newNumber } : p)
          .sort((a, b) => a.page_number - b.page_number)
      )
    }
  }

  return (
    <div>
      {/* Upload area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: '1.5px dashed rgba(255,255,255,0.15)',
          borderRadius: 8,
          padding: '32px',
          textAlign: 'center',
          marginBottom: 32,
          cursor: 'pointer',
          transition: 'border-color 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.35)')}
        onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)')}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleUpload}
          disabled={uploading}
        />
        {uploading ? (
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontFamily: 'sans-serif' }}>{progress}</p>
        ) : (
          <>
            <p style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.8)', fontFamily: 'sans-serif', marginBottom: 4 }}>
              Click to upload pages
            </p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', fontFamily: 'sans-serif' }}>
              Select multiple images — sorted by filename, appended after page {pages.length > 0 ? Math.max(...pages.map(p => p.page_number)) : 0}
            </p>
          </>
        )}
      </div>

      {error && (
        <p style={{ fontSize: 13, color: '#ff6b6b', fontFamily: 'sans-serif', marginBottom: 16 }}>{error}</p>
      )}

      {/* Page grid */}
      {pages.length === 0 ? (
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', fontFamily: 'sans-serif', textAlign: 'center', padding: '48px 0' }}>
          No pages yet. Upload some above.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {pages.map((page) => (
            <div key={page.id} className="group relative">
              {/* Thumbnail */}
              <div className="relative aspect-[85/110] rounded overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <Image
                  src={page.image_url}
                  alt={`Page ${page.page_number}`}
                  fill
                  className="object-cover"
                />
                {/* Delete button */}
                <button
                  onClick={() => handleDelete(page)}
                  className="absolute top-1.5 right-1.5 rounded text-xs w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(192,57,43,0.9)', color: '#fff', border: 'none', cursor: 'pointer' }}
                  title="Delete page"
                >
                  ×
                </button>
              </div>

              {/* Page number — editable */}
              <div className="mt-1.5 flex items-center gap-1">
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontFamily: 'sans-serif' }}>p.</span>
                <input
                  type="number"
                  defaultValue={page.page_number}
                  min={1}
                  onBlur={(e) => handleRenumber(page, parseInt(e.target.value, 10))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                  }}
                  style={{
                    width: 44,
                    fontSize: 11,
                    color: 'rgba(255,255,255,0.7)',
                    background: 'transparent',
                    border: '0.5px solid transparent',
                    borderRadius: 4,
                    padding: '2px 4px',
                    outline: 'none',
                    fontFamily: 'sans-serif',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)')}
                  onBlurCapture={e => (e.currentTarget.style.borderColor = 'transparent')}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
