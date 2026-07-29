'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
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
const MARK_ATTR = 'data-tos-margin-mark'
const RAIL_ID = 'tos-margin-rail'
const MARGINS_PREF_KEY = 'tos-show-margins'

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

function splitQuoteAndComment(body: string): {
  quote: string | null
  comment: string
} {
  const trimmed = body.trim()
  const m = trimmed.match(/^[“"]([\s\S]*?)[”"]\s*([\s\S]*)$/)
  if (m) {
    return { quote: m[1].trim() || null, comment: m[2].trim() }
  }
  return { quote: null, comment: trimmed }
}

function normalizeForMatch(s: string) {
  return s
    .replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"')
    .replace(/[\u2018\u2019\u201A\u201B\u2032]/g, "'")
    .replace(/[\u2026]/g, '...')
    .replace(/\s+/g, ' ')
    .trim()
}

function readMarginsPref(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return sessionStorage.getItem(MARGINS_PREF_KEY) === '1'
  } catch {
    return false
  }
}

function writeMarginsPref(on: boolean) {
  try {
    if (on) sessionStorage.setItem(MARGINS_PREF_KEY, '1')
    else sessionStorage.removeItem(MARGINS_PREF_KEY)
  } catch {
    /* ignore */
  }
}

function clearInTextMarks() {
  if (typeof document === 'undefined') return
  const body = document.getElementById('teaching-body')
  if (body) {
    body.querySelectorAll(`[${MARK_ATTR}]`).forEach((mark) => {
      const parent = mark.parentNode
      if (!parent) return
      while (mark.firstChild) parent.insertBefore(mark.firstChild, mark)
      parent.removeChild(mark)
      parent.normalize()
    })
  }
  document.getElementById(RAIL_ID)?.remove()
}

function ensureRail(body: HTMLElement): HTMLElement {
  let rail = document.getElementById(RAIL_ID)
  if (rail) return rail

  const host = body.parentElement || body
  if (getComputedStyle(host).position === 'static') {
    host.style.position = 'relative'
  }

  rail = document.createElement('div')
  rail.id = RAIL_ID
  rail.setAttribute('data-print-hide', '1')
  rail.style.position = 'absolute'
  rail.style.left = '0'
  rail.style.top = '0'
  rail.style.width = '0'
  rail.style.height = '0'
  rail.style.pointerEvents = 'none'
  rail.style.zIndex = '5'
  host.appendChild(rail)
  return rail
}

