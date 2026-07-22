'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Header from '@/components/Header'

export default function VerifiedPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-[#F7F4EF]">
      <Header />

      <div className="max-w-lg mx-auto px-6 pt-16 pb-20 text-center">
        <div className="rounded-2xl border border-[#E5DFD3] bg-white/60 shadow-sm overflow-hidden">
          <div className="relative w-full aspect-[5/3] bg-[#f5f0e6]">
            <Image
              src="/doors-of-durin-full.JPG"
              alt="Doors of Durin"
              fill
              className="object-cover object-top"
              sizes="500px"
              priority
            />
          </div>

          <div className="p-8">
            <h1 className="text-2xl font-medium text-[#2C2522] mb-4">
              Thank you for verifying
            </h1>

            <p className="text-[#6B5E54] leading-relaxed mb-6">
              Your Special Collections room is now open.
              <br /><br />
              You can safely close this tab.
              <br />
              Return to the window where you began — the Special Collections
              icon is already waiting in the top right.
            </p>

            <button
              onClick={() => window.close()}
              className="w-full py-3 rounded-lg bg-[#2C2522] text-[#F7F4EF] text-sm tracking-wide hover:bg-[#3d342f] transition-colors"
            >
              Close this tab
            </button>

            <button
              onClick={() => router.push('/')}
              className="w-full mt-3 py-2 text-sm text-[#6B5E54] hover:text-[#2C2522] transition-colors"
            >
              Or continue here
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}