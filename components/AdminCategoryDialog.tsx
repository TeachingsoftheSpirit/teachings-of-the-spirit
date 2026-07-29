'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Category = {
  id: string
  name: string
}

type TeachingInfo = {
  id: string
  teaching_number: number
  title: string
}

type Props = {
  teachingId: string
  teachingNumber: number
  teachingTitle: string
}

const ADMIN_EMAIL = 'jprussell@protonmail.com'
const REOPEN_KEY = 'admin-category-dialog-reopen'

export default function AdminCategoryDialog({
  teachingId,
  teachingNumber,
  teachingTitle,
}: Props) {
  const supabase = createClient()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [open, setOpen] = useState(false)
  const [current, setCurrent] = useState<TeachingInfo>({
    id: teachingId,
    teaching_number: teachingNumber,
    title: teachingTitle,
  })
  const [allCategories, setAllCategories] = useState<Category[]>([])
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const [pos, setPos] = useState({ x: 80, y: 80 })
  const dragging = useRef(false)
  const dragOffset = useRef({ x: 0, y: 0 })

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsAdmin(user?.email === ADMIN_EMAIL)
    })
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsAdmin(session?.user?.email === ADMIN_EMAIL)
    })
    try {
      if (sessionStorage.getItem(REOPEN_KEY) === '1') {
        sessionStorage.removeItem(REOPEN_KEY)
        setOpen(true)
      }
    } catch {
      /* ignore */
    }
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    setCurrent({
      id: teachingId,
      teaching_number: teachingNumber,
      title: teachingTitle,
    })
  }, [teachingId, teachingNumber, teachingTitle])

  useEffect(() => {
    if (!open) return
    let cancelled = false
    const load = async () => {
      setLoading(true)
      setMessage('')
      if (allCategories.length === 0) {
        const { data: cats } = await supabase
          .from('categories')
          .select('id, name')
          .order('name')
        if (!cancelled) setAllCategories(cats || [])
      }
      const { data: links } = await supabase
        .from('teaching_categories')
        .select('category_id')
        .eq('teaching_id', current.id)
      if (!cancelled) {
        setSelectedIds(new Set((links || []).map((l) => l.category_id)))
        setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [open, current.id])

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return
      setPos({
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      })
    }
    const onUp = () => {
      dragging.current = false
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [])

  const startDrag = (e: React.MouseEvent) => {
    dragging.current = true
    dragOffset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    }
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
    setSaving(true)
    setMessage('')
    await supabase
      .from('teaching_categories')
      .delete()
      .eq('teaching_id', current.id)
    if (selectedIds.size > 0) {
      const rows = Array.from(selectedIds).map((category_id) => ({
        teaching_id: current.id,
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

  const goAdjacent = async (direction: 'prev' | 'next') => {
    const targetNumber =
      direction === 'prev'
        ? current.teaching_number - 1
        : current.teaching_number + 1
    if (targetNumber < 1) return
    setLoading(true)
    setMessage('')
    const { data } = await supabase
      .from('teachings')
      .select('id, teaching_number, title, slug')
      .eq('teaching_number', targetNumber)
      .maybeSingle()
    if (!data) {
      setMessage(direction === 'prev' ? 'No previous Teaching' : 'No next Teaching')
      setLoading(false)
      return
    }
    try {
      sessionStorage.setItem(REOPEN_KEY, '1')
    } catch {
      /* ignore */
    }
    const path = data.slug
      ? `/teachings/${data.slug}`
      : `/teachings/${data.teaching_number}`
    router.push(path)
  }

  if (!isAdmin) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[12px] text-[#6B5E54] hover:text-[#2C2522] underline underline-offset-2 transition-colors"
        title="Edit categories for this Teaching"
      >
        Categories
      </button>

      {open && (
        <div
          className="fixed z-[100] bg-[#F7F4EF] border border-[#C9BEB0] rounded-lg shadow-2xl flex flex-col"
          style={{
            left: pos.x,
            top: pos.y,
            width: '420px',
            maxWidth: '90vw',
            maxHeight: '80vh',
            resize: 'both',
            overflow: 'hidden',
          }}
        >
          <div
            onMouseDown={startDrag}
            className="flex items-start justify-between gap-3 px-4 pt-3 pb-2 border-b border-[#E5DFD3] cursor-move select-none bg-[#EDE8DF]/60"
          >
            <div className="min-w-0">
              <div className="text-[11px] text-[#8A7B65]">
                #{current.teaching_number}
              </div>
              <div className="text-[14px] font-medium text-[#2C2522] leading-snug truncate">
                {current.title}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-[#8A7B65] hover:text-[#2C2522] text-lg leading-none px-1 shrink-0"
            >
              ×
            </button>
          </div>

          <div className="flex items-center justify-between px-4 py-1.5 border-b border-[#E5DFD3] text-[12px]">
            <button
              type="button"
              onClick={() => goAdjacent('prev')}
              className="text-[#6B5E54] hover:text-[#2C2522] disabled:opacity-30"
              disabled={loading || current.teaching_number <= 1}
            >
              ← Previous
            </button>
            <button
              type="button"
              onClick={() => goAdjacent('next')}
              className="text-[#6B5E54] hover:text-[#2C2522] disabled:opacity-30"
              disabled={loading}
            >
              Next →
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3">
            {loading ? (
              <div className="text-sm text-[#8A7B65]">Loading…</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3 gap-y-0.5">
                {allCategories.map((c) => (
                  <label
                    key={c.id}
                    className="flex items-center gap-2 text-[13px] text-[#2C2522] cursor-pointer hover:bg-[#EDE8DF]/60 px-1 py-0.5 rounded"
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
            )}
          </div>

          <div className="flex items-center gap-3 px-4 py-2.5 border-t border-[#E5DFD3]">
            <button
              type="button"
              onClick={save}
              disabled={saving || loading}
              className="px-3.5 py-1.5 bg-[#2C2522] text-[#F7F4EF] text-sm rounded hover:bg-[#4A3F38] transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
            {message && (
              <span className="text-sm text-[#6B5E54]">{message}</span>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="ml-auto text-sm text-[#8A7B65] hover:text-[#2C2522]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}