'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'

export type DeskContext = {
  teachingNumber?: number | null
  teachingTitle?: string | null
}

type Props = {
  isOpen: boolean
  onClose: () => void
  context?: DeskContext | null
}

type Category = {
  id: string
  name: string
  sort_order: number
  created_at: string
  item_count: number
}

type CategoryItem = {
  id: string
  teaching_number: number
  sort_order: number
  note: string | null
  created_at: string
  teachings: { title: string; date: string } | null
}

type SavedItem = {
  id: string
  teaching_number: number
  memo: string | null
  created_at: string
  teachings: { title: string; date: string } | null
}

type MarginNote = {
  id: string
  teaching_number: number
  body: string
  created_at: string
}

const STORAGE_KEY = 'tot-desk-state'
const DESK_OPEN_KEY = 'tot-desk-open'
const DEFAULT_WIDTH = 720
const MIN_WIDTH = 300
const MAX_WIDTH = 960
const BOOKS_PER_SHELF = 7

const SPINE_PALETTE = [
  { bg: '#EDE6DC', fg: '#2C2522', edge: '#C4B8A4' },
  { bg: '#E0D5C4', fg: '#2C2522', edge: '#B8A990' },
  { bg: '#F2EBE0', fg: '#2C2522', edge: '#C9BEB0' },
  { bg: '#D9CDB8', fg: '#2C2522', edge: '#A89880' },
  { bg: '#E8DFD0', fg: '#2C2522', edge: '#BFAF9A' },
  { bg: '#F5F0E6', fg: '#2C2522', edge: '#D0C6B8' },
  { bg: '#DDD2C0', fg: '#2C2522', edge: '#B8A990' },
  { bg: '#EAE2D4', fg: '#2C2522', edge: '#C9BEB0' },
]

const GARAMOND =
  '"EB Garamond", Garamond, "Palatino Linotype", Palatino, "Times New Roman", serif'

type SavedDesk = {
  x: number
  y: number
  width: number
  mode: 'active' | 'parked'
  openId: string | null
}

function loadSaved(): SavedDesk | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as SavedDesk
  } catch {
    return null
  }
}

function saveState(s: SavedDesk) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch {
    /* ignore */
  }
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

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

