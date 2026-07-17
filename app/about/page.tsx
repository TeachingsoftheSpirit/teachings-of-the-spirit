import Header from '@/components/Header'
import Image from 'next/image'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#F7F4EF]">
      <Header active="about" />

      <div className="max-w-3xl mx-auto px-6 pt-8 pb-6 text-center">
        <h1 className="text-4xl font-medium tracking-tight text-[#2C2522]">
          About
        </h1>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-16 content-area rounded-2xl p-8">
        <div className="prose prose-lg max-w-none text-[#2C2522]">

          <p>
            The Author of these Teachings is the Holy Spirit of God.
          </p>
          <p>
            But, as has been done many times throughout history, God superintended a man to do the writing: <strong>Dr. Robert D. Russell</strong>.
          </p>

          <div className="my-8 flex justify-center">
            <Image 
              src="/home-hero.jpg" 
              alt="Dr. Robert D. Russell" 
              width={420} 
              height={320} 
              className="rounded-xl shadow-md"
            />
          </div>

          <h2>The Story</h2>

          <p>
            The story of Bob Russell’s experience with the Spirit is unique. It is worth recounting the highlights of his spiritual story, from the early days of his youth, and how he came to live “in the Spirit.”
          </p>

          <p>
            Bob grew up in a Methodist household. When he was 15, he attended a church camping trip in the San Bernardino mountains in southern California. One morning, Bob and a friend went on a hike in the surrounding hills, and after several hours of walking, discovered they were lost. Not panicking, but forging on with youthful determination, the two boys walked many more miles and hours, until dusk descended, and the determination turned to fear.
          </p>

          <p>
            Bob finally “hit his knees” and for the first time in his life, fear drove him to ask God for help… for real help. He had done everything he knew how to do, and was still lost and scared. He called on God for help.
          </p>

          <p>
            He stood up from his prayer in trepidation, walked wearily to the top of the next hill, and found himself looking down on the camp in the valley just below.
          </p>

          <p className="font-medium italic">
            The 1st lesson of living “In the Spirit”: A personal call on God’s mercy can produce immediate results.
          </p>

          <h2>The Turning Point</h2>

          <p>
            Fast forward 20 years. It is 1960. Bob is married to the woman of his dreams, with 4 boys and a budding career at Stanford University. Something happens to him that has a marked influence on his life. It came through his mother-in-law, Mabel.
          </p>

          <p>
            Mabel had received from the Holy Spirit the ministry of “Personal Directive Prophecy.” In January 1960, she asked for and received an intention for Bob — a 3-page missive. One part stayed with him for life:
          </p>

          <blockquote className="border-l-4 border-[#C9BEB0] pl-4 italic">
            “If thou wilt incline thine ear unto learning, thy soul unto believing, and thy mind unto obedience, then will no good thing be withheld from thee. Release thy control that He might direct thee. Abstain no longer from boldness of proclamation that ‘THE LORD IS DIRECTOR OF MY LIFE’.”
          </blockquote>

          <p className="font-medium italic">
            The 2nd secret of living “In the Spirit”: Be willing to accept the presence of God acting through other people.
          </p>

          <h2>The Sanctuary</h2>

          <p>
            In 1962, Bob received another word through Mabel:
          </p>

          <blockquote className="border-l-4 border-[#C9BEB0] pl-4 italic">
            “Build Me a sanctuary. Enter as oft as day appeareth, yielding thyself UNTO ME, leaving outside ALL that pertaineth unto reason or man…”
          </blockquote>

          <p>
            Bob took this literally. He added a small office off the master bedroom of their new home and named it “The Sanctuary.” He began most days by giving God the first hour.
          </p>

          <h2>The Teachings Begin</h2>

          <p>
            In May 1979, Bob lost a manuscript he was working on. In desperation he once again “hit his knees.” As clearly as if spoken in his ear, he heard:
          </p>

          <p className="font-medium">“Give me the first hour of your day.”</p>

          <p>
            He made a deal with God: if he found the manuscript, he would give God the first hour of his day for 30 days.
          </p>

          <p>
            When he returned home, the lost manuscript was sitting on the kitchen table in a place he had already searched multiple times.
          </p>

          <div className="my-8 flex justify-center">
            <Image 
              src="/three-pages.jpg" 
              alt="Three pages of a Teaching" 
              width={520} 
              height={380} 
              className="rounded-xl shadow-md"
            />
          </div>

          <p>
            The next morning, May 11, 1979, Bob began the discipline again. Ten days later, on May 20th, something unexpected happened. When he sat down to write, the words were not his own. He heard a voice from within his own soul that dictated an entire essay titled <strong>“Read the Messages.”</strong>
          </p>

          <p>
            And so it began. Bob finished the 30-day commitment, then extended it. For the next 23 years, two or three times a week, the Spirit would speak and Bob would write verbatim what was given. Together they produced over 3,300 Teachings — each exactly three handwritten pages long.
          </p>

          <p className="font-medium italic">
            The 3rd secret of living “In the Spirit”: The search for God requires that you keep asking God for help, and accept it when it comes.
          </p>

          <h2 className="mt-10">About the Writer</h2>

          <p>
            Dr. Robert D. Russell was born in 1926 in Long Beach, California. He earned his Ed.D. from Stanford and taught for 49 years, first at Punahou, then Stanford, and finally at Southern Illinois University, Carbondale.
          </p>

          <p>
            He directed 67 Master’s theses and 78 Ph.D. dissertations. His academic CV is 44 pages long. Not listed in that CV are the 3,349 Teachings he received from the Holy Spirit between 1979 and 2003.
          </p>

          <p>
            Dr. Russell died in 2005 and is buried at his beloved farm in Cobden, Illinois.
          </p>

          <p className="mt-8">
            <strong>John Patrick Russell</strong> is Dr. Russell’s third son. He is organizing and compiling these Teachings so they can be shared with others.
          </p>

          <p className="mt-6 text-center italic text-[#6B5E54]">
            He recommends a deep dive into the Teachings themselves.
          </p>

        </div>
      </div>
    </main>
  )
}