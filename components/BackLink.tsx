'use client'

import { useRouter } from 'next/navigation'

export default function BackLink({ fallback = '/' }: { fallback?: string }) {
  const router = useRouter()

  return (
    <button
      type="button"
      onClick={() => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
          router.back()
        } else {
          router.push(fallback)
        }
      }}
      className="text-sm text-[#6B5E54] hover:text-[#7A3E3E] transition-colors"
    >
      ← Back
    </button>
  )
}