function findAndMark(
  root: HTMLElement,
  needleRaw: string,
  noteId: string
): HTMLElement | null {
  const needle = normalizeForMatch(needleRaw)
  if (needle.length < 3) return null

  const nodes: { node: Text; start: number; raw: string }[] = []
  let flat = ''
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let n: Node | null = walker.nextNode()
  while (n) {
    if ((n.parentElement as HTMLElement)?.hasAttribute?.(MARK_ATTR)) {
      n = walker.nextNode()
      continue
    }
    const raw = n.textContent || ''
    nodes.push({ node: n as Text, start: flat.length, raw })
    flat += raw
    n = walker.nextNode()
  }

  const pattern = needle
    .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    .replace(/\\\.\\\.\\\./g, '(?:\\u2026|\\.\\.\\.)')
    .replace(/['"]/g, '[\\u201C\\u201D\\u2018\\u2019"\']')
    .replace(/ /g, '\\s+')

  let matchIndex = -1
  let matchLen = 0
  try {
    const re = new RegExp(pattern, 'i')
    const m = flat.match(re)
    if (m && m.index != null) {
      matchIndex = m.index
      matchLen = m[0].length
    }
  } catch {
    matchIndex = flat.indexOf(needleRaw)
    matchLen = needleRaw.length
  }

  if (matchIndex < 0) {
    const collapsedFlat = flat.replace(/\s+/g, ' ')
    const ci = collapsedFlat.indexOf(needle)
    if (ci < 0) return null
    let oi = 0
    let ci2 = 0
    while (oi < flat.length && ci2 < ci) {
      if (/\s/.test(flat[oi]!)) {
        while (oi < flat.length && /\s/.test(flat[oi]!)) oi++
        ci2++
      } else {
        oi++
        ci2++
      }
    }
    matchIndex = oi
    matchLen = needleRaw.length
  }

  if (matchIndex < 0 || matchLen < 1) return null

  let startNode: Text | null = null
  let startOffset = 0
  let endNode: Text | null = null
  let endOffset = 0
  const matchEnd = matchIndex + matchLen

  for (const chunk of nodes) {
    const chunkEnd = chunk.start + chunk.raw.length
    if (!startNode && matchIndex >= chunk.start && matchIndex < chunkEnd) {
      startNode = chunk.node
      startOffset = matchIndex - chunk.start
    }
    if (matchEnd > chunk.start && matchEnd <= chunkEnd) {
      endNode = chunk.node
      endOffset = matchEnd - chunk.start
      break
    }
  }

  if (!startNode || !endNode) return null

  try {
    const range = document.createRange()
    range.setStart(startNode, startOffset)
    range.setEnd(endNode, endOffset)

    const mark = document.createElement('mark')
    mark.setAttribute(MARK_ATTR, noteId)
    mark.style.background = 'rgba(201, 168, 124, 0.22)'
    mark.style.color = 'inherit'
    mark.style.fontWeight = 'inherit'
    mark.style.borderRadius = '2px'
    mark.style.padding = '0'
    mark.style.boxDecorationBreak = 'clone'
    ;(mark.style as any).webkitBoxDecorationBreak = 'clone'

    range.surroundContents(mark)
    return mark
  } catch {
    return null
  }
}

function applyInTextMarks(notes: Note[]) {
  clearInTextMarks()
  const body = document.getElementById('teaching-body')
  if (!body) return

  const rail = ensureRail(body)
  const bodyRect = body.getBoundingClientRect()
  const host = body.parentElement || body
  const hostRect = host.getBoundingClientRect()

  const spaceLeft = bodyRect.left - 12
  const useLeft = spaceLeft >= 130
  const cardWidth = useLeft ? Math.min(150, spaceLeft - 8) : 150

  const withQuotes = notes
    .map((n) => {
      const { quote, comment } = splitQuoteAndComment(n.body)
      return { id: n.id, quote, comment }
    })
    .filter((n) => n.quote && n.quote.length > 2)

  const placedTops: number[] = []

  for (const item of withQuotes) {
    const quote = item.quote as string
    const mark =
      findAndMark(body, quote, item.id) ||
      findAndMark(
        body,
        quote.slice(0, Math.min(96, quote.length)).trim(),
        item.id
      )
    if (!mark) continue

    const comment = (item.comment || '').replace(/^[-–—]\s*/, '').trim()
    if (!comment) continue

    const markRect = mark.getBoundingClientRect()
    let top = markRect.top - hostRect.top

    for (const prev of placedTops) {
      if (Math.abs(top - prev) < 56) top = prev + 56
    }
    placedTops.push(top)

    const card = document.createElement('div')
    card.style.position = 'absolute'
    card.style.top = `${top}px`
    card.style.width = `${cardWidth}px`
    card.style.pointerEvents = 'auto'
    card.style.fontFamily = GARAMOND
    card.style.fontSize = '11px'
    card.style.lineHeight = '1.35'
    card.style.color = '#6B5E54'
    card.style.fontStyle = 'italic'
    card.style.padding = '6px 8px'
    card.style.background = 'rgba(247, 241, 230, 0.94)'
    card.style.border = '1px solid rgba(201, 168, 124, 0.55)'
    card.style.borderRadius = '2px'
    card.style.boxShadow = '0 1px 4px rgba(44, 37, 34, 0.06)'
    card.textContent = comment

    if (useLeft) {
      card.style.left = `${bodyRect.left - hostRect.left - cardWidth - 12}px`
    } else {
      card.style.left = `${bodyRect.right - hostRect.left + 10}px`
    }

    const tick = document.createElement('div')
    tick.style.position = 'absolute'
    tick.style.top = '10px'
    tick.style.width = '8px'
    tick.style.height = '1px'
    tick.style.background = 'rgba(201, 168, 124, 0.8)'
    if (useLeft) tick.style.right = '-9px'
    else tick.style.left = '-9px'
    card.appendChild(tick)

    rail.appendChild(card)
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
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [hasNotes, setHasNotes] = useState(false)
  const [showInText, setShowInText] = useState(false)
  const showInTextRef = useRef(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const dragging = useRef(false)
  const dragOffset = useRef({ x: 0, y: 0 })
  const positioned = useRef(false)

  const refreshInText = useCallback((list: Note[], on: boolean) => {
    if (!on) {
      clearInTextMarks()
      return
    }
    requestAnimationFrame(() => applyInTextMarks(list))
  }, [])

  const fetchThisTeachingNotes = useCallback(async (): Promise<Note[]> => {
    if (teachingNumber == null) return []
    const res = await fetch(
      `/api/marginalia?teaching_number=${teachingNumber}`
    )
    if (!res.ok) return []
    const data = await res.json()
    return data.notes || []
  }, [teachingNumber])

  // Restore preference + apply margins on this Teaching (even if panel closed)
  useEffect(() => {
    const preferred = readMarginsPref()
    setShowInText(preferred)
    showInTextRef.current = preferred

    if (teachingNumber == null) return

    let cancelled = false
    ;(async () => {
      try {
        const list = await fetchThisTeachingNotes()
        if (cancelled) return
        setHasNotes(list.length > 0)
        if (preferred && list.length > 0) {
          setNotes(list)
          refreshInText(list, true)
        }
      } catch {
        if (!cancelled) setHasNotes(false)
      }
    })()

    return () => {
      cancelled = true
      clearInTextMarks()
    }
  }, [teachingNumber, fetchThisTeachingNotes, refreshInText])

  useEffect(() => {
    if (!showInText) return
    const onResize = () => {
      if (notes.length) refreshInText(notes, true)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [showInText, notes, refreshInText])

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { quote?: string } | undefined
      const quote = (detail?.quote || '').trim()
      if (quote) {
        setDraft(`“${quote}”\n\n- `)
      } else {
        setDraft('- ')
      }
      setScope(teachingNumber != null ? 'this' : 'all')
      setOpen(true)
    }
    window.addEventListener('tos-open-marginalia', handler)
    return () => window.removeEventListener('tos-open-marginalia', handler)
  }, [teachingNumber])

  useEffect(() => {
    if (!open) {
      positioned.current = false
      return
    }
    if (!positioned.current && typeof window !== 'undefined') {
      const w = Math.min(420, window.innerWidth - 32)
      const h = Math.min(560, window.innerHeight * 0.86)
      setPos({
        x: Math.max(16, (window.innerWidth - w) / 2),
        y: Math.max(16, (window.innerHeight - h) / 2),
      })
      positioned.current = true
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    if (teachingNumber == null || scope !== 'this') return
    const t = window.setTimeout(() => {
      const el = textareaRef.current
      if (!el) return
      if (!draft.trim()) {
        setDraft('- ')
        requestAnimationFrame(() => {
          el.focus()
          const len = el.value.length
          el.setSelectionRange(len, len)
        })
      } else {
        el.focus()
        const len = el.value.length
        el.setSelectionRange(len, len)
      }
    }, 50)
    return () => window.clearTimeout(t)
  }, [open, scope, teachingNumber])

  useEffect(() => {
    const onMove = (clientX: number, clientY: number) => {
      if (!dragging.current) return
      setPos({
        x: clientX - dragOffset.current.x,
        y: clientY - dragOffset.current.y,
      })
    }
    const onMouseMove = (e: MouseEvent) => onMove(e.clientX, e.clientY)
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY)
    }
    const onUp = () => {
      dragging.current = false
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend', onUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend', onUp)
    }
  }, [])

  const startDrag = (clientX: number, clientY: number) => {
    dragging.current = true
    dragOffset.current = {
      x: clientX - pos.x,
      y: clientY - pos.y,
    }
  }

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
          setHasNotes(false)
          return
        }
        throw new Error('Could not load Marginalia')
      }
      const data = await res.json()
      const list: Note[] = data.notes || []
      setNotes(list)
      if (currentScope === 'this' && teachingNumber != null) {
        setHasNotes(list.length > 0)
        if (showInTextRef.current) refreshInText(list, true)
      }
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

  const toggleShowInText = async () => {
    const next = !showInText
    setShowInText(next)
    showInTextRef.current = next
    writeMarginsPref(next)
    if (next) {
      const list = await fetchThisTeachingNotes()
      setNotes(list)
      setHasNotes(list.length > 0)
      refreshInText(list, true)
    } else {
      clearInTextMarks()
    }
  }

  const addNote = async () => {
    if (teachingNumber == null || !draft.trim() || saving) return
    if (draft.trim() === '-') return
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
      setDraft('- ')
      setScope('this')
      setHasNotes(true)
      const list = await fetchThisTeachingNotes()
      setNotes(list)
      if (showInTextRef.current) refreshInText(list, true)
      requestAnimationFrame(() => {
        const el = textareaRef.current
        if (el) {
          el.focus()
          const len = el.value.length
          el.setSelectionRange(len, len)
        }
      })
    } catch (err: any) {
      setError(err.message || 'Could not save')
    } finally {
      setSaving(false)
    }
  }

  const deleteNote = async (id: string) => {
    if (deletingId) return
    setDeletingId(id)
    setError('')
    try {
      const res = await fetch('/api/marginalia', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Could not delete')
      const list = await fetchThisTeachingNotes()
      setNotes(list)
      setHasNotes(list.length > 0)
      setConfirmId(null)
      if (showInTextRef.current) refreshInText(list, true)
    } catch (err: any) {
      setError(err.message || 'Could not delete')
    } finally {
      setDeletingId(null)
    }
  }

  const canCompose = teachingNumber != null && scope === 'this'

  const openPanel = () => {
    setScope(teachingNumber != null ? 'this' : 'all')
    if (teachingNumber != null) setDraft('- ')
    setOpen(true)
  }

  return (
    <>
      <button
        type="button"
        onClick={openPanel}
        className="relative inline-flex items-center gap-0.5 text-[13px] text-[#6B5E54] hover:text-[#2C2522] underline underline-offset-2 transition-colors"
        style={{ fontFamily: GARAMOND }}
        title={
          hasNotes
            ? showInText
              ? 'Marginalia · margins showing'
              : 'You have notes on this Teaching'
            : 'Marginalia'
        }
      >
        Marginalia
        {hasNotes && (
          <span
            aria-hidden
            className="inline-block rounded-full shrink-0"
            style={{
              width: 4,
              height: 4,
              background: showInText ? '#7A3E3E' : '#9A7B6C',
              marginLeft: 3,
              marginBottom: '0.45em',
              opacity: 0.9,
            }}
          />
        )}
      </button>

      {open && (
        <div
          className="fixed z-[70] flex flex-col rounded-sm shadow-2xl overflow-hidden"
          style={{
            left: pos.x,
            top: pos.y,
            width: 'min(420px, calc(100vw - 32px))',
            maxHeight: 'min(560px, 86vh)',
            background: '#F7F1E6',
            border: '1px solid #8A735A',
          }}
        >
          <div
            className="flex items-center justify-between px-4 py-3 shrink-0 cursor-move select-none touch-none"
            style={{
              background: 'linear-gradient(180deg, #5c4a3a 0%, #3d342f 100%)',
            }}
            onMouseDown={(e) => {
              e.preventDefault()
              startDrag(e.clientX, e.clientY)
            }}
            onTouchStart={(e) => {
              const t = e.touches[0]
              if (t) startDrag(t.clientX, t.clientY)
            }}
          >
            <div className="min-w-0 pr-2 pointer-events-none">
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
            <div
              className="flex items-center gap-2 shrink-0"
              onMouseDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
            >
              {teachingNumber != null && (hasNotes || showInText) && (
                <button
                  type="button"
                  onClick={toggleShowInText}
                  className={`text-[11px] px-2 py-1 rounded-sm border transition-colors ${
                    showInText
                      ? 'bg-[#F5F0E6] text-[#2C2522] border-[#F5F0E6]'
                      : 'text-[#F5F0E6] border-[#C9A87C]/50 hover:bg-white/10'
                  }`}
                  title="Show notes in the margin while you read"
                >
                  {showInText ? 'Hide margins' : 'Show in margins'}
                </button>
              )}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-[#F5F0E6] hover:text-white text-sm px-1"
              >
                ✕
              </button>
            </div>
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

          <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
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
                  const { quote, comment } = splitQuoteAndComment(note.body)
                  const confirming = confirmId === note.id
                  return (
                    <li
                      key={note.id}
                      className="pb-3 border-b border-[#E5DFD3] last:border-0"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
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
                        </div>

                        {!confirming ? (
                          <button
                            type="button"
                            onClick={() => setConfirmId(note.id)}
                            className="text-[11px] text-[#8A7B65] hover:text-[#7A3E3E] shrink-0 transition-colors"
                          >
                            Remove
                          </button>
                        ) : (
                          <div className="flex items-center gap-2 shrink-0 text-[11px]">
                            <span className="text-[#8A7B65]">Remove?</span>
                            <button
                              type="button"
                              onClick={() => deleteNote(note.id)}
                              disabled={deletingId === note.id}
                              className="text-[#7A3E3E] hover:underline disabled:opacity-50"
                            >
                              {deletingId === note.id ? '…' : 'Yes'}
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmId(null)}
                              className="text-[#8A7B65] hover:text-[#2C2522]"
                            >
                              No
                            </button>
                          </div>
                        )}
                      </div>

                      <div
                        className="mt-1.5 text-[13px] text-[#3F362E] leading-relaxed"
                        style={{ fontFamily: GARAMOND }}
                      >
                        {quote && (
                          <p className="font-semibold mb-1.5">“{quote}”</p>
                        )}
                        {comment && (
                          <p className={quote ? 'font-normal' : 'italic'}>
                            {comment}
                          </p>
                        )}
                      </div>
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
                  disabled={saving || !draft.trim() || draft.trim() === '-'}
                  className="text-[11px] px-2.5 py-1 rounded-sm bg-[#2C2522] text-[#F5F0E6] disabled:opacity-50 shrink-0"
                >
                  {saving ? 'Saving…' : 'Add note'}
                </button>
              </div>
              <textarea
                ref={textareaRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={4}
                maxLength={4000}
                placeholder="- "
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
      )}
    </>
  )
}