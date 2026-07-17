import Header from '@/components/Header'
import Link from 'next/link'

export default function Home() {
  // These can be made dynamic later (random selection from evocative titles)
  const evocativeTitles = [
    { number: 1, title: "HERE BEGINNETH", date: "May 11, 1979" },
    { number: 86, title: "DEATH", date: "Nov. 27, 1979" },
    { number: 796, title: "CHRIST, THE SPIRIT", date: "Apr. 19, 1985" },
    { number: 1247, title: "THE FACE OF GOD", date: "Mar. 12, 1992" },
    { number: 2873, title: "I HAVE BEEN WAITING…", date: "Oct. 4, 2003" },
  ]

  return (
    <main className="min-h-screen bg-[#F7F4EF]">
      <Header active="home" />

      {/* Hero Section */}
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

      {/* Evocative Titles Section */}
      <div className="max-w-3xl mx-auto px-6 pb-12">
        <h2 className="text-xl font-medium text-[#2C2522] mb-4 text-center">
          A few titles that stand out
        </h2>
        <div className="space-y-2">
          {evocativeTitles.map((t) => (
            <Link
              key={t.number}
              href={`/teachings/${t.number}`}
              className="flex justify-between items-baseline p-4 rounded-xl border border-[#C9BEB0] hover:border-[#7A3E3E] transition-colors bg-white/60 hover:bg-white group"
            >
              <div className="flex items-baseline gap-4">
                <span className="text-[#6B5E54] text-sm tabular-nums w-12">
                  {t.number}
                </span>
                <span className="text-[#2C2522] group-hover:text-[#7A3E3E]">
                  {t.title}
                </span>
              </div>
              <span className="text-[#6B5E54] text-sm hidden sm:inline">
                {t.date}
              </span>
            </Link>
          ))}
        </div>
        <div className="text-center mt-4">
          <Link href="/titles" className="text-sm text-[#6B5E54] hover:text-[#7A3E3E]">
            See all titles →
          </Link>
        </div>
      </div>

      {/* Small evocative images section (placeholder for now) */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <div className="flex flex-wrap justify-center gap-6">
          {/* These will be small, beautiful images later */}
          <div className="w-28 h-28 bg-[#EDE7DC] rounded-full flex items-center justify-center text-[#6B5E54] text-xs text-center">
            Image 1
          </div>
          <div className="w-28 h-28 bg-[#EDE7DC] rounded-full flex items-center justify-center text-[#6B5E54] text-xs text-center">
            Image 2
          </div>
          <div className="w-28 h-28 bg-[#EDE7DC] rounded-full flex items-center justify-center text-[#6B5E54] text-xs text-center">
            Image 3
          </div>
        </div>
      </div>
    </main>
  )
}