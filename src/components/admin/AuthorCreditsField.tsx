'use client'

// ----------------------------------------------------------------
// AuthorCreditsField — the "who made this" picker for the admin work forms.
//
// An ordered list of credits; each row is either an existing author or a new
// one to create on save. Order = byline order. Role is optional ("music",
// "director") and only worth filling in for collaborations.
//
// Saving is two steps (see resolveCredits / setWorkCredits below) because the
// new-work form needs author ids before it can insert the work.
// ----------------------------------------------------------------

import { useMemo } from 'react'
import type { createClient } from '@/lib/supabase-browser'

type Supabase = ReturnType<typeof createClient>
export type AuthorOption = { id: string; name: string }

export type CreditDraft =
  | { key: string; kind: 'existing'; authorId: string; role: string }
  | {
      key: string
      kind: 'new'
      name: string
      email: string
      bio: string
      major: string
      gradYear: string
      role: string
    }

const newKey = () => Math.random().toString(36).slice(2)

export const emptyExisting = (authorId = '', role = ''): CreditDraft => ({
  key: newKey(), kind: 'existing', authorId, role,
})
const emptyNew = (): CreditDraft => ({
  key: newKey(), kind: 'new', name: '', email: '', bio: '', major: '', gradYear: '', role: '',
})

export default function AuthorCreditsField({
  authors,
  value,
  onChange,
}: {
  authors: AuthorOption[]
  value: CreditDraft[]
  onChange: (next: CreditDraft[]) => void
}) {
  const byName = useMemo(
    () => new Map(authors.map((a) => [a.name.trim().toLowerCase(), a])),
    [authors],
  )
  const chosenIds = new Set(value.flatMap((d) => (d.kind === 'existing' && d.authorId ? [d.authorId] : [])))

  const update = (key: string, patch: Partial<CreditDraft>) =>
    onChange(value.map((d) => (d.key === key ? ({ ...d, ...patch } as CreditDraft) : d)))
  const replace = (key: string, next: CreditDraft) =>
    onChange(value.map((d) => (d.key === key ? next : d)))
  const remove = (key: string) => onChange(value.filter((d) => d.key !== key))
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= value.length) return
    const next = value.slice()
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  const multi = value.length > 1

  return (
    <div>
      <label style={labelStyle}>{multi ? 'Authors (in byline order)' : 'Author'}</label>

      <div className="space-y-3">
        {value.map((d, i) => {
          const dupe = d.kind === 'new' ? byName.get(d.name.trim().toLowerCase()) : undefined
          return (
            <div key={d.key} style={rowStyle}>
              <div className="flex items-start gap-2">
                <div className="flex-1 min-w-0 space-y-2">
                  {d.kind === 'existing' ? (
                    <select
                      value={d.authorId}
                      onChange={(e) => update(d.key, { authorId: e.target.value })}
                      required
                      style={selectStyle}
                    >
                      <option value="">Select an author…</option>
                      {authors.map((a) => (
                        <option key={a.id} value={a.id} disabled={a.id !== d.authorId && chosenIds.has(a.id)}>
                          {a.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <>
                      <input
                        type="text"
                        value={d.name}
                        onChange={(e) => update(d.key, { name: e.target.value })}
                        placeholder="Full name (as it should appear in the byline)"
                        required
                        style={inputStyle}
                      />
                      {dupe && (
                        <p style={warnStyle}>
                          “{dupe.name}” already exists.{' '}
                          <button
                            type="button"
                            onClick={() => replace(d.key, emptyExisting(dupe.id, d.role))}
                            style={linkBtnStyle}
                          >
                            Use the existing author
                          </button>{' '}
                          so their work stays on one contributor page.
                        </p>
                      )}
                      <input
                        type="email"
                        value={d.email}
                        onChange={(e) => update(d.key, { email: e.target.value })}
                        placeholder="Email (optional, private — never shown on the site)"
                        style={inputStyle}
                      />
                      <textarea
                        value={d.bio}
                        onChange={(e) => update(d.key, { bio: e.target.value })}
                        placeholder="Bio (optional, public)"
                        rows={3}
                        style={inputStyle}
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={d.major}
                          onChange={(e) => update(d.key, { major: e.target.value })}
                          placeholder="Major (optional)"
                          style={inputStyle}
                        />
                        <input
                          type="number"
                          value={d.gradYear}
                          onChange={(e) => update(d.key, { gradYear: e.target.value })}
                          placeholder="Grad year (optional)"
                          min={2020}
                          max={2040}
                          style={inputStyle}
                        />
                      </div>
                    </>
                  )}

                  {multi && (
                    <input
                      type="text"
                      value={d.role}
                      onChange={(e) => update(d.key, { role: e.target.value })}
                      placeholder="Role (optional) — e.g. music, director, illustration"
                      style={inputStyle}
                    />
                  )}
                </div>

                <div className="flex flex-col gap-1 shrink-0">
                  {multi && (
                    <>
                      <button type="button" onClick={() => move(i, -1)} disabled={i === 0} style={iconBtnStyle} aria-label="Move up">↑</button>
                      <button type="button" onClick={() => move(i, 1)} disabled={i === value.length - 1} style={iconBtnStyle} aria-label="Move down">↓</button>
                    </>
                  )}
                  {value.length > 1 && (
                    <button type="button" onClick={() => remove(d.key)} style={iconBtnStyle} aria-label="Remove author">×</button>
                  )}
                </div>
              </div>

              {d.kind === 'existing' && (
                <button type="button" onClick={() => replace(d.key, { ...emptyNew(), role: d.role })} style={{ ...linkBtnStyle, marginTop: 6 }}>
                  Not in the list? Create a new author
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex gap-4 mt-3">
        <button type="button" onClick={() => onChange([...value, emptyExisting()])} style={linkBtnStyle}>
          + Add another author
        </button>
      </div>
    </div>
  )
}

// ----------------------------------------------------------------
// Saving
// ----------------------------------------------------------------

export type ResolvedCredits = { authorIds: string[]; roles: string[] }

/** Check the drafts and create any new authors. Returns ids in byline order. */
export async function resolveCredits(supabase: Supabase, drafts: CreditDraft[]): Promise<ResolvedCredits> {
  if (drafts.length === 0) throw new Error('Add at least one author')

  const authorIds: string[] = []
  const roles: string[] = []

  for (const d of drafts) {
    let id: string
    if (d.kind === 'existing') {
      if (!d.authorId) throw new Error('Pick an author for every row (or remove the empty one)')
      id = d.authorId
    } else {
      const name = d.name.trim()
      if (!name) throw new Error('New authors need a name')
      const { data, error } = await supabase
        .from('authors')
        .insert({
          name,
          bio: d.bio.trim() || null,
          major: d.major.trim() || null,
          graduation_year: d.gradYear ? parseInt(d.gradYear, 10) : null,
          // slug is filled in by a database trigger
        })
        .select('id')
        .single()
      if (error) throw error
      id = data.id

      // Email lives in the private author_contacts table (admin-only),
      // never on the public authors row.
      if (d.email.trim()) {
        const { error: contactError } = await supabase
          .from('author_contacts')
          .insert({ author_id: id, email: d.email.trim() })
        if (contactError) throw contactError
      }
    }
    if (authorIds.includes(id)) throw new Error('The same author is listed twice')
    authorIds.push(id)
    roles.push(d.role.trim())
  }

  return { authorIds, roles }
}

/** Replace a work's credits atomically (Postgres function set_work_credits). */
export async function setWorkCredits(supabase: Supabase, workId: string, { authorIds, roles }: ResolvedCredits) {
  const { error } = await supabase.rpc('set_work_credits', {
    p_work_id: workId,
    p_author_ids: authorIds,
    p_roles: roles,
  })
  if (error) throw error
}

// ----------------------------------------------------------------
// Styles (match the admin forms)
// ----------------------------------------------------------------

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
const selectStyle: React.CSSProperties = { ...inputStyle, cursor: 'pointer' }
const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 500,
  color: 'rgba(255,255,255,0.55)',
  fontFamily: 'sans-serif',
  marginBottom: 6,
  letterSpacing: '0.02em',
}
const rowStyle: React.CSSProperties = {
  padding: 12,
  borderRadius: 8,
  border: '0.5px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.02)',
}
const linkBtnStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  padding: 0,
  fontSize: 12,
  color: '#e74c3c',
  fontFamily: 'sans-serif',
  cursor: 'pointer',
  textDecoration: 'underline',
  textUnderlineOffset: 3,
}
const warnStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#f5b041',
  fontFamily: 'sans-serif',
  lineHeight: 1.5,
}
const iconBtnStyle: React.CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 6,
  border: '0.5px solid rgba(255,255,255,0.15)',
  background: 'rgba(255,255,255,0.04)',
  color: 'rgba(255,255,255,0.7)',
  fontSize: 14,
  cursor: 'pointer',
}
