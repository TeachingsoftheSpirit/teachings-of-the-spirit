'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Teaching = {
  id: string
  teaching_number: number
  title: string
  date: string | null
}

type Category = {
  id: string
  name: string
}

export default function AdminCategories() {
  const supabase = createClient()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Teaching[]>([])
  const [selected, setSelected] = useState<Teaching | null>(null)
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const search = async () => {
    if (!query.trim()) return
    setLoading(true)
    setMessage('')
    setSelected(null)

    const q = query.trim()
    const isNumber = /^\d+$/.test(q)

    let request = supabase
      .from('teachings')
      .select('id, teaching_number, title, date')
      .limit(20)

    if (isNumber) {
      request = request.eq('teaching_number', parseInt(q, 10))
    } else {
      request = request.ilike('title', `%${q}%`)
    }

    const { data, error } = await request
    setLoading(false)

    if (error) {
      setMessage('Search failed')
      return
    }
    setResults(data || [])
  }

  const selectTeaching = async (t: Teaching) => {
    setSelected(t)
    setMessage('')
    setLoading(true)

    // Load all categories (once)
    if (allCategories.length === 0) {
      const { data: cats } = await supabase
        .from('categories')
        .select('id, name')
        .order('name')
      setAllCategories(cats || [])
    }

    // Load current associations for this teaching
    const { data: links } = await supabase
      .from('teaching_categories')
      .select('category_id')
      .eq('teaching_id', t.id)

    const ids = new Set((links || []).map((l) => l.category_id))
    setSelectedIds(ids)
    setLoading(false)
  }

  const toggleCategory = (categoryId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(categoryId)) next.delete(categoryId)
      else next.add(categoryId)
      return next
    })
  }

  const save = async () => {
    if (!selected) return
    setSaving(true)
    setMessage('')

    // Delete existing links for this teaching
    await supabase
      .from('teaching_categories')
      .delete()
      .eq('teaching_id', selected.id)

    // Insert the currently selected ones
    if (selectedIds.size > 0) {
      const rows = Array.from(selectedIds).map((category_id) => ({
        teaching_id: selected.id,
        category_id,
      }))
      const { error } = await supabase
        .from('teaching_categories')
        .insert(rows)

      if (error) {
        setMessage('Save failed')
        setSaving(false)
        return
      }
    }

    setSaving(false)
    setMessage('Saved')
  }

  return (
    <section className="mb-12 p-6 rounded-xl border border-[#E5DFD3] bg-white/50">
      <h2 className="text-lg font-medium text-[#2C2522] mb-1">Categories</h2>
      <p className="text-sm text-[#8A7B65] mb-5">
        Search for a Teaching, then assign or remove house categories.
      </p>

      {/* Search */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()}
          placeholder="Teaching number or title words…"
          className="flex-1 px-3 py-2 rounded border border-[#D4CBBF] bg-white text-[#2C2522] text-sm focus:outline-none focus:border-[#7A3E3E]"
        />
        <button
          type="button"
          onClick={search}
          disabled={loading}
          className="px-4 py-2 bg-[#2C2522] text-[#F7F4EF] text-sm rounded hover:bg-[#4A3F38] transition-colors disabled:opacity-50"
        >
          {loading ? '…' : 'Search'}
        </button>
      </div>

      {/* Results list */}
      {results.length > 0 && !selected && (
        <ul className="mb-6 space-y-1 max-h-48 overflow-y-auto border border-[#EDE8DF] rounded">
          {results.map((t) => (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => selectTeaching(t)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-[#F7F4EF] transition-colors"
              >
                <span className="text-[#8A7B65] tabular-nums mr-3">
                  {t.teaching_number}
                </span>
                <span className="text-[#2C2522]">{t.title}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Selected teaching + category checkboxes */}
      {selected && (
        <div>
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <div className="text-sm text-[#8A7B65]">
                #{selected.teaching_number}
                {selected.date ? ` · ${selected.date}` : ''}
              </div>
              <div className="text-[#2C2522] font-medium">{selected.title}</div>
            </div>
            <button
              type="button"
              onClick={() => {
                setSelected(null)
                setResults([])
                setMessage('')
              }}
              className="text-xs text-[#8A7B65] hover:text-[#2C2522]"
            >
              Clear
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 max-h-64 overflow-y-auto mb-4 pr-1">
            {allCategories.map((c) => (
              <label
                key={c.id}
                className="flex items-center gap-2 text-sm text-[#2C2522] cursor-pointer hover:bg-[#F7F4EF] px-1 py-0.5 rounded"
              >
                <input
                  type="checkbox"
                  checked={selectedIds.has(c.id)}
                  onChange={() => toggleCategory(c.id)}
                  className="rounded border-[#C9BEB0]"
                />
                {c.name}
              </label>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="px-4 py-2 bg-[#2C2522] text-[#F7F4EF] text-sm rounded hover:bg-[#4A3F38] transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save categories'}
            </button>
            {message && (
              <span className="text-sm text-[#6B5E54]">{message}</span>
            )}
          </div>
        </div>
      )}
    </section>
  )
}