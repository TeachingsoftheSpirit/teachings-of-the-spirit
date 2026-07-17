import Header from '@/components/Header'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F7F4EF]">
      <Header active="home" />

      {/* Hero / Title Section */}
      <div className="max-w-3xl mx-auto px-6 pt-10 pb-8 text-center">
        <h1 className="text-4xl font-medium tracking-tight text-[#2C2522] mb-3">
          Teachings of the Spirit
        </h1>
        <p className="text-lg text-[#6B5E54] italic mb-8">
          A private library of spiritual teachings received over many years
        </p>

        {/* Search bar */}
        <div className="max-w-md mx-auto mb-12">
          <input
            type="text"
            placeholder="Search the teachings..."
            className="w-full px-5 py-3 rounded-full border border-[#C9BEB0] bg-white/70 text-[#2C2522] placeholder-[#6B5E54] focus:outline-none focus:border-[#7A3E3E] transition-colors text-base"
          />
        </div>
      </div>

      {/* Quick Access Cards */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Quotes Card */}
          <Link href="/quotes" className="group block p-6 rounded-2xl border border-[#C9BEB0] hover:border-[#7A3E3E] transition-all bg-white/60 hover:bg-white">
            <div className="text-xl font-medium text-[#2C2522] group-hover:text-[#7A3E3E] mb-2">
              Quotes
            </div>
            <p className="text-[#6B5E54] text-sm">
              Powerful one-liners pulled from the teachings
            </p>
          </Link>

          {/* Browse by Year Card */}
          <Link href="/browse" className="group block p-6 rounded-2xl border border-[#C9BEB0] hover:border-[#7A3E3E] transition-all bg-white/60 hover:bg-white">
            <div className="text-xl font-medium text-[#2C2522] group-hover:text-[#7A3E3E] mb-2">
              Browse by Year
            </div>
            <p className="text-[#6B5E54] text-sm">
              Explore teachings from 1979 to 2003
            </p>
          </Link>

          {/* All Titles Card */}
          <Link href="/titles" className="group block p-6 rounded-2xl border border-[#C9BEB0] hover:border-[#7A3E3E] transition-all bg-white/60 hover:bg-white">
            <div className="text-xl font-medium text-[#2C2522] group-hover:text-[#7A3E3E] mb-2">
              All Titles
            </div>
            <p className="text-[#6B5E54] text-sm">
              Scroll through every teaching title
            </p>
          </Link>
        </div>
      </div>

      {/* Welcome Text */}
      <div className="max-w-3xl mx-auto px-6 pb-16">
        <div className="content-area rounded-2xl p-8">
          <div className="prose prose-lg max-w-none text-[#2C2522]">
            <p>
              Welcome to a quiet library of teachings received over many years.
              These words were given in the early morning hours, recorded as they came.
            </p>
            <p>
              You may explore them by searching, browsing by year, reading curated quotes,
              or simply scrolling through the titles — many of which are profound in themselves.
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}