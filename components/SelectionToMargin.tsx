'use client'

import { useEffect, useRef, useState } from 'react'

export default function SelectionToMargin() {
  const [prompt, setPrompt] = useState<{
    text: string
    x: number
    y: number
  } | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastQuote = useRef('')

  useEffect(() => {
    const clearTimer = () => {
      if (timer.current) {
        clearTimeout(timer.current)
        timer.current = null
      }
    }

    const onSelectionChange = () => {
      clearTimer()
      const sel = window.getSelection()
      if (!sel || sel.isCollapsed || !sel.rangeCount) {
        setPrompt(null)
        return
      }

      const text = sel.toString().trim()
      if (text.length < 8) {
        setPrompt(null)
        return
      }

      // Only offer when selection is inside the Teaching body
      const body = document.getElementById('teaching-body')
      if (!body) return
      const range = sel.getRangeAt(0)
      if (!body.contains(range.commonAncestorContainer)) {
        setPrompt(null)
        return
      }

      lastQuote.current = text

      timer.current = setTimeout(() => {
        const rect = range.getBoundingClientRect()
        setPrompt({
          text,
          x: Math.min(rect.left + rect.width / 2, window.innerWidth - 160),
          y: Math.max(8, rect.top - 8),
        })
      }, 1000)
    }

    document.addEventListener('selectionchange', onSelectionChange)
    return () => {
      clearTimer()
      document.removeEventListener('selectionchange', onSelectionChange)
    }
  }, [])

  if (!prompt) return null

  const openMargin = () => {
    window.dispatchEvent(
      new CustomEvent('tos-open-marginalia', {
        detail: { quote: lastQuote.current || prompt.text },
      })
    )
    setPrompt(null)
    window.getSelection()?.removeAllRanges()
  }

  const dismiss = () => {
    setPrompt(null)
  }

  return (
    <div
      className="fixed z-[60] -translate-x-1/2 -translate-y-full"
      style={{ left: prompt.x, top: prompt.y }}
    >
      <div className="rounded-sm border border-[#C9BEB0] bg-[#F7F4EF] shadow-md px-3 py-2 max-w-[260px]">
        <p className="text-[12px] text-[#5C4A3A] leading-snug mb-2">
          Would you like to make a note about this in the margin?
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openMargin}
            className="text-[12px] text-[#2C2522] underline underline-offset-2 hover:text-[#7A3E3E]"
          >
            Yes
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="text-[12px] text-[#8A7B65] hover:text-[#2C2522]"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  )
}