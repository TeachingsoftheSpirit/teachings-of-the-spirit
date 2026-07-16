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
const jsonlPath = 'C:\\Users\\z\\Desktop\\teachings_clean.jsonl'

async function importTeachings() {
  console.log('Starting clean import...')

  const fileStream = createReadStream(jsonlPath, { encoding: 'utf8' })
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

      if (!raw.teaching_number || !raw.title || !raw.full_text) {
        console.warn(`Skipping line ${lineNumber}: missing required fields`)
        errors++
        continue
      }

      batch.push({
        teaching_number: raw.teaching_number,
        title: raw.title.trim(),
        full_text: raw.full_text.trim(),
        date: raw.date || null,
        year: raw.year || null,
        start_time: raw.start_time || null,
        location1: raw.location1 || null,
        location2: raw.location2 || null,
        closing_phrase: raw.closing_phrase || null,
        end_time: raw.end_time || null,
        source_file: raw.source_file || null,
        location: raw.location1 || null, // keep old column populated for compatibility
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

  console.log('\n=== Clean import finished ===')
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