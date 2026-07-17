import Header from '@/components/Header'

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-[#F7F4EF]">
      <Header active="search" />

      <div className="max-w-3xl mx-auto px-6 pt-8 pb-6 text-center">
        <h1 className="text-4xl font-medium tracking-tight text-[#2C2522]">
          Search
        </h1>
        <p className="mt-2 text-lg text-[#6B5E54] italic">
          Search across all 3,298 teachings
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-16 content-area rounded-xl p-8">
        <div className="max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search teachings..."
            className="w-full px-5 py-3 rounded-full border border-[#C9BEB0] bg-white/70 text-[#2C2522] placeholder-[#6B5E54] focus:outline-none focus:border-[#7A3E3E] transition-colors"
          />
          <p className="mt-4 text-center text-[#6B5E54] text-sm">
            Search functionality coming soon...
          </p>
        </div>
      </div>
    </main>
  )
}