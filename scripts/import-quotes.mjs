import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
)

const RAW_FILE = path.resolve(__dirname, '../data/quotes-raw.txt')

function parseQuotes(raw) {
  // Normalize common encoding problems
  let text = raw
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"')
    .replace(/â€™/g, "'")
    .replace(/â€¦/g, '…')
    .replace(/â€“/g, '–')
    .replace(/â€”/g, '—')

  // Split on lines that are just a dash / en-dash / em-dash
  const blocks = text
    .split(/\n\s*[–—-]\s*\n/)
    .map(b => b.trim())
    .filter(b => b.length > 30)

  const results = []
  let failed = 0

  for (const block of blocks) {
    // Split on the last two dash-like separators
    const parts = block.split(/\s*[–—-]\s*/)

    if (parts.length < 3) {
      results.push({
        quote_text: block.replace(/^["“]|["”]$/g, '').trim(),
        title: 'Unknown',
        date: null,
        year: null,
        category: null,
      })
      failed++
      continue
    }

    const datePart = parts[parts.length - 1].trim()
    const titlePart = parts[parts.length - 2].trim().replace(/^["“]|["”]$/g, '')
    const quotePart = parts.slice(0, -2).join(' – ').trim().replace(/^["“]|["”]$/g, '')

    const yearMatch = datePart.match(/\b(19|20)\d{2}\b/)
    const year = yearMatch ? parseInt(yearMatch[0], 10) : null

    results.push({
      quote_text: quotePart,
      title: titlePart || 'Unknown',
      date: datePart || null,
      year,
      category: null,
    })
  }

  return { results, failed }
}

async function main() {
  console.log('Reading raw quotes file...')
  const raw = readFileSync(RAW_FILE, 'utf8')

  console.log('Parsing...')
  const { results, failed } = parseQuotes(raw)
  console.log(`Parsed ${results.length} quotes (${failed} used fallback parsing)`)

  if (results.length < 10) {
    console.log('\nFirst block preview:')
    console.log(results[0]?.quote_text?.slice(0, 200))
    console.log('---')
    console.log('Title:', results[0]?.title)
    console.log('Date:', results[0]?.date)
  }

  console.log('Clearing existing quotes table...')
  await supabase.from('quotes').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  const BATCH = 40
  let inserted = 0

  for (let i = 0; i < results.length; i += BATCH) {
    const batch = results.slice(i, i + BATCH)
    const { error } = await supabase.from('quotes').insert(batch)

    if (error) {
      console.error('Batch error:', error.message)
      throw error
    }

    inserted += batch.length
    console.log(`Inserted ${inserted} / ${results.length}`)
  }

  console.log('\n=== Quotes import finished ===')
  console.log(`Total inserted: ${inserted}`)
}

main().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})