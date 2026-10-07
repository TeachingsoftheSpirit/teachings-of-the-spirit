'use client'

import { useState } from 'react'
import Link from 'next/link'

type Hit = {
  teaching_number: number
  title: string
  slug: string
}

type Teaching = Hit & {
  full_text: string
  closing_phrase: string | null
  end_time: string | null
}

export default function AdminTeachingEditor() {
  const [query, setQuery] = useState('')
  const [hits, setHits] = useState<Hit[]>([])
  const [teaching, setTeaching] = useState<Teaching | null>(null)
  const [title, setTitle] = useState('')
  const [fullText, setFullText] = useState('')
  const [closing, setClosing] = useState('')
  const [endTime, setEndTime] = useState('')
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)

  async function search() {
    const q = query.trim()
    if (!q) return
    setBusy(true)
    setStatus('')
    setHits([])
    try {
      const res = await fetch(`/api/admin/teachings?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      if (!res.ok) {
        setStatus(data.error || 'Search failed')
        return
      }
      const rows = (data || []) as Hit[]
      setHits(rows)
      if (rows.length === 1) {
        await openTeaching(rows[0].teaching_number)
      } else if (rows.length === 0) {
        setStatus('No Teaching found')
      }
    } catch {
      setStatus('Search failed')
    } finally {
      setBusy(false)
    }
  }

  async function openTeaching(n: number) {
    setBusy(true)
    setStatus('')
    try {
      const res = await fetch(`/api/admin/teachings?n=${n}`)
      const data = await res.json()
      if (!res.ok) {
        setStatus(data.error || 'Could not open Teaching')
        return
      }
      const row = data as Teaching
      setTeaching(row)
      setTitle(row.title || '')
      setFullText(row.full_text || '')
      setClosing(row.closing_phrase || '')
      setEndTime(row.end_time || '')
      setHits([])
    } catch {
      setStatus('Could not open Teaching')
    } finally {
      setBusy(false)
    }
  }

  async function save() {
    if (!teaching) return
    if (!title.trim() || !fullText.trim()) {
      setStatus('Title and body cannot be empty')
      return
    }
    setBusy(true)
    setStatus('Saving...')
    try {
      const res = await fetch('/api/admin/teachings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teaching_number: teaching.teaching_number,
          title: title.trim(),
          full_text: fullText,
          closing_phrase: closing.trim() || null,
          end_time: endTime.trim() || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus(data.error || 'Save failed')
        return
      }
      setStatus(data.warning ? `Saved. ${data.warning}` : 'Saved')
    } catch {
      setStatus('Save failed')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="mb-12 p-6 rounded-xl border border-[#E5DFD3] bg-white/50">
      <h2 className="text-lg font-medium text-[#2C2522] mb-1">Teaching editor</h2>
      <p className="text-[12px] text-[#8A7B65] mb-4 leading-relaxed">
        Critical admin only. A save writes the live Teaching. One Teaching at a time.
      </p>

      <div className="flex gap-2 mb-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') search()
          }}
          placeholder="Number or title"
          className="flex-1 px-3 py-2 rounded border border-[#D4CBBF] bg-white text-[15px] text-[#2C2522] focus:outline-none focus:border-[#7A3E3E]"
        />
        <button
          type="button"
          onClick={search}
          disabled={busy}
          className="px-4 py-2 rounded bg-[#2C2522] text-[#F7F4EF] text-sm disabled:opacity-50"
        >
          Find
        </button>
      </div>

      {hits.length > 1 && (
        <ul className="mb-4 border border-[#E5DFD3] rounded divide-y divide-[#E5DFD3]">
          {hits.map((hit) => (
            <li key={hit.teaching_number}>
              <button
                type="button"
                onClick={() => openTeaching(hit.teaching_number)}
                className="w-full text-left px-3 py-2 text-[14px] text-[#2C2522] hover:bg-[#F7F4EF]"
              >
                {hit.teaching_number} · {hit.title}
              </button>
            </li>
          ))}
        </ul>
      )}

      {teaching && (
        <div className="space-y-3">
          <p className="text-[13px] text-[#6B5E54]">
            {teaching.teaching_number} · {teaching.slug}{' '}
            <Link
              href={`/teachings/${teaching.slug}`}
              className="underline underline-offset-2"
            >
              Open
            </Link>
          </p>
          <label className="block text-[12px] text-[#8A7B65]">
            Title
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded border border-[#D4CBBF] bg-white text-[15px] text-[#2C2522] focus:outline-none focus:border-[#7A3E3E]"
            />
          </label>
          <label className="block text-[12px] text-[#8A7B65]">
            Body
            <textarea
              value={fullText}
              onChange={(e) => setFullText(e.target.value)}
              rows={18}
              className="mt-1 w-full px-3 py-2 rounded border border-[#D4CBBF] bg-white text-[15px] leading-7 text-[#2C2522] focus:outline-none focus:border-[#7A3E3E]"
            />
          </label>
          <label className="block text-[12px] text-[#8A7B65]">
            Closing phrase
            <input
              value={closing}
              onChange={(e) => setClosing(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded border border-[#D4CBBF] bg-white text-[15px] text-[#2C2522] focus:outline-none focus:border-[#7A3E3E]"
            />
          </label>
          <label className="block text-[12px] text-[#8A7B65]">
            End time
            <input
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="mt-1 w-full px-3 py-2 rounded border border-[#D4CBBF] bg-white text-[15px] text-[#2C2522] focus:outline-none focus:border-[#7A3E3E]"
            />
          </label>
          <button
            type="button"
            onClick={save}
            disabled={busy}
            className="px-4 py-2 rounded bg-[#7A3E3E] text-[#F7F4EF] text-sm disabled:opacity-50"
          >
            Save this Teaching
          </button>
        </div>
      )}

      {status && <p className="mt-3 text-[13px] text-[#6B5E54]">{status}</p>}
    </section>
  )
}