'use client'

import { useEffect, useState } from 'react'

type Letter = {
  id: string
  from_email: string
  from_username: string | null
  body: string
  teaching_number: number | null
  rumination_slug: string | null
  created_at: string
  read_at: string | null
  reply_body: string | null
  replied_at: string | null
}

export default function AdminLetters() {
  const [letters, setLetters] = useState<Letter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({})
  const [savingId, setSavingId] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string>('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/admin/letters')
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'Could not load letters')
        setLetters(data.letters || [])
      } catch (err: any) {
        setError(err.message || 'Could not load letters')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleReplyChange = (id: string, value: string) => {
    setReplyDrafts((prev) => ({ ...prev, [id]: value }))
  }

  const handleSendReply = async (letterId: string) => {
    const text = (replyDrafts[letterId] || '').trim()
    if (!text) return

    setSavingId(letterId)
    setSaveError('')

    try {
      const res = await fetch('/api/admin/letters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ letterId, replyBody: text }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not save reply')

      setLetters((prev) =>
        prev.map((l) =>
          l.id === letterId
            ? {
                ...l,
                reply_body: data.letter.reply_body,
                replied_at: data.letter.replied_at,
                read_at: data.letter.replied_at,
              }
            : l
        )
      )
      setReplyDrafts((prev) => {
        const next = { ...prev }
        delete next[letterId]
        return next
      })
    } catch (err: any) {
      setSaveError(err.message || 'Could not save reply')
    } finally {
      setSavingId(null)
    }
  }

  return (
    <section className="mb-12 p-6 rounded-xl border border-[#E5DFD3] bg-white/50">
      <h2 className="text-lg font-medium text-[#2C2522] mb-1">Letters to the house</h2>
      <p className="text-[14px] text-[#6B5E54] mb-5">
        Correspondence left at the desk. You may answer once.
      </p>

      {loading && <p className="text-sm text-[#6B5E54]">Loading…</p>}
      {error && <p className="text-sm text-red-700">{error}</p>}
      {saveError && <p className="text-sm text-red-700 mb-3">{saveError}</p>}

      {!loading && !error && letters.length === 0 && (
        <p className="text-[15px] text-[#6B5E54]">No letters yet.</p>
      )}

      {!loading && letters.length > 0 && (
        <ul className="space-y-6">
          {letters.map((letter) => (
            <li
              key={letter.id}
              className="rounded-lg border border-[#E5DFD3] bg-[#F7F4EF]/60 px-4 py-4 text-[14px]"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
                <div className="text-[#2C2522] font-medium">
                  {letter.from_username || letter.from_email}
                  {letter.from_username && (
                    <span className="font-normal text-[#6B5E54]">
                      {' '}
                      · {letter.from_email}
                    </span>
                  )}
                </div>
                <div className="text-[12px] text-[#8A7B65]">
                  {new Date(letter.created_at).toLocaleString()}
                </div>
              </div>

              {letter.teaching_number != null && (
                <div className="text-[12px] text-[#8A7B65] mb-1">
                  Re: Teaching #{letter.teaching_number}
                </div>
              )}
              {letter.rumination_slug && (
                <div className="text-[12px] text-[#8A7B65] mb-2">
                  Re: {letter.rumination_slug}
                </div>
              )}

              <p className="text-[#2C2522] leading-relaxed whitespace-pre-wrap mb-4">
                {letter.body}
              </p>

              {letter.reply_body ? (
                <div className="mt-3 pt-3 border-t border-[#E5DFD3]">
                  <div className="text-[12px] text-[#8A7B65] mb-1">
                    Reply sent {letter.replied_at ? new Date(letter.replied_at).toLocaleString() : ''}
                  </div>
                  <p className="text-[#2C2522] leading-relaxed whitespace-pre-wrap">
                    {letter.reply_body}
                  </p>
                </div>
              ) : (
                <div className="mt-3 pt-3 border-t border-[#E5DFD3]">
                  <textarea
                    value={replyDrafts[letter.id] || ''}
                    onChange={(e) => handleReplyChange(letter.id, e.target.value)}
                    placeholder="Write a quiet reply…"
                    rows={4}
                    className="w-full rounded-md border border-[#E5DFD3] bg-white px-3 py-2 text-[14px] text-[#2C2522] placeholder:text-[#8A7B65] focus:outline-none focus:ring-1 focus:ring-[#C4B8A5]"
                  />
                  <div className="mt-2 flex justify-end">
                    <button
                      type="button"
                      disabled={savingId === letter.id || !(replyDrafts[letter.id] || '').trim()}
                      onClick={() => handleSendReply(letter.id)}
                      className="text-sm px-4 py-1.5 rounded-md bg-[#2C2522] text-[#F7F4EF] disabled:opacity-40 hover:bg-[#3d342f] transition-colors"
                    >
                      {savingId === letter.id ? 'Sending…' : 'Send reply'}
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}