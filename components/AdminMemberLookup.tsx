'use client'

import { useEffect, useState } from 'react'

type Member = {
  id: string
  email: string | null
  username: string | null
  subscription_status: string | null
  billing_interval: string | null
  stripe_customer_id: string | null
  access_ends_at?: string | null
  created_at?: string | null
  admin_note?: string | null
  admin_note_at?: string | null
}

function labelTier(status: string | null) {
  if (!status) return 'Magic Link / free key (no paid tier)'
  if (status === 'house_brew') return 'House Brew'
  if (status === 'private_reserve') return 'Private Reserve'
  if (status === 'canceled' || status === 'cancelled') return 'Canceled'
  return status
}

function memberLabel(m: Member) {
  const email = m.email || 'no-email'
  const user = m.username && m.username !== m.email ? ` · ${m.username}` : ''
  const tier = m.subscription_status ? ` · ${labelTier(m.subscription_status)}` : ''
  return `${email}${user}${tier}`
}

export default function AdminMemberLookup() {
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(false)
  const [listLoading, setListLoading] = useState(true)
  const [error, setError] = useState('')
  const [allMembers, setAllMembers] = useState<Member[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [results, setResults] = useState<Member[] | null>(null)

  // Override form state
  const [tier, setTier] = useState('')
  const [interval, setInterval] = useState('')
  const [note, setNote] = useState('')
  const [clearAccess, setClearAccess] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  const loadList = async () => {
    setListLoading(true)
    try {
      const res = await fetch('/api/admin/members')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not load members')
      setAllMembers(data.members || [])
    } catch (err: any) {
      setError(err.message || 'Could not load members')
    } finally {
      setListLoading(false)
    }
  }

  useEffect(() => {
    loadList()
  }, [])

  const applyMemberToForm = (m: Member) => {
    setTier(m.subscription_status || '')
    setInterval(m.billing_interval || '')
    setNote(m.admin_note || '')
    setClearAccess(false)
    setSaveMsg('')
  }

  const showMember = (m: Member) => {
    setResults([m])
    setSelectedId(m.id)
    applyMemberToForm(m)
  }

  const onPickFromList = (id: string) => {
    setSelectedId(id)
    const m = allMembers.find((x) => x.id === id)
    if (m) {
      setResults([m])
      applyMemberToForm(m)
    }
  }

  const search = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResults(null)
    setSaveMsg('')
    try {
      const res = await fetch(
        `/api/admin/lookup?q=${encodeURIComponent(q.trim())}`
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Lookup failed')
      const list: Member[] = data.members || []
      setResults(list)
      if (list.length === 1) {
        setSelectedId(list[0].id)
        applyMemberToForm(list[0])
      } else {
        setSelectedId('')
      }
    } catch (err: any) {
      setError(err.message || 'Lookup failed')
    } finally {
      setLoading(false)
    }
  }

  const saveOverride = async (profileId: string) => {
    setSaving(true)
    setSaveMsg('')
    setError('')
    try {
      const res = await fetch('/api/admin/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile_id: profileId,
          subscription_status: tier || null,
          billing_interval: interval || null,
          admin_note: note.trim() || undefined,
          clear_access_ends: clearAccess,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Override failed')
      const updated: Member = data.member
      setResults([updated])
      setAllMembers((prev) =>
        prev.map((m) => (m.id === updated.id ? { ...m, ...updated } : m))
      )
      applyMemberToForm(updated)
      setSaveMsg('Saved.')
    } catch (err: any) {
      setError(err.message || 'Override failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="mb-12 p-6 rounded-xl border border-[#E5DFD3] bg-white/50">
      <h2 className="text-lg font-medium text-[#2C2522] mb-1">Member lookup</h2>
      <p className="text-[14px] text-[#6B5E54] mb-5">
        Choose from the full list (up to 200 newest) or search by email / username.
        Override is for support and comps only — billing still lives in Stripe.
      </p>

      <div className="mb-5">
        <label className="block text-sm text-[#6B5E54] mb-1.5">
          All members
          {listLoading ? ' (loading…)' : ` (${allMembers.length})`}
        </label>
        <select
          value={selectedId}
          onChange={(e) => onPickFromList(e.target.value)}
          disabled={listLoading || allMembers.length === 0}
          className="w-full px-4 py-2.5 rounded-lg border border-[#E5DFD3] bg-white text-[#2C2522] focus:outline-none focus:ring-2 focus:ring-[#C9BEB0] disabled:opacity-60"
        >
          <option value="">
            {listLoading ? 'Loading…' : 'Select a member…'}
          </option>
          {allMembers.map((m) => (
            <option key={m.id} value={m.id}>
              {memberLabel(m)}
            </option>
          ))}
        </select>
      </div>

      <form onSubmit={search} className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="email or username"
          className="flex-1 px-4 py-2.5 rounded-lg border border-[#E5DFD3] bg-white text-[#2C2522] focus:outline-none focus:ring-2 focus:ring-[#C9BEB0]"
        />
        <button
          type="submit"
          disabled={loading || q.trim().length < 2}
          className="px-5 py-2.5 rounded-lg bg-[#2C2522] text-[#F7F4EF] text-sm hover:bg-[#3d342f] transition-colors disabled:opacity-60"
        >
          {loading ? 'Searching…' : 'Search'}
        </button>
      </form>

      {error && <p className="text-sm text-red-700 mb-4">{error}</p>}

      {results && results.length === 0 && (
        <p className="text-[15px] text-[#6B5E54]">No profiles matched.</p>
      )}

      {results && results.length > 0 && (
        <ul className="space-y-4">
          {results.map((m) => (
            <li
              key={m.id}
              className="rounded-lg border border-[#E5DFD3] bg-[#F7F4EF]/60 px-4 py-4 text-[14px] text-[#2C2522]"
            >
              <div className="font-medium text-[15px] mb-2">
                {m.email || '—'}
                {m.username && m.username !== m.email ? (
                  <span className="text-[#6B5E54] font-normal">
                    {' '}
                    · {m.username}
                  </span>
                ) : null}
              </div>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-[#6B5E54] mb-4">
                <div>
                  <span className="text-[#8A7B65]">Tier: </span>
                  {labelTier(m.subscription_status)}
                </div>
                <div>
                  <span className="text-[#8A7B65]">Interval: </span>
                  {m.billing_interval || '—'}
                </div>
                <div>
                  <span className="text-[#8A7B65]">Access ends: </span>
                  {m.access_ends_at
                    ? new Date(m.access_ends_at).toLocaleString()
                    : '—'}
                </div>
                <div>
                  <span className="text-[#8A7B65]">Stripe customer: </span>
                  {m.stripe_customer_id ? (
                    <a
                      href={`https://dashboard.stripe.com/customers/${m.stripe_customer_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline underline-offset-2 hover:text-[#2C2522]"
                    >
                      {m.stripe_customer_id}
                    </a>
                  ) : (
                    '—'
                  )}
                </div>
                {m.created_at && (
                  <div className="sm:col-span-2">
                    <span className="text-[#8A7B65]">Profile created: </span>
                    {new Date(m.created_at).toLocaleString()}
                  </div>
                )}
                {m.admin_note && (
                  <div className="sm:col-span-2">
                    <span className="text-[#8A7B65]">Last note: </span>
                    {m.admin_note}
                    {m.admin_note_at
                      ? ` (${new Date(m.admin_note_at).toLocaleString()})`
                      : ''}
                  </div>
                )}
              </dl>

              {/* Override — only when a single member is in focus */}
              {results.length === 1 && (
                <div className="border-t border-[#E5DFD3] pt-4 mt-2 space-y-3">
                  <p className="text-[13px] text-[#8A7B65]">
                    Manual override (does not change Stripe billing)
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-[#8A7B65] mb-1">
                        Tier
                      </label>
                      <select
                        value={tier}
                        onChange={(e) => setTier(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[#E5DFD3] bg-white text-[#2C2522] text-sm"
                      >
                        <option value="">Magic Link only</option>
                        <option value="house_brew">House Brew</option>
                        <option value="private_reserve">Private Reserve</option>
                        <option value="canceled">Canceled</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-[#8A7B65] mb-1">
                        Interval
                      </label>
                      <select
                        value={interval}
                        onChange={(e) => setInterval(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-[#E5DFD3] bg-white text-[#2C2522] text-sm"
                      >
                        <option value="">—</option>
                        <option value="monthly">Monthly</option>
                        <option value="annual">Annual</option>
                      </select>
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-sm text-[#6B5E54]">
                    <input
                      type="checkbox"
                      checked={clearAccess}
                      onChange={(e) => setClearAccess(e.target.checked)}
                    />
                    Clear “access ends” date
                  </label>
                  <div>
                    <label className="block text-xs text-[#8A7B65] mb-1">
                      Note (optional)
                    </label>
                    <input
                      type="text"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="e.g. Comped through August — JP"
                      className="w-full px-3 py-2 rounded-lg border border-[#E5DFD3] bg-white text-[#2C2522] text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => saveOverride(m.id)}
                      className="px-4 py-2 rounded-lg bg-[#2C2522] text-[#F7F4EF] text-sm hover:bg-[#3d342f] transition-colors disabled:opacity-60"
                    >
                      {saving ? 'Saving…' : 'Save override'}
                    </button>
                    {saveMsg && (
                      <span className="text-sm text-green-700">{saveMsg}</span>
                    )}
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