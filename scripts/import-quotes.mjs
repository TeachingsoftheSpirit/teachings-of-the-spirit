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

const CONVERTED_FILE = path.resolve(__dirname, '../data/quotes-converted.txt')

function parseQuotes(raw) {
  const parts = raw.split('|||').map(p => p.trim()).filter(p => p.length > 0)
  const results = []

  let i = 0
  while (i < parts.length) {
    // Expect: quote_text , title , date(+possible next quote start)
    let quote_text = parts[i] || ''
    let title = parts[i + 1] || 'Unknown'
    let datePart = parts[i + 2] || ''

    // Clean
    quote_text = quote_text.replace(/^["'\s]+|["'\s]+$/g, '').trim()
    title = title.replace(/^["'\s]+|["'\s]+$/g, '').trim()

    // Extract year/date from the beginning of datePart
    const dateMatch = datePart.match(/^([A-Za-z]{3,9}\.?\s+\d{1,2},?\s+)?((?:19|20)\d{2})/)
    let date = null
    let year = null

    if (dateMatch) {
      date = (dateMatch[1] || '') + dateMatch[2]
      date = date.trim()
      year = parseInt(dateMatch[2], 10)
    } else {
      // fallback – look for any year
      const y = datePart.match(/\b((?:19|20)\d{2})\b/)
      if (y) {
        year = parseInt(y[1], 10)
        date = String(year)
      }
    }

    if (quote_text.length > 25 && title.length > 2) {
      results.push({
        quote_text,
        title,
        date,
        year,
        category: null,
      })
    }

    i += 3
  }

  return results
}

async function main() {
  console.log('Reading converted file...')
  const raw = readFileSync(CONVERTED_FILE, 'utf8')

  console.log('Parsing...')
  const results = parseQuotes(raw)
  console.log(`Parsed ${results.length} quotes`)

  if (results.length > 0) {
    console.log('\nExample 1:')
    console.log('Title:', results[0].title)
    console.log('Year:', results[0].year)
    console.log('Text:', results[0].quote_text.slice(0, 120) + '...')
  }
  if (results.length > 1) {
    console.log('\nExample 2:')
    console.log('Title:', results[1].title)
    console.log('Year:', results[1].year)
    console.log('Text:', results[1].quote_text.slice(0, 120) + '...')
  }
  if (results.length > 4) {
    console.log('\nExample 5:')
    console.log('Title:', results[4].title)
    console.log('Year:', results[4].year)
    console.log('Text:', results[4].quote_text.slice(0, 120) + '...')
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
