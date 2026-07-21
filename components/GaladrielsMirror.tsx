'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'

type Props = {
  videoUrl: string
  title: string
}

export default function GaladrielsMirror({ videoUrl, title }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [showVideo, setShowVideo] = useState(false)
  const [position, setPosition] = useState({ x: 100, y: 80 })
  const [isDragging, setIsDragging] = useState(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!isOpen) {
      setShowVideo(false)
      return
    }

    if (typeof window !== 'undefined') {
      setPosition({
        x: Math.max(20, window.innerWidth / 2 - 340),
        y: Math.max(20, window.innerHeight / 2 - 260),
      })
    }

    const timer = setTimeout(() => setShowVideo(true), 900)
    return () => clearTimeout(timer)
  }, [isOpen])

  useEffect(() => {
    if (showVideo && videoRef.current) {
      const v = videoRef.current
      v.muted = true
      v.playsInline = true
      v.currentTime = 0
      v.play()
        .then(() => {
          v.muted = false
        })
        .catch(() => {})
    }
  }, [showVideo])

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const onEnded = () => {
      setTimeout(() => {
        setShowVideo(false)
      }, 1000)
    }

    video.addEventListener('ended', onEnded)
    return () => video.removeEventListener('ended', onEnded)
  }, [showVideo])

  const handleSurfaceClick = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    const v = videoRef.current
    if (!v) return

    if (!showVideo) {
      setShowVideo(true)
    } else {
      if (v.paused) {
        v.play().catch(() => {})
      } else {
        v.pause()
      }
    }
  }

  // --- Unified pointer / touch drag ---
  const onPointerDown = (e: React.PointerEvent) => {
    // Don’t start drag on the video surface or close button
    if ((e.target as HTMLElement).closest('video, button')) return

    e.preventDefault()
    e.stopPropagation()

    setIsDragging(true)
    dragStart.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    }

    // Capture the pointer so we keep receiving events even if finger leaves the element
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return
    e.preventDefault()
    setPosition({
      x: e.clientX - dragStart.current.x,
      y: e.clientY - dragStart.current.y,
    })
  }

  const onPointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return
    setIsDragging(false)
    try {
      ;(e.target as HTMLElement).releasePointerCapture(e.pointerId)
    } catch {}
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="group inline-flex items-center gap-3 text-[13px] tracking-wide text-[#5C4A3A] hover:text-[#2A241C] transition-colors mt-1 mb-3"
        title="Look into Galadriel’s Mirror"
      >
        <Image
          src="/images/galadriel-icon.png"
          alt=""
          width={68}
          height={68}
          className="opacity-90 group-hover:opacity-100 transition-opacity object-contain"
        />
        <span className="border-b border-transparent group-hover:border-[#C9B896] pb-0.5">
          Galadriel’s Mirror
        </span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 pointer-events-auto"
            onClick={() => setIsOpen(false)}
          />

          {/* The Mirror */}
          <div
            className="absolute pointer-events-auto touch-none"
            style={{
              left: position.x,
              top: position.y,
              width: 'min(680px, 95vw)',
              cursor: isDragging ? 'grabbing' : 'grab',
              userSelect: 'none',
              WebkitUserSelect: 'none',
            }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-[0_25px_60px_-12px_rgba(0,0,0,0.55)] border border-[#C9B896]/40">
              <div className="relative w-full aspect-[3/2] select-none">
                <Image
                  src="/images/galadriels-mirror.jpg"
                  alt="Galadriel’s Mirror"
                  fill
                  className="object-cover"
                  priority
                  sizes="680px"
                />

                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-3 right-3 z-30 w-8 h-8 flex items-center justify-center rounded-full bg-black/50 text-white/90 hover:bg-black/70 text-sm"
                >
                  ✕
                </button>

                <div
                  className="absolute overflow-hidden transition-opacity duration-[2000ms] cursor-pointer"
                  style={{
                    left: '22.3%',
                    right: '22.3%',
                    top: '33%',
                    bottom: '25.5%',
                    borderRadius: '50%',
                    opacity: showVideo ? 1 : 0,
                    backgroundColor: '#8a9aa8',
                  }}
                  onClick={handleSurfaceClick}
                >
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    playsInline
                    className="w-full h-full object-cover scale-[1.45]"
                  />
                </div>
              </div>
            </div>

            <div className="mt-2 text-center text-[12px] tracking-wide text-[#6B5E54]">
              {title}
            </div>
          </div>
        </div>
      )}
    </>
  )
}