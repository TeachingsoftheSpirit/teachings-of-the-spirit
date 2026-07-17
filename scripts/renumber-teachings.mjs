import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function renumberTeachings() {
  console.log('Fetching all teachings for renumbering...')

  const { data: teachings, error } = await supabase
    .from('teachings')
    .select('id, date, time, teaching_number')
    .order('date', { ascending: true })
    .order('time', { ascending: true, nullsFirst: true })

  if (error) {
    console.error('Error fetching teachings:', error)
    return
  }

  console.log(`Found ${teachings.length} teachings. Re-assigning numbers...`)

  const updates = teachings.map((teaching, index) => ({
    id: teaching.id,
    new_number: index + 1,
    old_number: teaching.teaching_number,
  }))

  // Update in batches
  const batchSize = 200
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize)

    const promises = batch.map((item) =>
      supabase
        .from('teachings')
        .update({ teaching_number: item.new_number })
        .eq('id', item.id)
    )

    await Promise.all(promises)
    console.log(`Updated ${i + batch.length} / ${updates.length}...`)
  }

  console.log('\n✅ Renumbering complete!')
  console.log(`New numbering: 1 → ${updates.length}`)
}

renumberTeachings()