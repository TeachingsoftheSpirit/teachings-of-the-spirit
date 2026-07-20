'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

type Props = {
  isOpen: boolean
  onClose: () => void
  teachingNumber?: number
  teachingTitle?: string
  onSuccess?: (email: string) => void
}

type SavedItem = {
  id: string
  teaching_number: number
  memo: string | null
  created_at: string
  teachings: {
    title: string
    date: string
  } | null
}

export default function EmailCapture({
  isOpen,
  onClose,
  teachingNumber,
  teachingTitle,
}: Props) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'key-sent' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [savedEmail, setSavedEmail] = useState('')
  const [memo, setMemo] = useState('')
  const [sendTo, setSendTo] = useState('')
  const [savedList, setSavedList] = useState<SavedItem[]>([])
  const [loadingList, setLoadingList] = useState(false)
  const [savingTeaching, setSavingTeaching] = useState(false)
  const [justSaved, setJustSaved] = useState(false)
  const [savingMemo, setSavingMemo] = useState(false)
  const [sendingToSomeone, setSendingToSomeone] = useState(false)
  const [sendStatus, setSendStatus] = useState<'idle' | 'sent' | 'error'>('idle')
  const [checkingSession, setCheckingSession] = useState(false)

  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (isOpen && cardRef.current) {
      const width = 460
      setPosition({
        x: Math.max(40, window.innerWidth - width - 50),
        y: 70,
      })
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) {
      setStatus('idle')
      setMessage('')
      setMemo('')
      setSendTo('')
      setSavedList([])
      setEmail('')
      setJustSaved(false)
      setSendStatus('idle')
      setCheckingSession(false)
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
      return
    }

    const checkSession = async () => {
      setCheckingSession(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user?.email) {
        setSavedEmail(user.email)
        setStatus('success')
        await fetchSavedList()
      }

      setCheckingSession(false)
    }

    checkSession()
  }, [isOpen])

  useEffect(() => {
    if (status !== 'key-sent') {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
      return
    }

    const supabase = createClient()

    pollRef.current = setInterval(async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) {
        if (pollRef.current) {
          clearInterval(pollRef.current)
          pollRef.current = null
        }
        setSavedEmail(user.email)
        setStatus('success')
        await fetchSavedList()
      }
    }, 2500)

    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }
  }, [status])

  // When the list loads, check if the current teaching is already saved
  useEffect(() => {
    if (teachingNumber && savedList.length > 0) {
      const already = savedList.some((item) => item.teaching_number === teachingNumber)
      setJustSaved(already)
    }
  }, [savedList, teachingNumber])

  const onMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-drag-handle]')) {
      setIsDragging(true)
      dragStart.current = {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      }
    }
  }

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      })
    }
    const onMouseUp = () => setIsDragging(false)
    if (isDragging) {
      window.addEventListener('mousemove', onMouseMove)
      window.addEventListener('mouseup', onMouseUp)
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [isDragging])

  if (!isOpen) return null

  const fetchSavedList = async () => {
    setLoadingList(true)
    try {
      const res = await fetch('/api/saved-teachings')
      const data = await res.json()
      setSavedList(data.saved || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingList(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setStatus('error')
      setMessage('Please enter your email address.')
      return
    }

    setStatus('sending')
    setMessage('')

    try {
      const supabase = createClient()

      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          shouldCreateUser: true,
        },
      })

      if (error) throw error

      setStatus('key-sent')
      setSavedEmail(email.trim())
    } catch (err: any) {
      setStatus('error')
      setMessage(err.message || 'Unable to send the key right now.')
    }
  }

  const handleSaveTeaching = async () => {
    if (!teachingNumber || justSaved) return
    setSavingTeaching(true)
    try {
      const res = await fetch('/api/save-teaching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teaching_number: teachingNumber,
          memo: memo || null,
        }),
      })
      if (!res.ok) throw new Error('Save failed')
      setJustSaved(true)
      await fetchSavedList()
    } catch (err) {
      console.error(err)
    } finally {
      setSavingTeaching(false)
    }
  }

  const handleSaveMemo = async () => {
    if (!teachingNumber) return
    setSavingMemo(true)
    try {
      await fetch('/api/save-teaching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teaching_number: teachingNumber,
          memo: memo || null,
        }),
      })
      await fetchSavedList()
    } catch (err) {
      console.error(err)
    } finally {
      setSavingMemo(false)
    }
  }

  const handleSendToSomeone = async () => {
    if (!teachingNumber || !sendTo.trim()) return
    setSendingToSomeone(true)
    setSendStatus('idle')
    try {
      const res = await fetch('/api/send-teaching', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: sendTo.trim(),
          teaching_number: teachingNumber,
          teaching_title: teachingTitle,
        }),
      })
      if (!res.ok) throw new Error('Failed to send')
      setSendStatus('sent')
      setSendTo('')
    } catch (err) {
      console.error(err)
      setSendStatus('error')
    } finally {
      setSendingToSomeone(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div
        className="absolute inset-0 bg-black/10 pointer-events-auto"
        onClick={onClose}
      />

      <div
        ref={cardRef}
        className="absolute pointer-events-auto"
        style={{
          left: position.x,
          top: position.y,
          cursor: isDragging ? 'grabbing' : 'default',
          width: '460px',
        }}
        onMouseDown={onMouseDown}
      >
        <div className="relative w-full rounded-sm overflow-hidden shadow-2xl" style={{ height: '640px' }}>
          <Image
            src="/doors-of-durin-full.jpg"
            alt="Doors of Durin"
            fill
            className="object-contain object-top bg-[#f5f0e6]"
            priority
            sizes="460px"
          />

          <div className="absolute left-[5.1rem] right-[5.1rem] bottom-5 top-[255px] flex flex-col">
            <div className="bg-[#F7F1E6]/93 border border-[#C9B896] rounded-sm shadow-xl flex flex-col h-full overflow-hidden">
              
              <div
                data-drag-handle
                className="flex items-center justify-between px-4 py-2.5 border-b border-[#E0D5C0] bg-[#F0E9DC]/95 cursor-grab active:cursor-grabbing select-none shrink-0"
              >
                <div className="text-[13px] font-medium text-[#2A241C] tracking-wide">
                  {status === 'success' ? 'Special Collections' : status === 'key-sent' ? 'A Key Has Been Sent' : 'A Library Card'}
                </div>
                <button
                  onClick={onClose}
                  className="text-[#8A7B65] hover:text-[#2A241C] text-sm transition-colors px-1"
                >
                  ✕
                </button>
              </div>

              <div className="px-4 py-4 overflow-y-auto flex-1 text-[13px]">
                {checkingSession ? (
                  <div className="py-8 text-center text-[#6B5E54]">
                    Opening your room…
                  </div>
                ) : status === 'success' ? (
                  <div className="space-y-5">
                    {teachingNumber && teachingTitle && (
                      <div className="space-y-2">
                        {justSaved ? (
                          <>
                            <div className="leading-relaxed text-[#3F362E]">
                              <div className="text-[#6B5E54]">We have saved the Teaching</div>
                              <div className="mt-1 font-medium text-[#2A241C] text-[14px]">
                                {teachingTitle}
                              </div>
                              <div className="mt-1 text-[12px] text-[#6B5E54]">
                                to the Special Collection of {savedEmail}
                              </div>
                            </div>
                            <div className="text-[13px] text-[#A39682]">
                              Saved
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="leading-relaxed text-[#3F362E]">
                              <div className="text-[#6B5E54]">Save this Teaching to your Special Collection?</div>
                              <div className="mt-1 font-medium text-[#2A241C] text-[14px]">
                                {teachingTitle}
                              </div>
                            </div>
                            <button
                              onClick={handleSaveTeaching}
                              disabled={savingTeaching}
                              className="text-[13px] text-[#5C4A3A] hover:text-[#2A241C] transition-colors disabled:opacity-50"
                            >
                              {savingTeaching ? 'Saving…' : 'Save Teaching'}
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    <p className="leading-relaxed text-[#3F362E]">
                      You can save any Teaching that matters to you, from any room in the house.
                      You can also attach a note to it as a reference or observation.
                    </p>

                    {teachingNumber && (
                      <div className="space-y-1.5">
                        <label className="text-sm text-[#6B5E54]">Note for this Teaching</label>
                        <textarea
                          value={memo}
                          onChange={(e) => setMemo(e.target.value)}
                          placeholder='e.g. "Send this one to Mary" or "Dad would like this"'
                          rows={2}
                          className="w-full px-3 py-2 bg-white border border-[#D4C8B0] rounded-sm text-[13px] text-[#2A241C] placeholder:text-[#A39682] focus:outline-none focus:border-[#8A7B65] resize-none"
                        />
                        <button
                          onClick={handleSaveMemo}
                          disabled={savingMemo}
                          className="text-[13px] text-[#5C4A3A] hover:text-[#2A241C] transition-colors disabled:opacity-50"
                        >
                          {savingMemo ? 'Saving…' : 'Save note'}
                        </button>
                      </div>
                    )}

                    {teachingNumber && (
                      <div className="space-y-1.5">
                        <label className="text-sm text-[#6B5E54]">Send this Teaching to someone</label>
                        <input
                          type="email"
                          value={sendTo}
                          onChange={(e) => {
                            setSendTo(e.target.value)
                            setSendStatus('idle')
                          }}
                          placeholder="email@example.com"
                          className="w-full px-3 py-2 bg-white border border-[#D4C8B0] rounded-sm text-[13px] text-[#2A241C] placeholder:text-[#A39682] focus:outline-none focus:border-[#8A7B65]"
                        />
                        <button
                          onClick={handleSendToSomeone}
                          disabled={!sendTo.trim() || sendingToSomeone}
                          className="text-[13px] text-[#5C4A3A] hover:text-[#2A241C] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          {sendingToSomeone ? 'Sending…' : sendStatus === 'sent' ? 'Sent' : 'Send Teaching'}
                        </button>
                        {sendStatus === 'error' && (
                          <p className="text-[12px] text-red-700">Unable to send right now.</p>
                        )}
                      </div>
                    )}

                    <div>
                      <div className="text-sm text-[#6B5E54] mb-1.5">Your saved Teachings</div>
                      <div className="max-h-36 overflow-y-auto border border-[#E0D5C0] rounded-sm bg-white/70">
                        {loadingList ? (
                          <div className="p-3 text-sm text-[#8A7B65]">Loading…</div>
                        ) : savedList.length === 0 ? (
                          <div className="p-3 text-sm text-[#8A7B65]">No Teachings saved yet.</div>
                        ) : (
                          savedList.map((item) => {
                            const isCurrent = item.teaching_number === teachingNumber
                            return (
                              <Link
                                key={item.id}
                                href={`/teachings/${item.teaching_number}`}
                                className={`block px-3 py-2.5 border-b border-[#EDE6D9] last:border-b-0 hover:bg-[#F7F1E6] transition-colors ${
                                  isCurrent ? 'bg-[#EDE4D4]' : ''
                                }`}
                              >
                                <div className={`text-[11px] tracking-wide uppercase ${isCurrent ? 'font-medium text-[#2A241C]' : 'text-[#2A241C]'}`}>
                                  {item.teachings?.title || `Teaching ${item.teaching_number}`}
                                </div>
                                <div className="text-[11px] text-[#8A7B65] mt-0.5">
                                  {item.teachings?.date}
                                </div>
                                {item.memo && (
                                  <div className="text-[11px] text-[#6B5E54] mt-0.5 italic">
                                    {item.memo}
                                  </div>
                                )}
                              </Link>
                            )
                          })
                        )}
                      </div>
                    </div>

                    <button
                      onClick={onClose}
                      className="w-full py-2 mt-1 border border-[#C9B896] text-[#2A241C] text-[14px] rounded-sm hover:bg-[#EDE4D4] transition-colors"
                    >
                      I’m Done
                    </button>
                  </div>
                ) : status === 'key-sent' ? (
                  <div className="space-y-4 text-center">
                    <p className="leading-relaxed text-[#3F362E]">
                      A key has been sent to<br />
                      <span className="font-medium text-[#2A241C]">{savedEmail}</span>
                    </p>
                    <p className="text-[13px] leading-relaxed text-[#6B5E54]">
                      Please open your email and click “Confirm” on the link.<br />
                      You will then be returned to your Special Collection.
                    </p>
                    <p className="text-[12px] text-[#8A7B65]">
                      Waiting for confirmation…
                    </p>
                    <button
                      onClick={onClose}
                      className="w-full py-2 border border-[#C9B896] text-[#2A241C] text-[14px] rounded-sm hover:bg-[#EDE4D4] transition-colors"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-center leading-relaxed text-[#3F362E] mb-5">
                      If you enter your email address, we will reserve a Special Collections Reading Room in your name for any Teachings you wish to save. This does not require a password or any payment, but it will require you to respond to an email we send you to validate your email address.
                    </p>
                    <form onSubmit={handleSubmit}>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full px-3 py-2 mb-3 bg-white border border-[#D4C8B0] rounded-sm text-[#2A241C] placeholder:text-[#A39682] focus:outline-none focus:border-[#8A7B65]"
                        disabled={status === 'sending'}
                      />
                      <button
                        type="submit"
                        disabled={status === 'sending'}
                        className="w-full py-2 mb-2 bg-[#2A241C] text-[#F7F1E6] text-[14px] tracking-wide rounded-sm hover:bg-[#3F362E] transition-colors disabled:opacity-60"
                      >
                        {status === 'sending' ? 'Sending…' : 'Send'}
                      </button>
                      <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-2 border border-[#C9B896] text-[#2A241C] text-[14px] rounded-sm hover:bg-[#EDE4D4] transition-colors"
                      >
                        Not Now, Thanks
                      </button>
                      {message && status === 'error' && (
                        <p className="mt-3 text-center text-sm text-red-700">{message}</p>
                      )}
                      <p className="mt-5 text-center text-[11px] leading-relaxed text-[#8A7B65]">
                        We only use your email to remember what you want to save.
                        We do not sell, trade or give away any personal information associated with your email.
                      </p>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}