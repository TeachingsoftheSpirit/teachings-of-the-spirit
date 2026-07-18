import Link from 'next/link'
import Header from '@/components/Header'

export default function QuotesPage() {
  return (
    <main className="min-h-screen bg-[#F7F4EF]">
      <Header active="quotes" />
      <div className="max-w-4xl mx-auto px-6 pt-10">
        <h1 className="text-4xl font-medium tracking-tight text-[#2C2522] mb-2 text-center">
          Quotes
        </h1>
        <p className="text-center text-[#6B5E54] mb-10">
          A mesmerizing look into the mind of God
        </p>
        {/* Quotes list will go here - restored in next step if needed */}
        <p className="text-center text-[#6B5E54]">
          Quotes content restored. Click any title to read the full teaching.
        </p>
      </div>
    </main>
  )
}