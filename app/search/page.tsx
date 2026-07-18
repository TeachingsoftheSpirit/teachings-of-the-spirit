import Header from '@/components/Header'

export default function SearchPage() {
  return (
    <main className="min-h-screen bg-[#F7F4EF]">
      <Header active="search" />
      <div className="max-w-3xl mx-auto px-6 pt-10">
        <h1 className="text-4xl font-medium tracking-tight text-[#2C2522] mb-3 text-center">
          Search
        </h1>
        {/* Search content here */}
      </div>
    </main>
  )
}