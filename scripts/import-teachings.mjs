import { createClient } from '@supabase/supabase-js'
import { createReadStream } from 'fs'
import { createInterface } from 'readline'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
)

const BATCH_SIZE = 50
const jsonlPath = 'C:\\Users\\z\\Desktop\\Copy of Teachings\\teachings_final_v4.jsonl'

async function importTeachings() {
  console.log('Starting import...')

  const fileStream = createReadStream(jsonlPath)
  const rl = createInterface({ input: fileStream, crlfDelay: Infinity })

  let batch = []
  let total = 0
  let errors = 0
  let lineNumber = 0

  for await (const line of rl) {
    lineNumber++
    if (!line.trim()) continue

    try {
      const raw = JSON.parse(line)

      // Extract number from "teaching-0001" → 1
      const numberMatch = raw.id?.match(/teaching-(\d+)/)
      const teaching_number = numberMatch ? parseInt(numberMatch[1], 10) : null

      if (!teaching_number || !raw.title || !raw.full_text) {
        console.warn(`Skipping line ${lineNumber}: missing required fields`)
        errors++
        continue
      }

      // Try to extract year from the beginning of full_text
      let year = null
      const yearMatch = raw.full_text.match(/\b(19|20)\d{2}\b/)
      if (yearMatch) {
        year = parseInt(yearMatch[0], 10)
      }

      batch.push({
        teaching_number,
        title: raw.title.trim(),
        full_text: raw.full_text.trim(),
        year,
        date: null,
        location: null
      })

      if (batch.length >= BATCH_SIZE) {
        await insertBatch(batch)
        total += batch.length
        console.log(`Inserted ${total} teachings...`)
        batch = []
      }
    } catch (err) {
      console.error(`Error on line ${lineNumber}:`, err.message)
      errors++
    }
  }

  if (batch.length > 0) {
    await insertBatch(batch)
    total += batch.length
  }

  console.log('\n=== Import finished ===')
  console.log(`Total inserted: ${total}`)
  console.log(`Errors / skipped: ${errors}`)
}

async function insertBatch(batch) {
  const { error } = await supabase
    .from('teachings')
    .upsert(batch, { onConflict: 'teaching_number' })

  if (error) {
    console.error('Batch error:', error.message)
    throw error
  }
}

importTeachings().catch(err => {
  console.error('Fatal:', err)
  process.exit(1)
})