import Header from '@/components/Header'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import RuminationsTeachingsPanel from '@/components/RuminationsTeachingsPanel'

type Props = {
  params: Promise<{ slug: string }>
}

export default async function RuminationPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: rumination } = await supabase
    .from('ruminations')
    .select('*')
    .eq('slug', slug)
    .single()

  if (!rumination) {
    notFound()
  }

  const { data: linked } = await supabase
    .from('ruminations_teachings')
    .select(`
      teaching_number,
      teachings (
        teaching_number,
        title,
        date
      )
    `)
    .eq('rumination_id', rumination.id)
    .order('teaching_number')

  const relatedTeachings = (linked || [])
    .map((row: any) => row.teachings)
    .filter(Boolean)

  const pageCount = slug === 'vol-2-no-2' ? 12 : 0
  const baseUrl = 'https://ednmsemgscovnzspbcvd.supabase.co/storage/v1/object/public/ruminations/vol-2-no-2'

  return (
    <main className="min-h-screen bg-[#F7F4EF]">
      <Header active="ruminations" />

      {/* Sticky title bar */}
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
              Vol. {rumination.volume}, No. {rumination.number} · {rumination.date_text}
            </div>
            <div className="text-2xl sm:text-3xl font-medium text-[#2C2522] truncate leading-tight mt-0.5">
              {rumination.title}
            </div>
          </div>
        </div>
      </div>

      {/* Centered pages */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 pb-24">
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
        />
      )}
    </main>
  )
}