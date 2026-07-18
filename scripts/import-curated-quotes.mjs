import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const inputFile = path.resolve(__dirname, '../data/quotes-curated.txt')
const text = readFileSync(inputFile, 'utf8')

// Split on blank lines (each curated quote is one block)
const blocks = text
  .split(/\n\s*\n/)
  .map(b => b.trim())
  .filter(b => b.length > 30)

console.log(`Found ${blocks.length} quote blocks`)

function parseQuoteBlock(block) {
  // Primary regex (strict but clean)
  let match = block.match(/“([^”]+)”\s+([A-Za-z]{3,}\s+\d{1,2},?\s+\d{4})[\s.]*$/)
  
  if (!match) {
    // Fallback: take the last line as title + date
    const lines = block.split('\n').map(l => l.trim()).filter(Boolean)
    if (lines.length > 1) {
      const lastLine = lines[lines.length - 1]
      const fbMatch = lastLine.match(/“([^”]+)”\s+([A-Za-z]{3,}\s+\d{1,2},?\s+\d{4})/)
      if (fbMatch) {
        match = fbMatch
      }
    }
  }
  
  if (!match) return null

  const title = match[1].trim()
  const date = match[2].trim()
  const year = parseInt(date.match(/\d{4}$/)[0])

  let quoteText = block.substring(0, match.index || block.lastIndexOf(match[0])).trim()
  quoteText = quoteText.replace(/^["'“”]+|["'“”]+$/g, '').trim()

  return { quote_text: quoteText, title, date, year }
}

const quotes = blocks.map(parseQuoteBlock).filter(Boolean)
console.log(`Successfully parsed ${quotes.length} quotes`)

async function importQuotes() {
  console.log('Clearing existing quotes table...')
  await supabase.from('quotes').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  console.log('Inserting curated quotes...')
  const batchSize = 50
  for (let i = 0; i < quotes.length; i += batchSize) {
    const batch = quotes.slice(i, i + batchSize)
    const { error } = await supabase.from('quotes').insert(batch)
    if (error) {
      console.error('Insert error on batch', i, error.message)
    } else {
      console.log(`Inserted ${i + batch.length} / ${quotes.length}`)
    }
  }

  console.log('=== Curated quotes import finished ===')
  console.log(`Total inserted: ${quotes.length}`)
}

importQuotes().catch(console.error)