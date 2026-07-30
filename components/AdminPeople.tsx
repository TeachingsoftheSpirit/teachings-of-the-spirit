'use client'

import { useEffect, useState, useTransition } from 'react'

type Person = {
  email: string
  subscription_status: string | null
  billing_interval: string | null
  admin_level: string | null
}

type AdminLevelValue = '' | 'maintenance' | 'critical'

async function fetchAdmins(): Promise<Person[]> {
  const res = await fetch('/api/admin/people?admins=1')
  if (!res.ok) throw new Error('Failed to load admins')
  return res.json()
}

async function searchPeople(q: string): Promise<Person[]> {
  const res = await fetch(`/api/admin/people?q=${encodeURIComponent(q)}`)
  if (!res.ok) throw new Error('Search failed')
  return res.json()
}

async function updateAdminLevel(email: string, admin_level: AdminLevelValue) {
  const res = await fetch('/api/admin/people', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, admin_level: admin_level || null }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || 'Update failed')
  }
}

export default function AdminPeople() {
  const [admins, setAdmins] = useState<Person[]>([])
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Person[]>([])
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()
  const [savingEmail, setSavingEmail] = useState<string | null>(null)

  const loadAdmins = () => {
    fetchAdmins()
      .then(setAdmins)
      .catch((err) => setError(err.message))
  }

  useEffect(() => {
    loadAdmins()
  }, [])

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }
    const t = setTimeout(() => {
      searchPeople(query.trim())
        .then(setResults)
        .catch((err) => setError(err.message))
    }, 250)
    return () => clearTimeout(t)
  }, [query])

  const onChange = (email: string, value: AdminLevelValue) => {
    setSavingEmail(email)
    setError(null)
    startTransition(async () => {
      try {
        await updateAdminLevel(email, value)
        loadAdmins()
        setResults((prev) =>
          prev.map((p) =>
            p.email === email ? { ...p, admin_level: value || null } : p
          )
        )
      } catch (err: any) {
        setError(err.message || 'Update failed')
      } finally {
        setSavingEmail(null)
      }
    })
  }

  return (
    <section className="mb-12 p-6 rounded-xl border border-[#E5DFD3] bg-white/50">
      <h2 className="text-lg font-medium text-[#2C2522] mb-1">People & Admin levels</h2>
      <p className="text-[13px] text-[#8A7B65] mb-4">
        Only critical admins can change these. Maintenance = routine tools. Critical = full power.
      </p>

      {error && <p className="mb-3 text-sm text-red-700">{error}</p>}

      {/* Current admins — compact */}
      <div className="mb-5">
        <div className="text-[11px] uppercase tracking-wide text-[#8A7B65] mb-1.5">
          Current admins
        </div>
        {admins.length === 0 ? (
          <p className="text-[12px] text-[#8A7B65]">None yet</p>
        ) : (
          <ul className="space-y-0.5">
            {admins.map((a) => (
              <li key={a.email} className="text-[12px] text-[#6B5E54]">
                <span className="text-[#2C2522]">{a.email}</span>
                <span className="text-[#8A7B65]"> · {a.admin_level}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Search to change levels */}
      <div className="text-[11px] uppercase tracking-wide text-[#8A7B65] mb-1.5">
        Find a person
      </div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Type part of an email…"
        className="w-full max-w-md px-3 py-2 text-[14px] border border-[#D4CBBF] rounded bg-white text-[#2C2522] focus:outline-none focus:border-[#7A3E3E] mb-3"
      />

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((p) => (
            <div
              key={p.email}
              className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 py-1.5"
            >
              <div className="flex-1 min-w-0">
                <div className="text-[13px] text-[#2C2522] truncate">{p.email}</div>
                <div className="text-[11px] text-[#8A7B65]">
                  {p.subscription_status || 'magic'}
                  {p.billing_interval ? ` · ${p.billing_interval}` : ''}
                  {p.admin_level ? ` · ${p.admin_level}` : ''}
                </div>
              </div>
              <select
                className="text-[13px] border border-[#D4CBBF] rounded px-2 py-1.5 bg-white text-[#2C2522] disabled:opacity-50"
                value={p.admin_level || ''}
                disabled={pending && savingEmail === p.email}
                onChange={(e) =>
                  onChange(p.email, e.target.value as AdminLevelValue)
                }
              >
                <option value="">None</option>
                <option value="maintenance">Maintenance</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}