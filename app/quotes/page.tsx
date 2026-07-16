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
    text: `Discontent is something I use, and yet also something that saddens My heart. Remember Tieboat’s statement, “Never rob a man of his despair”. This is a strong version of what I mean. Discontent is a motivating feeling. It isn’t the best, but it does move people from one state to another.`,
    title: "Discontent",
    date: "May 30, 1979",
    category: "Faith",
    teachingNumber: 82,
  },
  {
    text: `However, remember that it is not the quality of work you do that matters most to Me, but the kind of person you are. I purpose for you to be a forgiving person, one who accepts what happens, sees what is good, and happily accepts, as they are, those who have been responsible.`,
    title: "Forgive… Again",
    date: "June 1, 1979",
    category: "Forgiveness",
    teachingNumber: 32,
  },
  {
    text: `Unlikely are the ways of the Spirit. … The difficulty is that so many folks do not expect that I really act personally. So many cannot comprehend that I can do this and myriad other things “at the same time”.`,
    title: "Unlikely",
    date: "June 9, 1979",
    category: "Faith",
    teachingNumber: 62,
  },
  {
    text: `But just as human muscle power is not as reliable, as strong, or as constant as that from machines, human control and decision-making is not as reliable and appropriate as that directed by the Spirit.`,
    title: "Locus Of Control",
    date: "June 12, 1979",
    category: "The Spirit",
    teachingNumber: 36,
  },
  {
    text: `Aging, as with many aspects of human life appears to be more than it is. I say this because aging is an apparent part of a process that has an end, but the process, life, really has no end.`,
    title: "Aging",
    date: "July 1, 1979",
    category: "Eternity",
    teachingNumber: 20,
  },
  {
    text: `Death is My other door. You move out of one of My realms at birth, and at death you pass through another door into another non-earthly existence. Life continues. Death is an end and yet it is also a beginning… as is each new day.`,
    title: "Death",
    date: "November 27, 1979",
    category: "Death",
    teachingNumber: 86,
  },
  {
    text: `There is little point in knowing who you were previously. Who you are now is enough of a manifestation for you to work with. Manifest your total self as fully as you are able. Seek My help.`,
    title: "Reincarnation",
    date: "February 4, 1980",
    category: "Soul",
    teachingNumber: 143,
  },
  {
    text: `But there is another avenue to truth that I must emphasize. It is the examination of experience. There is truth to be learned in most every experience you have. Still it does not come automatically with the experience. It requires reflection… almost analysis.`,
    title: "In Search Of Truth",
    date: "February 6, 1980",
    category: "Truth",
    teachingNumber: 144,
  },
  {
    text: `The truth, of course, is that crisis is a motivator. … If your hand is in Mine the changes a crisis brings are never shattering. The crisis is always one you can surmount.`,
    title: "Crisis",
    date: "March 28, 1980",
    category: "Awareness",
    teachingNumber: 202,
  },
  {
    text: `Most fundamentally, the spirit of a person is that which seeks contact with and direction from Me. The spirit knows that there is a Spirit, and the natural tendency is to seek relationship.`,
    title: "The Unifying Dimension",
    date: "April 26, 1980",
    category: "The Spirit",
    teachingNumber: 111,
  },
  {
    text: `True enlightenment is the actual, honest feeling of spirit in every event, every artifact of life. But you cannot reach this by trying. That is an immutable spiritual principle.`,
    title: "The Unifying… Continued",
    date: "April 27, 1980",
    category: "Enlightenment",
    teachingNumber: 113,
  },
  {
    text: `Spirit is the essence of you… and of many people… Spirit is that which unifies the other dimensions into a real human being. Spirit is the essence of health.`,
    title: "The Challenge",
    date: "May 9, 1980",
    category: "Health",
    teachingNumber: 231,
  },
  {
    text: `If you are positively healthy you learn from the past and its mistakes and successes and then you accept Grace. This insures that guilt over mistakes is an absolutely unnecessary burden.`,
    title: "Grace and Positive Health",
    date: "June 18, 1980",
    category: "Grace",
    teachingNumber: 180,
  },
  {
    text: `Grace is My given way. It is free access to Me, with no strings that I attach.`,
    title: "Grace, Again",
    date: "August 10, 1980",
    category: "Grace",
    teachingNumber: 117,
  },
  {
    text: `This is a time of spiritual uprising in the earth. I confirm to you that this is true. I am moving in the earth in many, diverse and powerful ways.`,
    title: "My Manifestations",
    date: "August 19, 1980",
    category: "The Spirit",
    teachingNumber: 122,
  },
  {
    text: `Responsibilities are the sweet cream of life. They are not meant to be burdens, but evidences of your true humanity.`,
    title: "Responsibilities",
    date: "September 12, 1980",
    category: "Commitment",
    teachingNumber: 267,
  },
  {
    text: `The earth is first and foremost a spiritual phenomenon. It has manifested into matter, and this can obscure the spirit, but it needn’t.`,
    title: "Spirit and Soul",
    date: "September 22, 1980",
    category: "The Earth",
    teachingNumber: 272,
  },
  {
    text: `Holy Communion has about it an aura of timelessness. It almost captures and retains that quality that is in all but this earth realm.`,
    title: "Holy Communion",
    date: "October 5, 1980",
    category: "Sacraments",
    teachingNumber: 262,
  },
  {
    text: `The good life involves all of the dimensions of well-being. So let’s start with the most important one, the unifying one – the spiritual.`,
    title: "The Good Life",
    date: "October 15, 1980",
    category: "Health",
    teachingNumber: 254,
  },
  {
    text: `The basic premise is that whatever the situation there am I in the midst of it. The supreme experience is relationship with Me, and that can come just as well in ill-health as in positive health.`,
    title: "Ill-Health",
    date: "July 23, 1981",
    category: "Health",
    teachingNumber: 347,
  },
  {
    text: `Faithfulness to Me is the prime requirement. As I have told you before, this involves trust in Me, in My power and wisdom, and in My capacity to lead you in proper paths.`,
    title: "In The Matter Of Faithfulness, II",
    date: "August 19, 1981",
    category: "Faith",
    teachingNumber: 294,
  },
  {
    text: `Know that life continues, for it is essentially a spiritual quest… for the rhythm of relationship with Me, true knowledge of self, and unceasing motivations to be of service to Me and to your fellow spirits.`,
    title: "Preparation",
    date: "September 10, 1981",
    category: "Eternity",
    teachingNumber: 404,
  },
  {
    text: `I, the Holy Spirit, have experiences of fun and humor. I smile. I grin. I chuckle. And I laugh.`,
    title: "A Time To Laugh",
    date: "January 21, 1982",
    category: "Humor",
    teachingNumber: 465,
  },
  {
    text: `Without spirit you could have no real faith, for faith is, truly, what the spirit knows.`,
    title: "Faith",
    date: "April 17, 1982",
    category: "Faith",
    teachingNumber: 425,
  },
  {
    text: `One of the critical rhythms of life is that of experiencing and of not experiencing suffering.`,
    title: "In Defense of Suffering",
    date: "May 2, 1982",
    category: "Suffering",
    teachingNumber: 513,
  },
  {
    text: `Spirit is the essence of life, o son, and as spirit matures life takes on greater value and can be lived more consciously and more fully.`,
    title: "On Spiritual Maturity",
    date: "August 8, 1982",
    category: "The Spirit",
    teachingNumber: 443,
  },
  {
    text: `So I taught you, last time, that love is the builder. Now I affirm that love is the healer.`,
    title: "Love, The Healer",
    date: "November 28, 1982",
    category: "Love",
    teachingNumber: 531,
  },
  {
    text: `As I have told you before, faith is what your spirit knows. … The mind hopes, while the spirit knows.`,
    title: "Faith & Faithfulness",
    date: "October 17, 1982",
    category: "Faith",
    teachingNumber: 542,
  },
  {
    text: `I forgive because forgiveness is fundamental to the love relationship. It is a form of mercy, of course, and I just like to be merciful.`,
    title: "I Do Forgive",
    date: "August 25, 1984",
    category: "Forgiveness",
    teachingNumber: 686,
  },
  {
    text: `You know the chief goal of life quite well… the chief goal is to grow in spirit.`,
    title: "Life’s Goals",
    date: "July 25, 1984",
    category: "Enlightenment",
    teachingNumber: 722,
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
    text: `I, the Holy Spirit, work in many ways. I interpret and reteach ways of living and believing that I offered as Jesus, but I am not limited to these.`,
    title: "Christ, The Spirit",
    date: "April 19, 1985",
    category: "Jesus",
    teachingNumber: 796,
  },
  {
    text: `Life is simple in that there is only one real purpose, which is growth and development of spirit.`,
    title: "The Simplicity Of Life",
    date: "November 27, 1983",
    category: "Enlightenment",
    teachingNumber: 648,
  },
  {
    text: `I am where I am, and I have My influence, but what I want to foster is spiritual growth, and that often happens… best… in the midst of adversity.`,
    title: "Where Am I?",
    date: "December 20, 1983",
    category: "Suffering",
    teachingNumber: 586,
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

        {/* Consistent navigation */}
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

        {/* Quotes */}
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