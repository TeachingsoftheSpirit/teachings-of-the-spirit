'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

type Note = {
  id: string
  teaching_number: number
  body: string
  created_at: string
  teachings: {
    title: string
    date: string
    slug?: string
  } | null
}

type Props = {
  teachingNumber?: number
  teachingTitle?: string | null
}

const GARAMOND =
  '"EB Garamond", Garamond, "Palatino Linotype", Palatino, "Times New Roman", serif'

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  } catch {
    return iso
  }
}

export default function CheckMarginalia({
  teachingNumber,
  teachingTitle,
}: Props) {
  const [open, setOpen] = useState(false)
  const [scope, setScope] = useState<'this' | 'all'>(
    teachingNumber != null ? 'this' : 'all'
  )
  const [loading, setLoading] = useState(false)
  const [notes, setNotes] = useState<Note[]>([])
  const [error, setError] = useState('')
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async (currentScope: 'this' | 'all') => {
    setLoading(true)
    setError('')
    try {
      const params = new URLSearchParams()
      if (currentScope === 'this' && teachingNumber != null) {
        params.set('teaching_number', String(teachingNumber))
      }
      const res = await fetch(`/api/marginalia?${params.toString()}`)
      if (!res.ok) {
        if (res.status === 401) {
          setError('Sign in to see and write Marginalia.')
          setNotes([])
          return
        }
        throw new Error('Could not load Marginalia')
      }
      const data = await res.json()
      setNotes(data.notes || [])
    } catch (err: any) {
      setError(err.message || 'Could not load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!open) return
    load(scope)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, scope, teachingNumber])

  const addNote = async () => {
    if (teachingNumber == null || !draft.trim() || saving) return
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/marginalia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teaching_number: teachingNumber,
          body: draft.trim(),
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not save')
      setDraft('')
      setScope('this')
      await load('this')
    } catch (err: any) {
      setError(err.message || 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  const canCompose = teachingNumber != null && scope === 'this'

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setScope(teachingNumber != null ? 'this' : 'all')
          setOpen(true)
        }}
        className="text-[13px] text-[#6B5E54] hover:text-[#2C2522] underline underline-offset-2 transition-colors"
        style={{ fontFamily: GARAMOND }}
      >
        Marginalia
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setOpen(false)}
          />
          <div
            className="relative w-full max-w-md max-h-[min(560px,86vh)] flex flex-col rounded-sm shadow-2xl overflow-hidden"
            style={{
              background: '#F7F1E6',
              border: '1px solid #8A735A',
            }}
          >
            <div
              className="flex items-center justify-between px-4 py-3 shrink-0"
              style={{
                background:
                  'linear-gradient(180deg, #5c4a3a 0%, #3d342f 100%)',
              }}
            >
              <div className="min-w-0 pr-2">
                <div
                  className="text-[15px] text-[#F5F0E6] font-medium"
                  style={{ fontFamily: GARAMOND }}
                >
                  Marginalia
                </div>
                <div className="text-[11px] text-[#C9BDA8] truncate">
                  {scope === 'this' && teachingTitle
                    ? teachingTitle
                    : scope === 'this' && teachingNumber != null
                      ? `Teaching ${teachingNumber}`
                      : 'All your notes'}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-[#F5F0E6] hover:text-white text-sm px-1 shrink-0"
              >
                ✕
              </button>
            </div>

            {teachingNumber != null && (
              <div className="flex gap-2 px-4 py-2 border-b border-[#E5DFD3] shrink-0">
                <button
                  type="button"
                  onClick={() => setScope('this')}
                  className={`text-[12px] px-2 py-1 rounded-sm ${
                    scope === 'this'
                      ? 'bg-[#2C2522] text-[#F5F0E6]'
                      : 'text-[#5C4A3A] hover:bg-[#EDE4D4]'
                  }`}
                >
                  This Teaching
                </button>
                <button
                  type="button"
                  onClick={() => setScope('all')}
                  className={`text-[12px] px-2 py-1 rounded-sm ${
                    scope === 'all'
                      ? 'bg-[#2C2522] text-[#F5F0E6]'
                      : 'text-[#5C4A3A] hover:bg-[#EDE4D4]'
                  }`}
                >
                  All my Marginalia
                </button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <p className="text-[13px] text-[#6B5E54]">Loading…</p>
              ) : error && notes.length === 0 ? (
                <p className="text-[13px] text-[#7A3E3E]">{error}</p>
              ) : notes.length === 0 ? (
                <p
                  className="text-[13px] text-[#6B5E54] leading-relaxed"
                  style={{ fontFamily: GARAMOND }}
                >
                  {scope === 'this'
                    ? 'No notes on this Teaching yet. Add one below.'
                    : 'No Marginalia yet.'}
                </p>
              ) : (
                <ul className="space-y-4">
                  {notes.map((note) => {
                    const href = note.teachings?.slug
                      ? `/teachings/${note.teachings.slug}`
                      : `/teachings/${note.teaching_number}`
                    return (
                      <li
                        key={note.id}
                        className="pb-3 border-b border-[#E5DFD3] last:border-0"
                      >
                        {(scope === 'all' || teachingNumber == null) && (
                          <Link
                            href={href}
                            onClick={() => setOpen(false)}
                            className="text-[14px] font-semibold text-[#2C2522] hover:underline"
                            style={{ fontFamily: GARAMOND }}
                          >
                            {note.teachings?.title ||
                              `Teaching ${note.teaching_number}`}
                          </Link>
                        )}
                        {note.teachings?.date && (
                          <div className="text-[11px] text-[#6B5E54] mt-0.5">
                            Teaching · {note.teachings.date}
                          </div>
                        )}
                        <div className="text-[10px] text-[#8A7B65] mt-0.5">
                          Noted · {formatWhen(note.created_at)}
                        </div>
                        <p
                          className="mt-1.5 text-[13px] text-[#3F362E] leading-relaxed italic"
                          style={{ fontFamily: GARAMOND }}
                        >
                          {note.body}
                        </p>
                      </li>
                    )
                  })}
                </ul>
              )}

              {error && notes.length > 0 && (
                <p className="text-[12px] text-[#7A3E3E]">{error}</p>
              )}
            </div>

            {canCompose && (
              <div
                className="shrink-0 border-t border-[#E5DFD3] p-3 space-y-2"
                style={{ background: '#FFFEF9' }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="text-[11px] text-[#8A735A] truncate"
                    style={{ fontFamily: GARAMOND }}
                  >
                    Note on · {teachingTitle || `Teaching ${teachingNumber}`}
                  </span>
                  <button
                    type="button"
                    onClick={addNote}
                    disabled={saving || !draft.trim()}
                    className="text-[11px] px-2.5 py-1 rounded-sm bg-[#2C2522] text-[#F5F0E6] disabled:opacity-50 shrink-0"
                  >
                    {saving ? 'Saving…' : 'Add note'}
                  </button>
                </div>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={3}
                  maxLength={4000}
                  placeholder="Agreements, differences, a brief critical comment…"
                  className="w-full px-2 py-1.5 rounded-sm border border-[#C9BEB0] bg-white text-[13px] text-[#2C2522] placeholder:text-[#8A7B65] focus:outline-none resize-none"
                  style={{ fontFamily: GARAMOND }}
                />
              </div>
            )}

            {scope === 'all' && teachingNumber != null && (
              <div className="shrink-0 px-3 py-2 border-t border-[#E5DFD3] text-[11px] text-[#8A7B65] text-center">
                Switch to “This Teaching” to add a note here.
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}