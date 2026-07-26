import Header from '@/components/Header'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import RuminationsTeachingsPanel from '@/components/RuminationsTeachingsPanel'
import { getMembershipLevel, canAccess } from '@/lib/membership'

type Props = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ from?: string }>
}

export default async function RuminationPage({ params, searchParams }: Props) {
  const { slug } = await params
  const { from } = await searchParams
  const fromTeaching = from ? parseInt(from, 10) : null

  const level = await getMembershipLevel()
  const allowOpen = canAccess(level, 'ruminations_full')

  if (!allowOpen) {
    return (
      <main className="min-h-screen bg-[#F7F4EF]">
        <Header active="ruminations" />
        <div className="max-w-lg mx-auto px-6 pt-24 pb-24 text-center">
          <h1 className="text-2xl font-medium text-[#2C2522] mb-3">
            Further in
          </h1>
          <p className="text-[#6B5E54] text-[17px] leading-relaxed mb-2">
            This letter is part of the Private Reserve.
          </p>
          <p className="text-[#8A7B65] text-[15px] leading-relaxed mb-10">
            Russell’s Ruminations are deeper dives written for professional
            colleagues. The shelves open further in.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/ruminations"
              className="inline-block text-[15px] text-[#2C2522] border border-[#C9BEB0] rounded-sm px-5 py-2.5 hover:bg-[#EDE4D4] transition-colors"
            >
              All Ruminations
            </Link>
            <Link
              href="/"
              className="inline-block text-[15px] text-[#2C2522] border border-[#C9BEB0] rounded-sm px-5 py-2.5 hover:bg-[#EDE4D4] transition-colors"
            >
              Main Room
            </Link>
          </div>
        </div>
      </main>
    )
  }

  const supabase = await createClient()

  const { data: rumination } = await supabase
    .from('ruminations')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!rumination) {
    notFound()
  }

  let fromTitle: string | null = null
  if (fromTeaching && !isNaN(fromTeaching)) {
    const { data: t } = await supabase
      .from('teachings')
      .select('title')
      .eq('teaching_number', fromTeaching)
      .single()
    fromTitle = t?.title ?? null
  }

  const { data: linked } = await supabase
    .from('ruminations_teachings')
    .select(
      `
      teaching_number,
      teachings (
        teaching_number,
        title,
        date
      )
    `
    )
    .eq('rumination_id', rumination.id)
    .order('teaching_number')

  const relatedTeachings = (linked || [])
    .map((row: any) => row.teachings)
    .filter(Boolean)

  const pageCount = rumination.page_count || 0
  const baseUrl = `https://ednmsemgscovnzspbcvd.supabase.co/storage/v1/object/public/ruminations/${slug}`

  return (
    <main className="min-h-screen bg-[#F7F4EF]">
      <Header active="ruminations" />

      <div className="sticky top-[52px] z-30 bg-[#F7F4EF]/95 backdrop-blur border-b border-[#E5DFD3]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <Link
            href="/ruminations"
            className="text-sm text-[#6B5E54] hover:text-[#2C2522] transition-colors shrink-0"
          >
            ← All Ruminations
          </Link>
          <div className="text-center flex-1 min-w-0">
            <div className="text-2xl sm:text-3xl font-medium text-[#2C2522] leading-tight">
              Russell’s Ruminations
            </div>
            <div className="mx-auto mt-1.5 mb-1.5 h-px w-24 bg-[#D4CBBF]" />
            <div className="text-[15px] text-[#8A7B65] tracking-wide">
              Vol. {rumination.volume}, No. {rumination.number} ·{' '}
              {rumination.date_text}
            </div>
            <div className="text-2xl sm:text-3xl font-medium text-[#2C2522] truncate leading-tight mt-0.5">
              {rumination.title}
            </div>
          </div>
        </div>
      </div>

      {fromTeaching && !isNaN(fromTeaching) && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6">
          <Link
            href={`/teachings/${fromTeaching}`}
            className="inline-flex items-center gap-1.5 text-sm transition-all duration-300
              text-[#2C2522]
              hover:text-[#00C853]
              hover:[text-shadow:0_0_12px_rgba(0,220,120,0.85),0_0_28px_rgba(0,200,100,0.55)]
              focus:outline-none"
          >
            <span className="text-[14px] leading-none text-[#00C853]">◈</span>
            <span>
              Return to Teaching
              {fromTitle ? `: ${fromTitle}` : ` #${fromTeaching}`}
            </span>
          </Link>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-24">
        {pageCount > 0 ? (
          <div className="space-y-10">
            {Array.from({ length: pageCount }, (_, i) => {
              const pageNum = String(i + 1).padStart(2, '0')
              const src = `${baseUrl}/page-${pageNum}.png`
              return (
                <div
                  key={pageNum}
                  id={`rum-page-${i + 1}`}
                  className="bg-[#F7F4EF] shadow-[0_4px_24px_rgba(44,37,34,0.18)] border border-[#D4CBBF] overflow-hidden"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`Page ${i + 1}`}
                    className="w-full h-auto block"
                  />
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-16 text-[#6B5E54]">
            <p>Page images for this letter are not yet available.</p>
          </div>
        )}
      </div>

      {relatedTeachings.length > 0 && pageCount > 0 && (
        <RuminationsTeachingsPanel
          teachings={relatedTeachings}
          pageCount={pageCount}
          pageMap={(rumination.page_map as Record<string, number[]>) || {}}
        />
      )}
    </main>
  )
}