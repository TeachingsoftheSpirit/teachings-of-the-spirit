'use client'
import { useState } from 'react'
import EmailCapture from './EmailCapture'
import { createClient } from '@/lib/supabase/client'
import { openDesk } from './DeskOverlay'

type Props = {
  teachingNumber: number
  teachingTitle: string
}

export default function SaveTeachingButton({
  teachingNumber,
  teachingTitle,
}: Props) {
  const [authOpen, setAuthOpen] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saving' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const saveAndOpenDesk = async () => {
    setStatus('saving')
    setMessage('')
    try {
      const res = await fetch('/api/save-teaching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teaching_number: teachingNumber }),
      })
      if (!res.ok && res.status !== 401) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Could not save')
      }
      if (res.status === 401) {
        setAuthOpen(true)
        setStatus('idle')
        return
      }
      openDesk({
        teachingNumber,
        teachingTitle,
      })
      setStatus('idle')
    } catch (err: any) {
      setStatus('error')
      setMessage(err.message || 'Could not save')
    }
  }

  const handleClick = async () => {
    setMessage('')
    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      setAuthOpen(true)
      return
    }
    await saveAndOpenDesk()
  }

  return (
    <>
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          onClick={handleClick}
          disabled={status === 'saving'}
          className="
            relative text-sm tracking-wide
            text-[#5C4A3A] hover:text-[#2A241C]
            transition-all duration-300
            disabled:opacity-50
            after:absolute after:left-0 after:right-0 after:-bottom-0.5
            after:h-px after:bg-[#C9A87C]/40
            after:scale-x-0 hover:after:scale-x-100
            after:transition-transform after:duration-300
            hover:drop-shadow-[0_0_8px_rgba(201,168,124,0.55)]
            hover:drop-shadow-[0_0_16px_rgba(255,230,180,0.35)]
          "
        >
          {status === 'saving'
            ? 'Saving…'
            : 'Save this Teaching to your desk'}
        </button>
        {status === 'error' && message && (
          <span className="text-xs text-red-700">{message}</span>
        )}
      </div>
      <EmailCapture
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        intent="save"
        teachingNumber={teachingNumber}
        teachingTitle={teachingTitle}
        onSuccess={() => {
          setAuthOpen(false)
          openDesk({
            teachingNumber,
            teachingTitle,
          })
        }}
      />
    </>
  )
}