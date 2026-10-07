import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { getMembership, isCriticalAdmin } from '@/lib/membership'

function service() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(req: NextRequest) {
  const { adminLevel } = await getMembership()
  if (!isCriticalAdmin(adminLevel)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = service()
  const url = new URL(req.url)
  const n = url.searchParams.get('n')
  const q = (url.searchParams.get('q') || '').trim()

  if (n && /^\d+$/.test(n)) {
    const { data, error } = await admin
      .from('teachings')
      .select('teaching_number, title, slug, full_text, closing_phrase, end_time')
      .eq('teaching_number', parseInt(n, 10))
      .maybeSingle()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(data)
  }

  if (/^\d+$/.test(q)) {
    const { data, error } = await admin
      .from('teachings')
      .select('teaching_number, title, slug')
      .eq('teaching_number', parseInt(q, 10))
      .limit(1)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
  }

  if (q.length < 2) return NextResponse.json([])

  const { data, error } = await admin
    .from('teachings')
    .select('teaching_number, title, slug')
    .ilike('title', `%${q}%`)
    .order('teaching_number')
    .limit(20)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

export async function POST(req: NextRequest) {
  const { adminLevel } = await getMembership()
  if (!isCriticalAdmin(adminLevel)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user?.email) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const teachingNumber = Number(body.teaching_number)
  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const fullText = typeof body.full_text === 'string' ? body.full_text : ''
  const closing =
    typeof body.closing_phrase === 'string' && body.closing_phrase.trim()
      ? body.closing_phrase.trim()
      : null
  const endTime =
    typeof body.end_time === 'string' && body.end_time.trim()
      ? body.end_time.trim()
      : null

  if (!Number.isInteger(teachingNumber) || teachingNumber < 1) {
    return NextResponse.json({ error: 'Teaching number required' }, { status: 400 })
  }
  if (!title || !fullText.trim()) {
    return NextResponse.json({ error: 'Title and body cannot be empty' }, { status: 400 })
  }

  const admin = service()
  const { data: existing, error: lookupError } = await admin
    .from('teachings')
    .select('teaching_number')
    .eq('teaching_number', teachingNumber)
    .maybeSingle()
  if (lookupError) return NextResponse.json({ error: lookupError.message }, { status: 500 })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { error } = await admin
    .from('teachings')
    .update({
      title,
      full_text: fullText,
      closing_phrase: closing,
      end_time: endTime,
    })
    .eq('teaching_number', teachingNumber)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { error: noteError } = await admin.from('teaching_edits').insert({
    teaching_number: teachingNumber,
    edited_by: user.email.trim().toLowerCase(),
    note: 'title, full_text, closing_phrase, end_time',
  })

  if (noteError) {
    return NextResponse.json({
      ok: true,
      warning: 'Saved, but the edit note was not written. Run the teaching_edits SQL.',
    })
  }

  return NextResponse.json({ ok: true })
}