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
        className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center mb-8 cursor-pointer hover:border-gray-400 transition-colors"
        onClick={() => fileInputRef.current?.click()}
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
          <p className="text-sm text-gray-500">{progress}</p>
        ) : (
          <>
            <p className="text-sm font-medium text-gray-700 mb-1">Click to upload pages</p>
            <p className="text-xs text-gray-400">
              Select multiple images — they'll be sorted by filename and appended after page {pages.length > 0 ? Math.max(...pages.map(p => p.page_number)) : 0}
            </p>
          </>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-600 mb-4">{error}</p>
      )}

      {/* Page grid */}
      {pages.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-12">No pages yet. Upload some above.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {pages.map((page) => (
            <div key={page.id} className="group relative">
              {/* Thumbnail */}
              <div className="relative aspect-[85/110] bg-gray-100 rounded overflow-hidden">
                <Image
                  src={page.image_url}
                  alt={`Page ${page.page_number}`}
                  fill
                  className="object-cover"
                />
                {/* Delete button */}
                <button
                  onClick={() => handleDelete(page)}
                  className="absolute top-1.5 right-1.5 bg-red-600 text-white rounded text-xs w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Delete page"
                >
                  ×
                </button>
              </div>

              {/* Page number — editable */}
              <div className="mt-1.5 flex items-center gap-1">
                <span className="text-xs text-gray-400">p.</span>
                <input
                  type="number"
                  defaultValue={page.page_number}
                  min={1}
                  onBlur={(e) => handleRenumber(page, parseInt(e.target.value, 10))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
                  }}
                  className="w-12 text-xs text-gray-700 border border-transparent hover:border-gray-300 focus:border-gray-400 rounded px-1 py-0.5 focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
