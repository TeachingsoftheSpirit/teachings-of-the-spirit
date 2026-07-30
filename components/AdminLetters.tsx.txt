'use client'

import { useEffect, useState } from 'react'

type Letter = {
  id: string
  from_email: string
  from_username: string | null
  body: string
  teaching_number: number | null
  created_at: string
  read_at: string | null
}

export default function AdminLetters() {
  const [letters, setLetters] = useState<Letter[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

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

  return (
    <section className="mb-12 p-6 rounded-xl border border-[#E5DFD3] bg-white/50">
      <h2 className="text-lg font-medium text-[#2C2522] mb-1">Letters to the house</h2>
      <p className="text-[14px] text-[#6B5E54] mb-5">
        Correspondence left at the desk from Special Collections.
      </p>

      {loading && (
        <p className="text-sm text-[#6B5E54]">Loading…</p>
      )}
      {error && <p className="text-sm text-red-700">{error}</p>}

      {!loading && !error && letters.length === 0 && (
        <p className="text-[15px] text-[#6B5E54]">No letters yet.</p>
      )}

      {!loading && letters.length > 0 && (
        <ul className="space-y-4">
          {letters.map((letter) => (
            <li
              key={letter.id}
              className="rounded-lg border border-[#E5DFD3] bg-[#F7F4EF]/60 px-4 py-3 text-[14px]"
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
                <div className="text-[12px] text-[#8A7B65] mb-2">
                  Re: Teaching #{letter.teaching_number}
                </div>
              )}
              <p className="text-[#2C2522] leading-relaxed whitespace-pre-wrap">
                {letter.body}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}