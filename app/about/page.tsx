import Link from 'next/link'
import Image from 'next/image'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#F7F4EF]">
      <div className="max-w-3xl mx-auto px-6 sm:px-10 py-16 sm:py-24">

        <header className="mb-16 text-center">
          <div className="min-h-[4.5rem] sm:min-h-[5.25rem] flex items-center justify-center mb-3">
            <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-[#2C2522]">
              About
            </h1>
          </div>
          <p className="text-[#6B5E54] text-lg italic mb-8 min-h-[1.75rem]">
            How the conversation began
          </p>
          <nav className="flex flex-wrap justify-center items-center gap-5 text-sm">
            <Link href="/" className="text-[#6B5E54] hover:text-[#7A3E3E] transition-colors">Home</Link>
            <span className="text-[#E5DFD5]">·</span>
            <Link href="/quotes" className="text-[#6B5E54] hover:text-[#7A3E3E] transition-colors">Quotes</Link>
            <span className="text-[#E5DFD5]">·</span>
            <Link href="/search" className="text-[#6B5E54] hover:text-[#7A3E3E] transition-colors">Search</Link>
            <span className="text-[#E5DFD5]">·</span>
            <Link href="/browse" className="text-[#6B5E54] hover:text-[#7A3E3E] transition-colors">Browse</Link>
            <span className="text-[#E5DFD5]">·</span>
            <Link href="/titles" className="text-[#6B5E54] hover:text-[#7A3E3E] transition-colors">Titles</Link>
            <span className="text-[#E5DFD5]">·</span>
            <Link href="/about" className="text-[#7A3E3E] font-medium drop-shadow-[0_0_8px_rgba(122,62,62,0.45)]">About</Link>
          </nav>
        </header>

        {/* Across the years — four real photographs */}
        <div className="mb-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { src: '/bob-1-navy.jpg', label: 'Young officer' },
            { src: '/bob-2-middle.jpg', label: 'Middle years' },
            { src: '/bob-3-studio.jpg', label: 'Later years' },
            { src: '/bob-4-laughing.jpg', label: 'Spirit' },
          ].map((p) => (
            <div key={p.src} className="text-center">
              <div className="relative aspect-square rounded-lg overflow-hidden border border-[#E5DFD5] shadow-sm mb-2">
                <Image
                  src={p.src}
                  alt={p.label}
                  fill
                  className="object-cover object-top"
                  sizes="160px"
                />
              </div>
              <p className="text-xs text-[#6B5E54]">{p.label}</p>
            </div>
          ))}
        </div>

        <div className="text-center mb-14 mt-8">
          <h2 className="text-2xl font-medium text-[#2C2522] mb-1">Bob Russell</h2>
          <p className="text-[#6B5E54] text-sm">
            University professor · Presbyterian elder · Gentleman farmer
          </p>
        </div>

        <article className="max-w-none text-[#2C2522] leading-[1.85] space-y-6 text-[1.05rem]">
          <p>
            On May 16, 1979, Bob Russell wrote a short explanation. He called it “For the Record”.
          </p>

          <blockquote className="border-l-2 border-[#E5DFD5] pl-6 my-10 space-y-4 italic">
            <p>
              For the record I must tell how this time of commitment commenced. The Lord, the Spirit (God Himself, perhaps) has a “game” that He plays with me. Even though I know that the Lord watches over me and that there really are no dangers in these “everlasting arms” I sometimes find myself afraid of or for something. Usually it has to do with the safety of one of the boys or of Lenore, but this time, on May 10, 1979, it, the fear, focused in a lost manuscript. Neither at home nor at the office could I find the folder with the two chapters I (presumably… who can be sure now?) had written for the little book on Death for Scott Foresman. Finally, after searching through everything at home I determined that it was at the office. So on that Thursday I rushed to the office, and found it not. Despite other responsibilities I was distraught and knew I couldn’t do anything else, with any quality, until I found that folder. So I started driving home.
            </p>
            <p>
              On the way, along New 51, I realized this was the Spirit and His game, so I asked, “What do you want me to do?” The fear gets my attention, and I bargain; usually my “part” is reading and studying some particular scriptures. But no Scriptures came to my mind. The “price” was something else. Then it “hit”. I was to return to this time of meditation-writing each day for approximately an hour… listening to the Spirit and writing down what I hear… which I did back in 1964-65. I balked at the commitment of time in my busy life, but it soon was clear that this is what I must do. So I said, “Lord, I’ll do it each day for a month if you’ll ‘find the manuscript’”.
            </p>
            <p>
              I knew almost immediately that I would find it… even that it would be in an open, obvious place. Sure enough, as I sat down at the kitchen table, shortly after coming into the house, I saw a folder, that I truly hadn’t seen before, on the bench, with a corner of the yellow paper manuscript sticking out. The Lord is a rascal! But he did His part, and I’m now doing mine. Amen.
            </p>
          </blockquote>

          <p>
            The next day, May 11, 1979, Bob began his part of the deal. He promised to give God the first hour of the day for the next 30 days. He woke up at 6:45 am and wrote a little essay called “Here Beginneth”.
          </p>

          <p>
            On May 16, he wrote an essay he titled “Screen”, and at the end of it, he wrote the “For the Record” explanation above. As far as Bob knew, he had made a promise to God for 30 days, and he was going to keep it, and then go back to his life of University Professor, Presbyterian Elder and gentleman farmer.
          </p>

          <p>
            Four days later, at 5:50 am on a Sunday morning, Bob sat down… but someone else picked up the pen: the Holy Spirit of God. And the Spirit wrote an essay titled “Read The Messages”. Here is how it began:
          </p>

          <blockquote className="border-l-2 border-[#7A3E3E]/40 pl-6 my-10 space-y-4">
            <p>
              Instruction is for your edification and for the building up of your self and spirit. They must be reviewed and studied, and their meanings must be applied to life as it is lived. You do other kinds of writing, and you review and polish it. Alike and different. You are not to edit nor to polish these lines, for they come as they are meant to be. But you are to digest and assimilate them, and expose your soul to their truths… and walk accordingly.
            </p>
            <p>
              The world knows some of what you pen, and certainly the Scriptures bring similar messages. Yet this is new and fresh, my son… an update of the Lord’s thoughts… a new quickening of the Holy Spirit. They will not counter, these messages, the missive of the Scriptures, but they will illuminate. New times bring new truths. Yet new truths are old truths in new guise, for all truth IS.
            </p>
          </blockquote>

          <p>
            Bob finished his 30 day commitment, with the Holy Spirit authoring for the final 20 days. The Spirit asked for another 30 day commitment of “the first hour of the morning”, which Bob gave willingly, and the Spirit penned another 30 consecutive days. By now, Bob was hooked. For the next 25 years, Bob and the Spirit would meet in this comfortable arrangement, and together they penned thousands of these Teachings. They would get together 3 or 4 times a week for an hour each session, and the result was always 3 handwritten pages, exactly.
          </p>

          <div className="my-12 rounded-lg overflow-hidden border border-[#E5DFD5] shadow-sm">
            <div className="relative aspect-[4/3] w-full bg-[#F7F4EF]">
              <Image
                src="/three-pages.jpg"
                alt="Three handwritten pages — the typical result of a morning session"
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 768px"
              />
            </div>
            <p className="text-center text-sm text-[#6B5E54] py-3 border-t border-[#E5DFD5]">
              Three handwritten pages — the typical result of a morning session
            </p>
          </div>

          <p>
            The Teachings were not edited for clarity or punctuation or to fit in three pages. But they were always penned as finished products.
          </p>

          <p>
            On this website you can read these Teachings. There are currently 3,298 Teachings published here, with a few more to be published as they are found.
          </p>

          <p>They have been organized several different ways:</p>

          <ul className="list-none space-y-4 pl-0">
            <li>
              <span className="text-[#7A3E3E] font-medium">Categories</span> — topic categories that the Spirit revisited time and time again.
            </li>
            <li>
              <Link href="/titles" className="text-[#7A3E3E] font-medium hover:underline">List of Titles</Link>
              {' '}— scroll through the titles by date. One of the most revealing ways to explore the Teachings.
            </li>
            <li>
              <Link href="/quotes" className="text-[#7A3E3E] font-medium hover:underline">Quotes</Link>
              {' '}— luminous one-liners drawn from the Teachings; click through to the full teaching.
            </li>
            <li>
              <Link href="/search" className="text-[#7A3E3E] font-medium hover:underline">Search</Link>
              {' '}— type any word or phrase and see the teachings that contain it.
            </li>
          </ul>

          <p className="pt-4">Please read, and be inspired.</p>

          <p>
            Add comments, ask questions, tell your stories. There is a community here of people from all over the world who share a common friend in the Spirit.
          </p>
        </article>
      </div>
    </main>
  )
}