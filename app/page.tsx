import Header from '@/components/Header'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F7F4EF]">
      <Header active="home" />
      <div className="max-w-3xl mx-auto px-6 pt-10">
        <h1 className="text-4xl font-medium tracking-tight text-[#2C2522] mb-3 text-center">
          Teachings of the Spirit
        </h1>
        <p className="text-lg text-[#6B5E54] italic text-center mb-12">
          A private library of spiritual teachings received over many years
        </p>
        {/* Your home page content here */}
      </div>
    </main>
  )
}