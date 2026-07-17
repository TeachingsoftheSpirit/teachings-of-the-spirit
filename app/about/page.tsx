import Header from '@/components/Header'

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#F7F4EF]">
      <Header active="about" />

      <div className="max-w-3xl mx-auto px-6 pt-8 pb-6 text-center">
        <h1 className="text-4xl font-medium tracking-tight text-[#2C2522]">
          About
        </h1>
        <p className="mt-2 text-lg text-[#6B5E54] italic">
          The story behind these teachings
        </p>
      </div>

      <div className="max-w-3xl mx-auto px-6 pb-16 content-area rounded-xl p-8">
        <div className="prose prose-lg max-w-none text-[#2C2522]">
          <p>
            These teachings were received over a period of more than 25 years, 
            beginning in May 1979. They were given in the early morning hours and 
            recorded as they came.
          </p>
          <p>
            The author kept a photograph of the Shroud of Turin on his wall for his 
            entire adult life, often commenting on the importance of keeping the face 
            of Jesus in mind.
          </p>
          <p>
            This site exists to make these teachings available in a quiet, 
            contemplative space — much like the rooms at Magdalen College where 
            many deep conversations once took place.
          </p>
        </div>
      </div>
    </main>
  )
}