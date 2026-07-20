'use client'

import { useState } from 'react'
import EmailCapture from './EmailCapture'

type Props = {
  teachingNumber: number
  teachingTitle: string
}

export default function SaveTeachingButton({ teachingNumber, teachingTitle }: Props) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="
          relative text-sm tracking-wide
          text-[#5C4A3A] hover:text-[#2A241C]
          transition-all duration-300
          after:absolute after:left-0 after:right-0 after:-bottom-0.5
          after:h-px after:bg-[#C9A87C]/40
          after:scale-x-0 hover:after:scale-x-100
          after:transition-transform after:duration-300
          hover:drop-shadow-[0_0_8px_rgba(201,168,124,0.55)]
          hover:drop-shadow-[0_0_16px_rgba(255,230,180,0.35)]
        "
      >
        Save this Teaching to your personal collection
      </button>
      <EmailCapture
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        teachingNumber={teachingNumber}
        teachingTitle={teachingTitle}
      />
    </>
  )
}