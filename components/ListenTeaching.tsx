'use client'

import { useEffect, useRef, useState } from 'react'

type Status = 'idle' | 'playing' | 'paused'

export default function ListenTeaching() {
  const [status, setStatus] = useState<Status>('idle')
  const [supported, setSupported] = useState(true)
  const indexRef = useRef(0)
  const paragraphsRef = useRef<string[]>([])
  const statusRef = useRef<Status>('idle')

  useEffect(() => {
    statusRef.current = status
  }, [status])

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setSupported(false)
    }
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  const collectParagraphs = () => {
    const el = document.getElementById('teaching-body')
    if (!el) return []
    return Array.from(el.querySelectorAll('p'))
      .map((p) => (p.textContent || '').trim())
      .filter((t) => t.length > 0)
  }

    const pickVoice = () => {
    const voices = window.speechSynthesis.getVoices()
    if (!voices.length) return null

    const score = (v: SpeechSynthesisVoice) => {
      let s = 0
      const name = v.name.toLowerCase()
      const lang = v.lang.toLowerCase()

      if (lang.startsWith('en')) s += 10
      if (lang.includes('en-gb') || lang.includes('en_gb')) s += 20
      if (lang.includes('en-sc') || /scotland|scottish|fiona|moira/.test(name)) s += 25
      if (/uk english|british|daniel|serena|martha|hazel|george|susan/.test(name)) s += 15
      if (lang.includes('en-us') || lang.includes('en_us')) s += 2

      if (/natural|neural|premium|enhanced|wavenet|google/.test(name)) s += 12
      if (/zira|david|mark|microsoft david|microsoft zira|sam/.test(name)) s -= 10

      return s
    }

    return [...voices].sort((a, b) => score(b) - score(a))[0] || voices[0]
  }

  const speakFrom = (startIndex: number) => {
    const parts = paragraphsRef.current
    if (!parts.length || startIndex >= parts.length) {
      setStatus('idle')
      indexRef.current = 0
      return
    }

    const utter = new SpeechSynthesisUtterance(parts[startIndex])
    const voice = pickVoice()
    if (voice) utter.voice = voice
    utter.rate = 0.60
    utter.pitch = 0.95
    utter.volume = 1

    utter.onend = () => {
      if (statusRef.current !== 'playing') return
      indexRef.current = startIndex + 1
      if (indexRef.current >= parts.length) {
        setStatus('idle')
        indexRef.current = 0
        return
      }
      speakFrom(indexRef.current)
    }

    utter.onerror = () => {
      setStatus('idle')
    }

    window.speechSynthesis.speak(utter)
  }

  const start = () => {
    if (!supported) return
    window.speechSynthesis.cancel()
    paragraphsRef.current = collectParagraphs()
    if (!paragraphsRef.current.length) return
    indexRef.current = 0
    setStatus('playing')
    const kick = () => speakFrom(0)
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.onvoiceschanged = null
        kick()
      }
      setTimeout(kick, 250)
    } else {
      kick()
    }
  }

  const pause = () => {
    if (!supported) return
    window.speechSynthesis.pause()
    setStatus('paused')
  }

  const resume = () => {
    if (!supported) return
    window.speechSynthesis.resume()
    setStatus('playing')
  }

  const stop = () => {
    if (!supported) return
    window.speechSynthesis.cancel()
    setStatus('idle')
    indexRef.current = 0
  }

  if (!supported) return null

  if (status === 'idle') {
    return (
      <button
        type="button"
        data-print-hide
        onClick={start}
        title="Listen to this Teaching"
        className="text-[12px] text-[#6B5E54] hover:text-[#2C2522] underline underline-offset-2 transition-colors"
      >
        Listen
      </button>
    )
  }

  return (
    <span className="inline-flex items-center gap-2" data-print-hide>
      <button
        type="button"
        onClick={status === 'playing' ? pause : resume}
        className="text-[12px] text-[#6B5E54] hover:text-[#2C2522] underline underline-offset-2 transition-colors"
      >
        {status === 'playing' ? 'Pause' : 'Resume'}
      </button>
      <button
        type="button"
        onClick={stop}
        className="text-[12px] text-[#8A7B65] hover:text-[#2C2522] transition-colors"
      >
        Stop
      </button>
    </span>
  )
}