import Header from '@/components/Header'
import Link from 'next/link'

export default function Home() {
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

      <div className="max-w-3xl mx-auto px-6 pt-10 pb-8 text-center">
        <h1 className="text-4xl font-medium tracking-tight text-[#2C2522] mb-3">
          Teachings of the Spirit
        </h1>
        <p className="text-lg text-[#6B5E54] italic mb-8">
          A private library of spiritual teachings received over many years
        </p>

        {/* Search bar */}
        <form action="/search" method="GET" className="max-w-md mx-auto mb-8">
          <input
            type="text"
            name="q"
            placeholder="Search the teachings..."
            className="w-full px-5 py-3 rounded-full border border-[#C9BEB0] bg-white/70 text-[#2C2522] placeholder-[#6B5E54] focus:outline-none focus:border-[#7A3E3E] transition-colors text-base"
          />
        </form>
      </div>

      {/* 5 Evocative Titles - Left justified */}
      <div className="max-w-3xl mx-auto px-6 pb-10">
        <div className="max-w-md mx-auto space-y-1 mb-4 text-left pl-12">
          {evocativeTitles.map((t) => (
            <Link
              key={t.number}
              href={`/teachings/${t.number}`}
              className="block py-2 text-xl text-[#2C2522] hover:text-[#7A3E3E] transition-colors"
            >
              {t.title} <span className="text-base text-[#6B5E54]">— {t.date}</span>
            </Link>
          ))}
        </div>
        <div className="text-center">
          <Link href="/titles" className="text-sm text-[#6B5E54] hover:text-[#7A3E3E]">
            See all titles →
          </Link>
        </div>
      </div>

      {/* 5 Circles on smile-shaped cylindrical path */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <div className="flex justify-center items-end gap-12 relative h-32">
          <div className="w-16 h-16 rounded-full bg-[#D4C9B8] border border-[#C9BEB0] shadow-md translate-y-8 -rotate-12"></div>
          <div className="w-20 h-20 rounded-full bg-[#D4C9B8] border border-[#C9BEB0] shadow-md translate-y-4 -rotate-6"></div>
          <div className="w-24 h-24 rounded-full bg-[#D4C9B8] border border-[#C9BEB0] shadow-md"></div>
          <div className="w-20 h-20 rounded-full bg-[#D4C9B8] border border-[#C9BEB0] shadow-md translate-y-4 rotate-6"></div>
          <div className="w-16 h-16 rounded-full bg-[#D4C9B8] border border-[#C9BEB0] shadow-md translate-y-8 rotate-12"></div>
        </div>
      </div>
    </main>
  )
}