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

  const mysticalCircles = [
    { theme: "Balance", link: "/titles?theme=balance" },
    { theme: "Death", link: "/titles?theme=death" },
    { theme: "Grace", link: "/titles?theme=grace" },
    { theme: "Rhythm", link: "/titles?theme=rhythm" },
    { theme: "Awareness", link: "/titles?theme=awareness" },
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

      {/* 5 Circles on smile-shaped vortex path with glow and circular text */}
      <div className="max-w-4xl mx-auto px-6 pb-16">
        <div className="flex justify-center items-end gap-10 relative h-48">
          {mysticalCircles.map((circle, index) => (
            <Link
              key={index}
              href={circle.link}
              className="group relative flex flex-col items-center"
            >
              {/* Glowing orb with mirror reflection */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-[#D4C9B8] border border-[#C9BEB0] shadow-[0_0_40px_rgba(212,201,184,0.9)] group-hover:shadow-[0_0_60px_rgba(212,201,184,1)] transition-all duration-300 group-hover:scale-110"></div>
                <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-20 h-8 bg-gradient-to-b from-white/40 to-transparent rounded-full blur-sm opacity-70"></div>
              </div>
              {/* Circular text under circle */}
              <div className="absolute -bottom-2 text-xs text-[#6B5E54] tracking-widest font-medium" style={{transform: 'rotate(-15deg)'}}>
                {circle.theme}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  )
}