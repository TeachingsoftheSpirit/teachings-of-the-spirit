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
  // Normalize characters
  let text = raw
    .replace(/\u201C/g, '"')
    .replace(/\u201D/g, '"')
    .replace(/\u2018/g, "'")
    .replace(/\u2019/g, "'")
    .replace(/\u2026/g, '...')
    .replace(/\u2013/g, '-')
    .replace(/\u2014/g, '-')
    .replace(/â€œ/g, '"')
    .replace(/â€/g, '"')
    .replace(/â€™/g, "'")
    .replace(/â€¦/g, '...')
    .replace(/â€“/g, '-')
    .replace(/â€”/g, '-')
    .replace(/\r\n/g, '\n')

  // Strategy: find every place that looks like:  " - Title - Year
  // or  " - Title, Year   at the end of a quote
  // We use a global regex to locate the attribution ends

  const results = []
  const pattern = /"\s*-\s*"?([^"\n]+?)"?\s*[-–,]\s*([A-Za-z0-9.,\s]*?(?:19|20)\d{2})\s*/g

  let lastIndex = 0
  let match

  while ((match = pattern.exec(text)) !== null) {
    const fullAttr = match[0]
    const title = match[1].trim()
    const date = match[2].trim()
    const yearMatch = date.match(/\b((?:19|20)\d{2})\b/)
    const year = yearMatch ? parseInt(yearMatch[1], 10) : null

    // The quote text is everything from the previous match end to just before this attribution
    let quote_text = text.slice(lastIndex, match.index).trim()

    // Clean leading/trailing quotes and whitespace
    quote_text = quote_text.replace(/^["'\s]+|["'\s]+$/g, '').trim()

    if (quote_text.length > 20) {
      results.push({
        quote_text,
        title: title || 'Unknown',
        date,
        year,
        category: null,
      })
    }

    lastIndex = match.index + fullAttr.length
  }

  // Handle any remaining text after the last match (rare)
  const remaining = text.slice(lastIndex).trim()
  if (remaining.length > 40) {
    results.push({
      quote_text: remaining.replace(/^["'\s]+|["'\s]+$/g, '').trim(),
      title: 'Unknown',
      date: null,
      year: null,
      category: null,
    })
  }

  return results
}

async function main() {
  console.log('Reading cleaned file...')
  const raw = readFileSync(RAW_FILE, 'utf8')

  console.log('Parsing...')
  const results = parseQuotes(raw)
  console.log(`Parsed ${results.length} quotes`)

  if (results.length > 0) {
    console.log('\nExample 1:')
    console.log('Title:', results[0].title)
    console.log('Year:', results[0].year)
    console.log('Text:', results[0].quote_text.slice(0, 140) + '...')
  }
  if (results.length > 1) {
    console.log('\nExample 2:')
    console.log('Title:', results[1].title)
    console.log('Year:', results[1].year)
    console.log('Text:', results[1].quote_text.slice(0, 140) + '...')
  }
  if (results.length > 5) {
    console.log('\nExample 6:')
    console.log('Title:', results[5].title)
    console.log('Year:', results[5].year)
    console.log('Text:', results[5].quote_text.slice(0, 140) + '...')
  }

  console.log('\nClearing table...')
  await supabase.from('quotes').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  const BATCH = 40
  let inserted = 0

  for (let i = 0; i < results.length; i += BATCH) {
    const batch = results.slice(i, i + BATCH)
    const { error } = await supabase.from('quotes').insert(batch)
    if (error) {
      console.error('Error:', error.message)
      throw error
    }
    inserted += batch.length
    console.log(`Inserted ${inserted} / ${results.length}`)
  }

  console.log('\n=== Done ===')
  console.log(`Total inserted: ${inserted}`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})