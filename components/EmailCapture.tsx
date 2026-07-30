'use client'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { openDesk } from './DeskOverlay'

type Props = {
  isOpen: boolean
  onClose: () => void
  intent?: 'save' | 'general'
  teachingNumber?: number
  teachingTitle?: string
  onSuccess?: (email: string) => void
}

type HouseMessage = {
  id: string
  email: string
  direction: 'from_admin' | 'from_member'
  body: string
  created_at: string
  read_at: string | null
  created_by: string | null
  kind: string
}

function kindLabel(kind: string) {
  if (kind === 'gift') return 'Gift'
  if (kind === 'comp') return 'Comp'
  if (kind === 'support') return 'Support'
  if (kind === 'reply') return 'Reply'
  return 'Note'
}

export default function EmailCapture({
  isOpen,
  onClose,
  intent = 'general',
  onSuccess,
}: Props) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<
    'idle' | 'sending' | 'key-sent' | 'verified' | 'success' | 'error'
  >('idle')
  const [message, setMessage] = useState('')
  const [savedEmail, setSavedEmail] = useState('')
  const [checkingSession, setCheckingSession] = useState(false)
  const [membershipTier, setMembershipTier] = useState<string | null>(null)
  const [billingInterval, setBillingInterval] = useState<string | null>(null)
  const [houseMessages, setHouseMessages] = useState<HouseMessage[]>([])
  const [houseUnread, setHouseUnread] = useState(0)
  const [houseLoading, setHouseLoading] = useState(false)
  const [houseReply, setHouseReply] = useState('')
  const [houseReplyStatus, setHouseReplyStatus] = useState<
    'idle' | 'sending' | 'sent' | 'error'
  >('idle')
  const [houseReplyError, setHouseReplyError] = useState('')
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)
  const onSuccessRef = useRef(onSuccess)
  onSuccessRef.current = onSuccess

  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      const width = 460
      setPosition({
        x: Math.max(20, window.innerWidth - width - 50),
        y: Math.max(20, 70),
      })
    }
  }, [isOpen])

  const fetchHouseMessages = async () => {
    setHouseLoading(true)
    try {
      const res = await fetch('/api/messages')
      if (!res.ok) {
        setHouseMessages([])
        setHouseUnread(0)
        return
      }
      const data = await res.json()
      const list: HouseMessage[] = data.messages || []
      setHouseMessages(list)
      setHouseUnread(data.unread || 0)
      const unreadIds = list
        .filter((m) => m.direction === 'from_admin' && !m.read_at)
        .map((m) => m.id)
      if (unreadIds.length > 0) {
        await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'mark_read', ids: unreadIds }),
        })
        setHouseUnread(0)
        setHouseMessages((prev) =>
          prev.map((m) =>
            unreadIds.includes(m.id)
              ? { ...m, read_at: new Date().toISOString() }
              : m
          )
        )
      }
    } catch (err) {
      console.error(err)
    } finally {
      setHouseLoading(false)
    }
  }

  useEffect(() => {
    if (!isOpen) {
      setStatus('idle')
      setMessage('')
      setEmail('')
      setSavedEmail('')
      setCheckingSession(false)
      setMembershipTier(null)
      setBillingInterval(null)
      setHouseMessages([])
      setHouseUnread(0)
      setHouseReply('')
      setHouseReplyStatus('idle')
      setHouseReplyError('')
      setIsDragging(false)
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
      return
    }
    const checkSession = async () => {
      setCheckingSession(true)
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user?.email) {
        setSavedEmail(user.email)
        setStatus('success')
        const { data: profile } = await supabase
          .from('profiles')
          .select('subscription_status, billing_interval')
          .eq('email', user.email.trim().toLowerCase())
          .maybeSingle()
        setMembershipTier(profile?.subscription_status || null)
        setBillingInterval(profile?.billing_interval || null)
        await fetchHouseMessages()
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
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user?.email) {
        if (pollRef.current) {
          clearInterval(pollRef.current)
          pollRef.current = null
        }
        setSavedEmail(user.email)
        setStatus('verified')
        onSuccessRef.current?.(user.email)
      }
    }, 2500)
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current)
        pollRef.current = null
      }
    }
  }, [status])

  const beginDrag = (e: React.MouseEvent) => {
    const t = e.target as HTMLElement
    if (
      t.closest('input, textarea, button, a, select, [data-no-drag], label')
    ) {
      return
    }
    if (!t.closest('[data-drag-surface]')) return
    e.preventDefault()
    setIsDragging(true)
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    }
  }

  useEffect(() => {
    if (!isDragging) return
    const onMouseMove = (e: MouseEvent) => {
      setPosition({
        x: e.clientX - dragStart.current.x,
        y: e.clientY - dragStart.current.y,
      })
    }
    const onMouseUp = () => setIsDragging(false)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
    }
  }, [isDragging])

  if (!isOpen) return null

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

  const handleManageMembership = () => {
    window.location.href = '/membership/manage'
  }

  const handleManageCollection = () => {
    openDesk()
    onClose()
  }

  const handleHouseReply = async () => {
    if (!houseReply.trim() || houseReplyStatus === 'sending') return
    setHouseReplyStatus('sending')
    setHouseReplyError('')
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reply', body: houseReply.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Could not send reply')
      setHouseReply('')
      setHouseReplyStatus('sent')
      await fetchHouseMessages()
    } catch (err: any) {
      setHouseReplyStatus('error')
      setHouseReplyError(err.message || 'Could not send reply')
    }
  }

  const isPaidMember =
    membershipTier === 'house_brew' || membershipTier === 'private_reserve'

  const renderTitle = () => {
    if (status === 'key-sent') return 'A Key Has Been Sent'
    if (status === 'verified') return 'Thank you'
    if (status !== 'success') return 'A Library Card'
    let tierLabel = ''
    if (membershipTier === 'house_brew') tierLabel = 'House Brew'
    else if (membershipTier === 'private_reserve') tierLabel = 'Private Reserve'
    if (!tierLabel) return 'Special Collections'
    let intervalLabel = ''
    if (billingInterval === 'monthly') intervalLabel = 'Monthly'
    else if (billingInterval === 'annual') intervalLabel = 'Annual'
    return (
      <>
        Special Collections – {tierLabel}
        {intervalLabel && (
          <span className="text-[11px] text-[#3F362E] font-normal">
            {' '}
            – {intervalLabel}
          </span>
        )}
      </>
    )
  }

  const panelClass =
    'bg-[#E8DFD0]/72 border border-[#B8A990]/80 rounded-sm shadow-xl flex flex-col h-full overflow-hidden backdrop-blur-[2px]'
  const linkBtn =
    'text-[12px] text-[#2A241C] hover:text-[#1a1614] underline underline-offset-2 transition-colors'

  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div
        className="absolute inset-0 bg-black/10 pointer-events-auto"
        onClick={onClose}
      />
      <div
        ref={cardRef}
        data-drag-surface
        className="absolute pointer-events-auto select-none"
        style={{
          left: position.x,
          top: position.y,
          width: '460px',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={beginDrag}
      >
        <div
          className="relative w-full rounded-sm overflow-hidden shadow-2xl"
          style={{ height: '640px' }}
        >
          <Image
            src="/doors-of-durin-full.JPG"
            alt="Doors of Durin"
            fill
            className="object-contain object-top bg-[#f5f0e6] pointer-events-none"
            priority
            sizes="460px"
            draggable={false}
          />
          <div
            className="absolute left-[5.1rem] right-[5.1rem] bottom-5 top-[255px] flex flex-col"
            data-no-drag
            style={{ cursor: 'default' }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className={panelClass}>
              <div
                className="flex items-center justify-between px-4 py-2.5 border-b border-[#C9BDA8]/70 bg-[#D9CFBC]/55 select-none shrink-0"
                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                onMouseDown={(e) => {
                  e.stopPropagation()
                  setIsDragging(true)
                  dragStart.current = {
                    x: e.clientX - position.x,
                    y: e.clientY - position.y,
                  }
                }}
              >
                <div className="text-[13px] font-medium text-[#2A241C] tracking-wide">
                  {renderTitle()}
                </div>
                <button
                  onClick={onClose}
                  className="text-[#3F362E] hover:text-[#2A241C] text-sm transition-colors px-1"
                  style={{ cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>
              <div
                className="px-4 py-4 overflow-y-auto flex-1 text-[13px] text-[#2A241C]"
                data-no-drag
                style={{ cursor: 'default' }}
              >
                {checkingSession ? (
                  <div className="py-8 text-center text-[#3F362E]">
                    Opening your room…
                  </div>
                ) : status === 'verified' ? (
                  <div className="space-y-5 text-center py-4">
                    <h3 className="text-lg font-medium text-[#2A241C]">
                      Thank you for verifying
                    </h3>
                    <p className="leading-relaxed text-[#2A241C]">
                      Your room is open.
                      <br />
                      <br />
                      The <strong>Desk</strong> icon (top right) holds Teachings
                      you save. Special Collections is for the house —
                      membership and messages.
                    </p>
                    <button
                      onClick={onClose}
                      className="w-full py-2 border border-[#B8A990] text-[#2A241C] text-[14px] rounded-sm hover:bg-[#E8DFD0]/80 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                ) : status === 'success' ? (
                  <div className="space-y-4">
                    <p className="text-[12px] text-[#3F362E] leading-relaxed">
                      Signed in as{' '}
                      <span className="font-medium text-[#2A241C]">
                        {savedEmail}
                      </span>
                    </p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      <button
                        type="button"
                        onClick={handleManageCollection}
                        className={linkBtn}
                      >
                        Manage Collection
                      </button>
                      {isPaidMember && (
                        <button
                          type="button"
                          onClick={handleManageMembership}
                          className={linkBtn}
                        >
                          Manage Membership
                        </button>
                      )}
                    </div>
                    <div className="border-t border-[#A89880]/70" />
                    <div className="space-y-2">
                      <div className="flex items-baseline justify-between gap-2">
                        <div className="text-[13px] font-medium text-[#2A241C]">
                          Notes from the house
                        </div>
                        {houseUnread > 0 && (
                          <span className="text-[11px] text-[#7A3E3E]">
                            {houseUnread} new
                          </span>
                        )}
                      </div>
                      {houseLoading ? (
                        <div className="text-[12px] text-[#3F362E]">Loading…</div>
                      ) : houseMessages.length === 0 ? (
                        <div className="text-[12px] text-[#3F362E]">
                          No notes yet.
                        </div>
                      ) : (
                        <ul className="space-y-2 max-h-36 overflow-y-auto">
                          {houseMessages.slice(0, 6).map((msg) => (
                            <li
                              key={msg.id}
                              className={`rounded-sm px-2.5 py-2 text-[12px] leading-relaxed ${
                                msg.direction === 'from_admin'
                                  ? 'bg-[#F5F0E6]/50 border border-[#C9BDA8]/50'
                                  : 'bg-[#D9CFBC]/35'
                              }`}
                            >
                              <div className="text-[10px] tracking-wide text-[#3F362E] mb-0.5">
                                {msg.direction === 'from_admin'
                                  ? 'House'
                                  : 'You'}
                                {' · '}
                                {kindLabel(msg.kind)}
                                {' · '}
                                {new Date(msg.created_at).toLocaleString()}
                              </div>
                              <div className="text-[#2A241C] whitespace-pre-wrap">
                                {msg.body}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                      <div className="space-y-1.5 pt-1">
                        <textarea
                          value={houseReply}
                          onChange={(e) => {
                            setHouseReply(e.target.value)
                            if (houseReplyStatus === 'error')
                              setHouseReplyStatus('idle')
                          }}
                          placeholder="Reply to the house…"
                          rows={2}
                          maxLength={4000}
                          className="w-full px-3 py-2 bg-[#F5F0E6]/55 border border-[#B8A990]/80 rounded-sm text-[13px] text-[#2A241C] placeholder:text-[#3F362E] focus:outline-none focus:border-[#6B5E54] resize-none"
                        />
                        <button
                          type="button"
                          onClick={handleHouseReply}
                          disabled={
                            !houseReply.trim() ||
                            houseReplyStatus === 'sending'
                          }
                          className="text-[13px] text-[#2A241C] hover:text-[#1a1614] transition-colors disabled:opacity-40"
                        >
                          {houseReplyStatus === 'sending'
                            ? 'Sending…'
                            : 'Send reply'}
                        </button>
                        {houseReplyStatus === 'error' && houseReplyError && (
                          <p className="text-[12px] text-red-800">
                            {houseReplyError}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="w-full py-2 mt-1 border border-[#B8A990] text-[#2A241C] text-[14px] rounded-sm hover:bg-[#E8DFD0]/70 transition-colors"
                    >
                      I’m Done
                    </button>
                  </div>
                ) : status === 'key-sent' ? (
                  <div className="space-y-4 text-center">
                    <p className="leading-relaxed text-[#2A241C]">
                      A key has been sent to
                      <br />
                      <span className="font-medium">{savedEmail}</span>
                    </p>
                    <p className="text-[13px] leading-relaxed text-[#3F362E]">
                      Open your email and click “Confirm” on the link.
                    </p>
                    <button
                      onClick={onClose}
                      className="w-full py-2 border border-[#B8A990] text-[#2A241C] text-[14px] rounded-sm hover:bg-[#E8DFD0]/70 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-center leading-relaxed text-[#2A241C] mb-5">
                      {intent === 'save' ? (
                        <>
                          To Save this Teaching, you'll need your own desk.  Please enter an email address to get one.
                          <br />
                          No password and no payment required.
                          <br />
                          You'll very shortly receive an email.
<br />
  Click on the "Confirm" button and your desk will automatically appear here.
                        </>
                      ) : (
                        <>
                          Enter your email to open a quiet room in your name. No
                          password and no payment — only a short confirmation by
                          email. You can then save Teachings to your desk.
                        </>
                      )}
                    </p>
                    <form onSubmit={handleSubmit}>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full px-3 py-2 mb-3 bg-[#F5F0E6]/55 border border-[#B8A990]/80 rounded-sm text-[#2A241C] placeholder:text-[#3F362E] focus:outline-none focus:border-[#6B5E54]"
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
                        className="w-full py-2 border border-[#B8A990] text-[#2A241C] text-[14px] rounded-sm hover:bg-[#E8DFD0]/70 transition-colors"
                      >
                        Not Now, Thanks
                      </button>
                      {message && status === 'error' && (
                        <p className="mt-3 text-center text-sm text-red-800">
                          {message}
                        </p>
                      )}
                      <p className="mt-5 text-center text-[11px] leading-relaxed text-[#3F362E]">
                        We only use your email to open the rooms for you. We do
                        not sell, trade, or give away personal information.
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