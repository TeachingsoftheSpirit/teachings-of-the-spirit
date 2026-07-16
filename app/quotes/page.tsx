import Link from 'next/link'

type Quote = {
  text: string
  title: string
  date: string
  category: string
  teachingNumber?: number
}

const quotes: Quote[] = [
  {
    text: `The world knows some of what you pen, and certainly the Scriptures bring similar messages. Yet this is new and fresh, my son… an update of the Lord’s thoughts… a new quickening of the Holy Spirit. They will not counter, these messages, the missive of the Scriptures, but they will illuminate. New times bring new truths. Yet new truths are old truths in new guise, for all truth IS.`,
    title: "Read the Messages",
    date: "May 20, 1979",
    category: "Truth",
    teachingNumber: 72,
  },
  {
    text: `This time is important… the time of writing. Here is where the instruction comes. This is your school… and My School. I teach you here, but I shall not be away at all other times. Your ear will hear, your mind will discern… and your lips will begin to proclaim… and your life will shine.
Worry not about this mingling. It will be bothersome for a time, but such is always the case when I urge someone from one rhythm to another… from their own rhythm to Mine.`,
    title: "Rhythm",
    date: "May 22, 1979",
    category: "Rhythm",
    teachingNumber: 74,
  },
  {
    text: `Why do I come? Because I want to. I have chosen you to do a task. Is it important? Is it unimportant? It is simply MY TASK. Do your part faithfully, because I purpose it.`,
    title: "Time Is Now",
    date: "May 24, 1979",
    category: "Commitment",
    teachingNumber: 76,
  },
  {
    text: `Within you (and within each who calls My name) I am… and worry not over whether it is a small Me or the Mighty Me. It is both/and, not either/or. I can talk with you intimately and patiently and yet manage the Universe as well. I am the Lord, and conceptions of Me can never contain Me. Remember this: there is NOTHING I cannot accomplish. EVERYTHING is possible.`,
    title: "Select The Channel",
    date: "May 25, 1979",
    category: "Both/And",
    teachingNumber: 77,
  },
  {
    text: `Death is My other door. You move out of one of My realms at birth, and at death you pass through another door into another non-earthly existence. Life continues. Death is an end and yet it is also a beginning… as is each new day.`,
    title: "Death",
    date: "November 27, 1979",
    category: "Death",
    teachingNumber: 86,
  },
  {
    text: `I, the Holy Spirit, work in many ways. I interpret and reteach ways of living and believing that I offered as Jesus, but I am not limited to these.`,
    title: "Christ, The Spirit",
    date: "April 19, 1985",
    category: "Jesus",
    teachingNumber: 796,
  },
  {
    text: `Grace is My given way. It is free access to Me, with no strings that I attach.`,
    title: "Grace, Again",
    date: "August 10, 1980",
    category: "Grace",
    teachingNumber: 117,
  },
  {
    text: `The first premise: God the Lord is One and Supreme.
The second premise: the essence of life is spirit.
The third premise: Grace is the shortest way to reunion with Me.`,
    title: "Three Premises",
    date: "June 28, 1984",
    category: "Grace",
    teachingNumber: 737,
  },
  {
    text: `Keep your hand in Mine. This is one way of stating the most important aspect of lifestyle.`,
    title: "Lifestyle",
    date: "November 9, 1984",
    category: "The Spirit",
    teachingNumber: 772,
  },
  {
    text: `Spirit is the essence of life, o son, and as spirit matures life takes on greater value and can be lived more consciously and more fully.`,
    title: "On Spiritual Maturity",
    date: "August 8, 1982",
    category: "The Spirit",
    teachingNumber: 443,
  },
]

const categories = Array.from(new Set(quotes.map(q => q.category))).sort()

type Props = {
  searchParams: Promise<{ category?: string }>
}

export default async function QuotesPage({ searchParams }: Props) {
  const { category } = await searchParams
  const activeCategory = category || null

  const filteredQuotes = activeCategory
    ? quotes.filter(q => q.category === activeCategory)
    : quotes

  return (
    <main className="min-h-screen bg-[#F7F4EF]">
      <div className="max-w-3xl mx-auto px-6 sm:px-10 py-16 sm:py-24">

        <nav className="mb-10 flex items-center gap-4 text-sm text-[#6B5E54]">
          <Link href="/" className="hover:text-[#2C2522] transition-colors">Home</Link>
          <span className="text-[#E5DFD5]">·</span>
          <Link href="/quotes" className="hover:text-[#2C2522] transition-colors">Quotes</Link>
          <span className="text-[#E5DFD5]">·</span>
          <Link href="/search" className="hover:text-[#2C2522] transition-colors">Search</Link>
        </nav>

        <header className="mb-14 text-center">
          <h1 className="text-3xl sm:text-4xl font-medium tracking-tight text-[#2C2522] mb-3">
            Quotes
          </h1>
          <p className="text-[#6B5E54] text-lg italic">
            A Mesmerizing Look into the Mind of God
          </p>
        </header>

        {/* Category filters */}
        <div className="mb-14">
          <div className="flex flex-wrap gap-2 justify-center">
            <Link
              href="/quotes"
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                !activeCategory
                  ? 'bg-[#2C2522] text-[#F7F4EF] border-[#2C2522]'
                  : 'bg-transparent text-[#6B5E54] border-[#E5DFD5] hover:border-[#6B5E54]'
              }`}
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/quotes?category=${encodeURIComponent(cat)}`}
                className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                  activeCategory === cat
                    ? 'bg-[#2C2522] text-[#F7F4EF] border-[#2C2522]'
                    : 'bg-transparent text-[#6B5E54] border-[#E5DFD5] hover:border-[#6B5E54]'
                }`}
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-16">
          {filteredQuotes.map((quote, index) => (
            <blockquote key={index}>
              <p className="text-[#2C2522] text-lg leading-[1.85] whitespace-pre-wrap mb-5">
                “{quote.text}”
              </p>
              <footer className="text-sm text-[#6B5E54] flex flex-wrap items-center gap-x-3 gap-y-1">
                {quote.teachingNumber ? (
                  <Link
                    href={`/teachings/${quote.teachingNumber}`}
                    className="hover:text-[#7A3E3E] transition-colors"
                  >
                    — {quote.title}
                  </Link>
                ) : (
                  <span>— {quote.title}</span>
                )}
                <span>·</span>
                <span>{quote.date}</span>
                <span>·</span>
                <Link
                  href={`/quotes?category=${encodeURIComponent(quote.category)}`}
                  className="text-[#7A3E3E] hover:underline"
                >
                  {quote.category}
                </Link>
              </footer>
            </blockquote>
          ))}
        </div>

        <footer className="mt-24 pt-10 border-t border-[#E5DFD5] text-center text-sm text-[#6B5E54]">
          {activeCategory
            ? `${filteredQuotes.length} quote${filteredQuotes.length !== 1 ? 's' : ''} in “${activeCategory}”`
            : `${quotes.length} selected quotes`}
        </footer>
      </div>
    </main>
  )
}