export default function DeskOverlay({ isOpen, onClose, context }: Props) {
  const [handNumber, setHandNumber] = useState<number | null>(null)
  const [handTitle, setHandTitle] = useState<string | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [savedList, setSavedList] = useState<SavedItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingSaved, setLoadingSaved] = useState(false)
  const [error, setError] = useState('')
  const [openId, setOpenId] = useState<string | null>(null)
  const [items, setItems] = useState<CategoryItem[]>([])
  const [itemsLoading, setItemsLoading] = useState(false)
  const [addingId, setAddingId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [showSaved, setShowSaved] = useState(false)
  const [marginNum, setMarginNum] = useState<number | null>(null)
  const [marginTitle, setMarginTitle] = useState<string | null>(null)
  const [marginNotes, setMarginNotes] = useState<MarginNote[]>([])
  const [marginDraft, setMarginDraft] = useState('')
  const [marginLoading, setMarginLoading] = useState(false)
  const [marginSaving, setMarginSaving] = useState(false)
  const [mode, setMode] = useState<'active' | 'parked'>('active')
  const [position, setPosition] = useState({ x: 40, y: 40 })
  const [width, setWidth] = useState(DEFAULT_WIDTH)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const resizeStart = useRef({ x: 0, width: DEFAULT_WIDTH })
  const panelRef = useRef<HTMLDivElement>(null)
  const hydrated = useRef(false)
  const lastWidth = useRef(DEFAULT_WIDTH)

  useEffect(() => {
    if (
      context?.teachingNumber != null &&
      Number.isFinite(context.teachingNumber)
    ) {
      setHandNumber(context.teachingNumber)
      setHandTitle(context.teachingTitle ?? null)
      setMode('active')
    }
  }, [context?.teachingNumber, context?.teachingTitle])

  useEffect(() => {
    if (!isOpen) {
      hydrated.current = false
      return
    }
    try {
      sessionStorage.setItem(DESK_OPEN_KEY, '1')
    } catch {
      /* ignore */
    }
    const saved = loadSaved()
    if (saved) {
      setPosition({ x: saved.x, y: saved.y })
      const w = Math.min(
        MAX_WIDTH,
        Math.max(MIN_WIDTH, saved.width || DEFAULT_WIDTH)
      )
      setWidth(w)
      lastWidth.current = w
      setMode(saved.mode === 'parked' ? 'parked' : 'active')
      setOpenId(saved.openId)
    } else if (typeof window !== 'undefined') {
      const w = Math.min(DEFAULT_WIDTH, window.innerWidth - 40)
      setWidth(w)
      lastWidth.current = w
      setPosition({
        x: Math.max(16, (window.innerWidth - w) / 2),
        y: Math.max(24, 64),
      })
      setMode('active')
    }
    hydrated.current = true
    loadCategories()
    loadSavedTeachings()
  }, [isOpen])

  useEffect(() => {
    if (!isOpen || !hydrated.current) return
    saveState({
      x: position.x,
      y: position.y,
      width,
      mode,
      openId,
    })
  }, [isOpen, position, width, mode, openId])

  useEffect(() => {
    if (!isOpen || !openId) return
    loadItems(openId)
  }, [isOpen, openId])

  useEffect(() => {
    if (!isOpen || mode !== 'active') return
    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const el = panelRef.current
      if (!el) return
      const target = (e as MouseEvent).target || (e as TouchEvent).target
      if (el.contains(target as Node)) return
      lastWidth.current = width
      setMode('parked')
      setShowNew(false)
      setPendingDeleteId(null)
    }
    const t = window.setTimeout(() => {
      document.addEventListener('mousedown', onPointerDown)
      document.addEventListener('touchstart', onPointerDown, { passive: true })
    }, 0)
    return () => {
      window.clearTimeout(t)
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
    }
  }, [isOpen, mode, width])

  const loadCategories = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/categories')
      if (!res.ok) throw new Error('Could not load volumes')
      const data = await res.json()
      setCategories(data.categories || [])
    } catch (err: any) {
      setError(err.message || 'Could not load volumes')
    } finally {
      setLoading(false)
    }
  }

  const loadSavedTeachings = async () => {
    setLoadingSaved(true)
    try {
      const res = await fetch('/api/saved-teachings')
      if (!res.ok) {
        setSavedList([])
        return
      }
      const data = await res.json()
      setSavedList(data.saved || [])
    } catch {
      setSavedList([])
    } finally {
      setLoadingSaved(false)
    }
  }

  const loadItems = async (id: string) => {
    setItemsLoading(true)
    try {
      const res = await fetch(`/api/categories/${id}`)
      if (!res.ok) throw new Error('Could not open volume')
      const data = await res.json()
      setItems(data.items || [])
    } catch (err: any) {
      setError(err.message || 'Could not open volume')
      setItems([])
    } finally {
      setItemsLoading(false)
    }
  }

  const loadMarginNotes = async (teachingNumber: number) => {
    setMarginLoading(true)
    try {
      const res = await fetch(
        `/api/marginalia?teaching_number=${teachingNumber}`
      )
      if (!res.ok) throw new Error('Could not load Marginalia')
      const data = await res.json()
      setMarginNotes(data.notes || [])
    } catch (err: any) {
      setError(err.message || 'Could not load Marginalia')
      setMarginNotes([])
    } finally {
      setMarginLoading(false)
    }
  }

  const beginDragAt = (clientX: number, clientY: number) => {
    setIsDragging(true)
    dragStart.current = {
      x: clientX - position.x,
      y: clientY - position.y,
    }
  }

  const tryBeginDrag = (target: EventTarget | null, clientX: number, clientY: number) => {
    const t = target as HTMLElement
    if (!t) return
    if (t.closest('[data-no-drag]')) return
    if (mode === 'active' && !t.closest('[data-desk-drag]')) return
    beginDragAt(clientX, clientY)
  }

  const beginResizeAt = (clientX: number) => {
    setIsResizing(true)
    resizeStart.current = { x: clientX, width }
  }

  useEffect(() => {
    if (!isDragging) return
    const onMove = (clientX: number, clientY: number) => {
      setPosition({
        x: clientX - dragStart.current.x,
        y: clientY - dragStart.current.y,
      })
    }
    const onMouseMove = (e: MouseEvent) => onMove(e.clientX, e.clientY)
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        e.preventDefault()
        onMove(e.touches[0].clientX, e.touches[0].clientY)
      }
    }
    const onUp = () => setIsDragging(false)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onUp)
    window.addEventListener('touchcancel', onUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onUp)
      window.removeEventListener('touchcancel', onUp)
    }
  }, [isDragging])

  useEffect(() => {
    if (!isResizing) return
    const onMove = (clientX: number) => {
      const dx = clientX - resizeStart.current.x
      const next = Math.min(
        MAX_WIDTH,
        Math.max(MIN_WIDTH, resizeStart.current.width + dx)
      )
      setWidth(next)
      lastWidth.current = next
    }
    const onMouseMove = (e: MouseEvent) => onMove(e.clientX)
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        e.preventDefault()
        onMove(e.touches[0].clientX)
      }
    }
    const onUp = () => setIsResizing(false)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onUp)
    window.addEventListener('touchcancel', onUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onUp)
      window.removeEventListener('touchcancel', onUp)
    }
  }, [isResizing])

  const activate = () => {
    if (mode === 'parked') {
      setWidth(lastWidth.current || DEFAULT_WIDTH)
      setMode('active')
    }
  }

  const toggleShrink = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    if (mode === 'active') {
      lastWidth.current = width
      setMode('parked')
      setShowNew(false)
      setPendingDeleteId(null)
    } else {
      setWidth(lastWidth.current || DEFAULT_WIDTH)
      setMode('active')
    }
  }

  const handleClose = () => {
    try {
      sessionStorage.removeItem(DESK_OPEN_KEY)
    } catch {
      /* ignore */
    }
    onClose()
  }

  const handleCreate = async () => {
    const name = newName.trim()
    if (!name || creating) return
    setCreating(true)
    setError('')
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not create')
      setNewName('')
      setShowNew(false)
      setCategories((prev) => [...prev, data.category])
    } catch (err: any) {
      setError(err.message || 'Could not create')
    } finally {
      setCreating(false)
    }
  }

  const handleOpenVolume = async (id: string) => {
    if (mode === 'parked') activate()
    setPendingDeleteId(null)
    setShowSaved(false)
    setMarginNum(null)
    if (openId === id) {
      setOpenId(null)
      setItems([])
      return
    }
    setOpenId(id)
    await loadItems(id)
  }

  const handleAdd = async (categoryId: string) => {
    if (handNumber == null) return
    setAddingId(categoryId)
    setError('')
    try {
      const res = await fetch(`/api/categories/${categoryId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add',
          teaching_number: handNumber,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not add')
      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryId ? { ...c, item_count: c.item_count + 1 } : c
        )
      )
      if (openId === categoryId) await loadItems(categoryId)
      setHandNumber(null)
      setHandTitle(null)
    } catch (err: any) {
      setError(err.message || 'Could not add')
    } finally {
      setAddingId(null)
    }
  }

  const handleRemove = async (categoryId: string, teachingNum: number) => {
    setError('')
    try {
      const res = await fetch(`/api/categories/${categoryId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remove',
          teaching_number: teachingNum,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not remove')
      setCategories((prev) =>
        prev.map((c) =>
          c.id === categoryId
            ? { ...c, item_count: Math.max(0, c.item_count - 1) }
            : c
        )
      )
      setItems((prev) => prev.filter((i) => i.teaching_number !== teachingNum))
    } catch (err: any) {
      setError(err.message || 'Could not remove')
    }
  }

  const confirmDeleteVolume = async () => {
    if (!pendingDeleteId) return
    const id = pendingDeleteId
    setPendingDeleteId(null)
    setError('')
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not delete')
      setCategories((prev) => prev.filter((c) => c.id !== id))
      if (openId === id) {
        setOpenId(null)
        setItems([])
      }
    } catch (err: any) {
      setError(err.message || 'Could not delete')
    }
  }

  const pickUp = (num: number, title: string | null) => {
    setHandNumber(num)
    setHandTitle(title)
  }

  const openMargin = async (item: SavedItem) => {
    const title =
      item.teachings?.title || `Teaching ${item.teaching_number}`
    if (marginNum === item.teaching_number) {
      setMarginNum(null)
      setMarginTitle(null)
      setMarginNotes([])
      setMarginDraft('')
      return
    }
    setMarginNum(item.teaching_number)
    setMarginTitle(title)
    setMarginDraft('')
    await loadMarginNotes(item.teaching_number)
  }

  const saveMargin = async () => {
    if (marginNum == null || marginSaving) return
    const body = marginDraft.trim()
    if (!body) return
    setMarginSaving(true)
    setError('')
    try {
      const res = await fetch('/api/marginalia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teaching_number: marginNum,
          body,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not save Marginalia')
      setMarginDraft('')
      await loadMarginNotes(marginNum)
    } catch (err: any) {
      setError(err.message || 'Could not save Marginalia')
    } finally {
      setMarginSaving(false)
    }
  }

  if (!isOpen) return null

  const opacity = isDragging || isResizing ? 0.5 : mode === 'parked' ? 0.72 : 1
  const openVolume = categories.find((c) => c.id === openId) || null
  const shelfRows = chunk(categories, BOOKS_PER_SHELF)
  const pendingName =
    categories.find((c) => c.id === pendingDeleteId)?.name || 'this volume'

  const panelWidth =
    mode === 'parked'
      ? Math.min(320, typeof window !== 'undefined' ? window.innerWidth - 24 : 320)
      : Math.min(width, typeof window !== 'undefined' ? window.innerWidth - 16 : width)

  return (
    <div className="fixed inset-0 z-[60]" style={{ pointerEvents: 'none' }}>
      <div
        ref={panelRef}
        className="absolute rounded-sm shadow-2xl transition-[opacity] duration-150 overflow-hidden flex flex-col"
        style={{
          left: position.x,
          top: position.y,
          width: panelWidth,
          opacity,
          pointerEvents: 'auto',
          cursor: isDragging ? 'grabbing' : mode === 'parked' ? 'grab' : 'default',
          background: '#EDE6DC',
          border: '1px solid #8A735A',
          boxShadow:
            '0 28px 56px rgba(26,22,18,0.35), 0 0 0 1px rgba(201,168,124,0.25) inset',
          maxHeight: mode === 'active' ? 'min(640px, 84vh)' : undefined,
          touchAction: 'none',
        }}
        onMouseDown={(e) => {
          if (mode === 'parked') {
            e.preventDefault()
            tryBeginDrag(e.target, e.clientX, e.clientY)
          }
        }}
        onTouchStart={(e) => {
          if (mode === 'parked' && e.touches[0]) {
            tryBeginDrag(e.target, e.touches[0].clientX, e.touches[0].clientY)
          }
        }}
        onClick={(e) => {
          e.stopPropagation()
          if (mode === 'parked' && !isDragging) activate()
        }}
      >
        {/* Header — drag rail */}
        <div
          data-desk-drag
          className="flex items-center justify-between gap-3 px-4 py-2.5 shrink-0 touch-none"
          style={{
            cursor: isDragging ? 'grabbing' : 'grab',
            background:
              'linear-gradient(180deg, #5c4a3a 0%, #3d342f 55%, #2e2823 100%)',
            borderBottom: '1px solid #1a1614',
            boxShadow: 'inset 0 1px 0 rgba(201,168,124,0.2)',
          }}
          onMouseDown={(e) => {
            e.preventDefault()
            tryBeginDrag(e.target, e.clientX, e.clientY)
          }}
          onTouchStart={(e) => {
            if (e.touches[0]) {
              tryBeginDrag(
                e.target,
                e.touches[0].clientX,
                e.touches[0].clientY
              )
            }
          }}
        >
          <div className="min-w-0 pointer-events-none">
            <div
              className="text-[17px] font-medium tracking-wide"
              style={{ fontFamily: GARAMOND, color: '#F5F0E6' }}
            >
              Your desk
            </div>
            <div className="text-[11px]" style={{ color: '#C9BDA8' }}>
              {mode === 'parked'
                ? 'Tap to open · drag to move'
                : 'Drag this bar to move · corner to resize'}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0" data-no-drag>
            <button
              type="button"
              title={mode === 'active' ? 'Shrink to bar' : 'Restore desk'}
              onClick={toggleShrink}
              className="w-7 h-7 rounded-sm border border-[#C9A87C]/50 text-[#F5F0E6] text-sm hover:bg-white/10"
            >
              {mode === 'active' ? '▾' : '▴'}
            </button>
            <button
              type="button"
              title="Close"
              onClick={(e) => {
                e.stopPropagation()
                handleClose()
              }}
              className="w-7 h-7 rounded-sm border border-[#C9A87C]/50 text-[#F5F0E6] text-sm hover:bg-white/10"
            >
              ✕
            </button>
          </div>
        </div>

        {mode === 'active' ? (
          <div
            className="grid grid-cols-1 sm:grid-cols-[minmax(200px,240px)_1fr] min-h-0 flex-1"
            style={{ height: 'min(520px, 70vh)' }}
            data-no-drag
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <aside
              className="relative flex flex-col min-h-0 min-w-0 overflow-hidden"
              style={{
                background:
                  'linear-gradient(165deg, #3d342f 0%, #2a241c 42%, #1a1614 100%)',
                boxShadow:
                  'inset 3px 0 8px rgba(0,0,0,0.35), inset -1px 0 0 rgba(201,168,124,0.12)',
                borderRight: '1px solid #1a1614',
              }}
            >
              <div
                className="shrink-0 px-2 py-1.5 text-center border-b border-[#1a1614]"
                style={{
                  background:
                    'linear-gradient(180deg, #6b5744 0%, #4a3b2e 100%)',
                  boxShadow: 'inset 0 1px 0 rgba(201,168,124,0.25)',
                }}
              >
                <span
                  className="text-[10px] tracking-[0.2em] uppercase"
                  style={{ color: '#C9A87C', fontFamily: GARAMOND }}
                >
                  Personal Volumes
                </span>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-2.5 py-2.5">
                {loading ? (
                  <p className="text-[11px] text-[#C9BDA8]/80 px-1">Loading…</p>
                ) : categories.length === 0 ? (
                  <p className="text-[11px] text-[#C9BDA8] text-center leading-relaxed px-2 py-8">
                    No volumes yet.
                    <br />
                    Name one below.
                  </p>
                ) : (
                  <div className="flex flex-col">
                    {shelfRows.map((row, rowIndex) => (
                      <div key={rowIndex} className="mb-1">
                        <div
                          className="flex items-end justify-center gap-[3px] px-0.5"
                          style={{ height: 94 }}
                        >
                          {row.map((c, i) => {
                            const globalIndex =
                              rowIndex * BOOKS_PER_SHELF + i
                            const selected = openId === c.id
                            const pal =
                              SPINE_PALETTE[globalIndex % SPINE_PALETTE.length]
                            const w = 24 + (globalIndex % 3)
                            const h = 74 + (globalIndex % 5) * 3
                            return (
                              <button
                                key={c.id}
                                type="button"
                                title={`${c.name} (${c.item_count})`}
                                onClick={() => handleOpenVolume(c.id)}
                                className={`relative shrink-0 rounded-[1px] transition-transform duration-150 ${
                                  selected
                                    ? 'z-10 -translate-y-1 ring-2 ring-[#C9A87C]'
                                    : 'hover:-translate-y-0.5'
                                }`}
                                style={{
                                  width: w,
                                  height: h,
                                  background: `linear-gradient(90deg, ${pal.edge} 0%, ${pal.bg} 12%, ${pal.bg} 88%, ${pal.edge} 100%)`,
                                  color: pal.fg,
                                  boxShadow: selected
                                    ? '1px 2px 8px rgba(0,0,0,0.5)'
                                    : '1px 1px 3px rgba(0,0,0,0.4)',
                                  borderTop: '1px solid rgba(255,255,255,0.28)',
                                  borderBottom: '1px solid rgba(0,0,0,0.3)',
                                }}
                              >
                                <span
                                  className="absolute left-0 right-0 top-0 h-[3px] pointer-events-none"
                                  style={{
                                    background: `linear-gradient(90deg, ${pal.edge}, rgba(201,168,124,0.45), ${pal.edge})`,
                                  }}
                                />
                                <span
                                  className="absolute inset-0 flex items-center justify-center overflow-hidden"
                                  style={{
                                    writingMode: 'vertical-rl',
                                    transform: 'rotate(180deg)',
                                    fontFamily: GARAMOND,
                                    fontWeight: 700,
                                    fontSize:
                                      c.name.length > 16
                                        ? '9px'
                                        : c.name.length > 10
                                          ? '10px'
                                          : '11px',
                                    lineHeight: 1.05,
                                    letterSpacing: '0.03em',
                                    textAlign: 'center',
                                    width: '100%',
                                    padding: '4px 0',
                                  }}
                                >
                                  {c.name}
                                </span>
                              </button>
                            )
                          })}
                        </div>
                        <div
                          className="h-[10px] rounded-[1px]"
                          style={{
                            background:
                              'linear-gradient(180deg, #a08060 0%, #6b5744 35%, #4a3b2e 100%)',
                            boxShadow:
                              '0 2px 4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(201,168,124,0.35)',
                          }}
                        />
                        <div
                          className="h-1.5 mb-0.5"
                          style={{
                            background:
                              'linear-gradient(180deg, rgba(0,0,0,0.35) 0%, transparent 100%)',
                          }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div
                className="shrink-0 p-2 border-t border-[#1a1614]"
                style={{
                  background:
                    'linear-gradient(180deg, #3d342f 0%, #2a241c 100%)',
                  boxShadow: 'inset 0 1px 0 rgba(201,168,124,0.1)',
                }}
              >
                {showNew ? (
                  <div className="flex flex-col gap-1.5">
                    <input
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="Volume name"
                      maxLength={80}
                      className="w-full px-2 py-1.5 rounded-sm border border-[#C9A87C]/60 bg-[#F5F0E6] text-[12px] text-[#2C2522] focus:outline-none"
                      autoFocus
                    />
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={handleCreate}
                        disabled={!newName.trim() || creating}
                        className="flex-1 py-1 text-[11px] rounded-sm bg-[#F5F0E6] text-[#2C2522] disabled:opacity-50"
                      >
                        {creating ? '…' : 'Create'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNew(false)
                          setNewName('')
                        }}
                        className="px-2 py-1 text-[11px] text-[#C9BDA8]"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowNew(true)}
                    className="w-full py-1.5 text-[12px] rounded-sm border border-dashed border-[#C9A87C]/45 text-[#C9A87C] hover:bg-white/5"
                    style={{ fontFamily: GARAMOND }}
                  >
                    + New volume
                  </button>
                )}
              </div>
            </aside>

            <section
              className="flex flex-col min-h-0 min-w-0 relative overflow-hidden"
              style={{
                background:
                  'radial-gradient(ellipse at 40% 0%, #F7F1E6 0%, #EDE6DC 50%, #E0D5C4 100%)',
                boxShadow: 'inset 0 0 40px rgba(92,74,58,0.06)',
              }}
            >
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {pendingDeleteId && (
                  <div
                    className="rounded-sm px-3 py-3"
                    style={{
                      background: '#FFFEF9',
                      border: '1px solid #C9A87C',
                      boxShadow: '0 2px 8px rgba(44,37,34,0.08)',
                    }}
                  >
                    <p
                      className="text-[14px] text-[#2C2522] leading-relaxed"
                      style={{ fontFamily: GARAMOND }}
                    >
                      Remove the Personal Volume{' '}
                      <span className="font-semibold">“{pendingName}”</span>?
                    </p>
                    <p className="mt-1.5 text-[12px] text-[#5C4A3A] leading-relaxed">
                      The name leaves the case. Every Teaching that stood in it
                      remains among your Saved Teachings.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={confirmDeleteVolume}
                        className="px-3 py-1.5 text-[12px] rounded-sm bg-[#2C2522] text-[#F5F0E6] hover:bg-[#3d342f]"
                      >
                        Yes, remove it
                      </button>
                      <button
                        type="button"
                        onClick={() => setPendingDeleteId(null)}
                        className="px-3 py-1.5 text-[12px] rounded-sm border border-[#C9BEB0] text-[#2C2522] hover:bg-[#F7F4EF]"
                      >
                        Leave it
                      </button>
                    </div>
                  </div>
                )}

                {handNumber != null && (
                  <div
                    className="rounded-sm px-3 py-2.5"
                    style={{
                      background: '#FFFEF9',
                      border: '1px solid #C9A87C',
                      boxShadow: '0 1px 4px rgba(44,37,34,0.06)',
                    }}
                  >
                    <div className="text-[10px] uppercase tracking-[0.14em] text-[#8A735A]">
                      In your hand
                    </div>
                    <div
                      className="mt-0.5 text-[16px] font-semibold text-[#2C2522] leading-snug"
                      style={{ fontFamily: GARAMOND }}
                    >
                      {handTitle || `Teaching ${handNumber}`}
                    </div>
                    {openId ? (
                      <button
                        type="button"
                        onClick={() => handleAdd(openId)}
                        disabled={addingId === openId}
                        className="mt-2 px-2.5 py-1 rounded-sm bg-[#2C2522] text-[#F5F0E6] text-[11px] hover:bg-[#3d342f] disabled:opacity-50"
                      >
                        {addingId === openId
                          ? 'Placing…'
                          : `Place in “${openVolume?.name || 'volume'}”`}
                      </button>
                    ) : (
                      <p className="mt-1 text-[11px] text-[#6B5E54]">
                        Choose a volume spine, then place it.
                      </p>
                    )}
                  </div>
                )}

                {openId && openVolume && (
                  <div>
                    <div className="mb-3 pb-2 border-b border-[#C9BEB0]/80">
                      <div className="text-[10px] uppercase tracking-[0.16em] text-[#8A735A] mb-1">
                        Personal Volume
                      </div>
                      <div className="flex items-start justify-between gap-3">
                        <h3
                          className="text-[22px] font-semibold text-[#2C2522] leading-tight"
                          style={{ fontFamily: GARAMOND }}
                        >
                          {openVolume.name}
                        </h3>
                        <button
                          type="button"
                          onClick={() => setPendingDeleteId(openId)}
                          className="text-[11px] text-[#6B5E54] hover:text-[#7A3E3E] shrink-0 text-right max-w-[140px] leading-snug"
                        >
                          Remove the Personal Volume “{openVolume.name}”
                        </button>
                      </div>
                    </div>
                    <div
                      className="rounded-sm"
                      style={{
                        background: 'rgba(247,244,239,0.95)',
                        border: '1px solid #C9BEB0',
                      }}
                    >
                      {itemsLoading ? (
                        <p className="p-2.5 text-[12px] text-[#6B5E54]">
                          Loading…
                        </p>
                      ) : items.length === 0 ? (
                        <p className="p-2.5 text-[12px] text-[#6B5E54]">
                          Empty volume.
                        </p>
                      ) : (
                        <ul className="divide-y divide-[#E5DFD3]">
                          {items.map((item) => (
                            <li
                              key={item.id}
                              className="flex items-start gap-2 px-2.5 py-2"
                            >
                              <Link
                                href={`/teachings/${item.teaching_number}`}
                                onClick={() => {
                                  lastWidth.current = width
                                  setMode('parked')
                                }}
                                className="flex-1 min-w-0 group"
                              >
                                <div
                                  className="text-[14px] font-semibold text-[#2C2522] group-hover:underline leading-snug"
                                  style={{ fontFamily: GARAMOND }}
                                >
                                  {item.teachings?.title ||
                                    `Teaching ${item.teaching_number}`}
                                </div>
                                {item.teachings?.date && (
                                  <div className="text-[10px] text-[#6B5E54] mt-0.5">
                                    {item.teachings.date}
                                  </div>
                                )}
                              </Link>
                              <button
                                type="button"
                                onClick={() =>
                                  handleRemove(openId, item.teaching_number)
                                }
                                className="text-[10px] text-[#6B5E54] hover:text-[#7A3E3E] shrink-0 pt-0.5"
                              >
                                remove
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowSaved((v) => !v)
                          if (!showSaved) loadSavedTeachings()
                        }}
                        className="text-[12px] text-[#5C4A3A] hover:text-[#2C2522] underline underline-offset-2"
                        style={{ fontFamily: GARAMOND }}
                      >
                        {showSaved
                          ? 'Hide saved Teachings'
                          : `Saved Teachings${savedList.length ? ` (${savedList.length})` : ''}`}
                      </button>
                    </div>
                  </div>
                )}

                {!openId && (
                  <div className="py-6 text-center">
                    <p
                      className="text-[14px] text-[#5C4A3A] leading-relaxed"
                      style={{ fontFamily: GARAMOND }}
                    >
                      Select a volume from the case.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setShowSaved((v) => !v)
                        if (!showSaved) loadSavedTeachings()
                      }}
                      className="mt-4 text-[12px] text-[#5C4A3A] hover:text-[#2C2522] underline underline-offset-2"
                      style={{ fontFamily: GARAMOND }}
                    >
                      {showSaved
                        ? 'Hide saved Teachings'
                        : `Saved Teachings${savedList.length ? ` (${savedList.length})` : ''}`}
                    </button>
                  </div>
                )}

                {showSaved && (
                  <div
                    className="rounded-sm"
                    style={{
                      background: 'rgba(255,254,249,0.85)',
                      border: '1px solid #E5DFD3',
                    }}
                  >
                    {loadingSaved ? (
                      <p className="p-2 text-[11px] text-[#6B5E54]">Loading…</p>
                    ) : savedList.length === 0 ? (
                      <p className="p-2 text-[11px] text-[#6B5E54]">
                        None yet. Save while you read.
                      </p>
                    ) : (
                      <ul className="divide-y divide-[#EDE8DF] max-h-52 overflow-y-auto">
                        {savedList.map((item) => {
                          const title =
                            item.teachings?.title ||
                            `Teaching ${item.teaching_number}`
                          const inHand = handNumber === item.teaching_number
                          const marginOpen =
                            marginNum === item.teaching_number
                          return (
                            <li key={item.id} className="px-2.5 py-2">
                              <div className="flex items-center gap-2">
                                <Link
                                  href={`/teachings/${item.teaching_number}`}
                                  className="flex-1 min-w-0 truncate text-[12px] text-[#3F362E] hover:underline"
                                  style={{ fontFamily: GARAMOND }}
                                >
                                  {title}
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => openMargin(item)}
                                  className="text-[10px] text-[#6B5E54] hover:text-[#2C2522] shrink-0"
                                >
                                  Marginalia
                                </button>
                                {!inHand ? (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      pickUp(item.teaching_number, title)
                                    }
                                    className="text-[10px] text-[#6B5E54] hover:text-[#2C2522] shrink-0"
                                  >
                                    pick up
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-[#A89880] shrink-0">
                                    in hand
                                  </span>
                                )}
                              </div>
                              {marginOpen && (
                                <div className="mt-2 space-y-2 pl-0.5 border-t border-[#EDE8DF] pt-2">
                                  <div
                                    className="text-[12px] font-semibold text-[#2C2522]"
                                    style={{ fontFamily: GARAMOND }}
                                  >
                                    Marginalia · {marginTitle}
                                  </div>
                                  {marginLoading ? (
                                    <p className="text-[11px] text-[#6B5E54]">
                                      Loading notes…
                                    </p>
                                  ) : marginNotes.length === 0 ? (
                                    <p className="text-[11px] text-[#6B5E54] italic">
                                      No notes yet on this Teaching.
                                    </p>
                                  ) : (
                                    <ul className="space-y-2 max-h-28 overflow-y-auto">
                                      {marginNotes.map((n) => (
                                        <li
                                          key={n.id}
                                          className="text-[12px] text-[#3F362E] leading-snug"
                                        >
                                          <div className="text-[10px] text-[#8A7B65]">
                                            {formatWhen(n.created_at)}
                                          </div>
                                          <p
                                            className="italic"
                                            style={{ fontFamily: GARAMOND }}
                                          >
                                            {n.body}
                                          </p>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                  <div className="flex items-center justify-between gap-2">
                                    <span className="text-[10px] text-[#8A735A]">
                                      New note
                                    </span>
                                    <button
                                      type="button"
                                      onClick={saveMargin}
                                      disabled={
                                        marginSaving || !marginDraft.trim()
                                      }
                                      className="text-[11px] px-2 py-1 rounded-sm bg-[#2C2522] text-[#F5F0E6] disabled:opacity-50"
                                    >
                                      {marginSaving ? 'Saving…' : 'Add note'}
                                    </button>
                                  </div>
                                  <textarea
                                    value={marginDraft}
                                    onChange={(e) =>
                                      setMarginDraft(e.target.value)
                                    }
                                    rows={3}
                                    maxLength={4000}
                                    placeholder="Agreements, differences, a brief critical comment…"
                                    className="w-full px-2 py-1.5 rounded-sm border border-[#C9BEB0] bg-[#FFFEF9] text-[12px] text-[#2C2522] placeholder:text-[#8A7B65] focus:outline-none resize-none"
                                    style={{ fontFamily: GARAMOND }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setMarginNum(null)
                                      setMarginTitle(null)
                                      setMarginNotes([])
                                      setMarginDraft('')
                                    }}
                                    className="text-[11px] text-[#6B5E54]"
                                  >
                                    Close Marginalia
                                  </button>
                                </div>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                )}

                {error && (
                  <p className="text-[12px] text-red-800 bg-red-50 border border-red-200 rounded-sm px-3 py-2">
                    {error}
                  </p>
                )}
              </div>

              <div
                data-no-drag
                onMouseDown={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  beginResizeAt(e.clientX)
                }}
                onTouchStart={(e) => {
                  const t = e.touches[0]
                  if (!t) return
                  e.stopPropagation()
                  beginResizeAt(t.clientX)
                }}
                title="Drag to change width"
                className="absolute bottom-0 right-0 w-10 h-10 cursor-ew-resize flex items-end justify-end p-2 text-[#8A735A] touch-none"
              >
                <svg width="12" height="12" viewBox="0 0 14 14">
                  <path
                    d="M4 13h9V4M8 13h5V8"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
            </section>
          </div>
        ) : (
          <div
            className="px-4 py-2.5 text-[12px] shrink-0"
            style={{ color: '#5C4A3A', background: '#EDE6DC' }}
            data-no-drag
            onMouseDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            {handNumber != null ? (
              <span>
                In hand:{' '}
                <span className="font-medium text-[#2C2522]">
                  {handTitle || `Teaching ${handNumber}`}
                </span>
              </span>
            ) : (
              <span>
                {categories.length} volume
                {categories.length === 1 ? '' : 's'} · tap ▴ or bar to open
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function openDesk(detail: DeskContext = {}) {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(DESK_OPEN_KEY, '1')
  } catch {
    /* ignore */
  }
  window.dispatchEvent(
    new CustomEvent('tot-open-desk', {
      detail: {
        teachingNumber: detail.teachingNumber ?? null,
        teachingTitle: detail.teachingTitle ?? null,
      },
    })
  )
}