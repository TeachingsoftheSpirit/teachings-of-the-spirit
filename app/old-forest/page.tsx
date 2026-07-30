import Header from '@/components/Header'
import Image from 'next/image'
import Link from 'next/link'

export default function OldForestPage() {
  return (
    <main className="min-h-screen bg-[#F7F4EF]">
      <Header />
      <div className="max-w-2xl mx-auto px-6 pt-16 pb-24 text-center">
        <h1 className="text-2xl font-medium text-[#2C2522] mb-8 tracking-wide">
          T. Bombadil, Eldest
        </h1>

        <div className="mb-10 flex justify-center">
          <Image
            src="/images/tom-bombadil.jpg"
            alt="Tom Bombadil"
            width={420}
            height={560}
            className="rounded-sm shadow-[0_4px_24px_rgba(44,37,34,0.15)] border border-[#D4CBBF]"
            priority
          />
        </div>

        <p className="text-[#6B5E54] text-[17px] leading-relaxed mb-10 max-w-md mx-auto">
          He was here before the river and the trees.<br />
          He remembers the first raindrop.
        </p>

        <Link
          href="/"
          className="text-sm text-[#6B5E54] hover:text-[#2C2522] underline underline-offset-2 transition-colors"
        >
          Return to the house
        </Link>
      </div>
    </main>
  )
}