import Header from '@/components/Header'

export default function TitlesPage() {
  return (
    <main className="min-h-screen bg-[#F7F4EF]">
      <Header active="titles" />
      <div className="max-w-3xl mx-auto px-6 pt-10">
        <h1 className="text-4xl font-medium tracking-tight text-[#2C2522] mb-3 text-center">
          Titles
        </h1>
        {/* Titles content here */}
      </div>
    </main>
  )
}