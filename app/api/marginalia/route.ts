import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user?.email) {
      return NextResponse.json({ error: 'You must be signed in' }, { status: 401 })
    }
    const cleanEmail = user.email.trim().toLowerCase()
    const { searchParams } = new URL(request.url)
    const teachingNumberParam = searchParams.get('teaching_number')
    const volumeId = searchParams.get('volume_id')
    const since = searchParams.get('since')

    let teachingFilter: number[] | null = null
    if (teachingNumberParam) {
      const n = parseInt(teachingNumberParam, 10)
      if (!Number.isFinite(n)) {
        return NextResponse.json({ error: 'Invalid teaching_number' }, { status: 400 })
      }
      teachingFilter = [n]
    } else if (volumeId) {
      const { data: items, error: volErr } = await supabase
        .from('category_items')
        .select('teaching_number')
        .eq('category_id', volumeId)
      if (volErr) {
        console.error('Volume items error:', volErr)
        return NextResponse.json({ error: volErr.message }, { status: 500 })
      }
      teachingFilter = (items || []).map((i) => i.teaching_number)
      if (teachingFilter.length === 0) {
        return NextResponse.json({ notes: [] })
      }
    }

    let query = supabase
      .from('marginalia')
      .select('id, teaching_number, body, created_at, updated_at')
      .eq('email', cleanEmail)
      .order('created_at', { ascending: false })
      .limit(200)

    if (teachingFilter) {
      query = query.in('teaching_number', teachingFilter)
    }
    if (since) {
      query = query.gte('created_at', since)
    }

    const { data: notes, error } = await query
    if (error) {
      console.error('Marginalia fetch error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    if (!notes || notes.length === 0) {
      return NextResponse.json({ notes: [] })
    }

    const numbers = [...new Set(notes.map((n) => n.teaching_number))]
    const { data: teachings } = await supabase
      .from('teachings')
      .select('teaching_number, title, date, slug')
      .in('teaching_number', numbers)

    const map = new Map(
      (teachings || []).map((t) => [t.teaching_number, t])
    )

    const result = notes.map((n) => ({
      id: n.id,
      teaching_number: n.teaching_number,
      body: n.body,
      created_at: n.created_at,
      updated_at: n.updated_at,
      teachings: map.get(n.teaching_number) || null,
    }))

    return NextResponse.json({ notes: result })
  } catch (err: any) {
    console.error('Unexpected marginalia GET error:', err)
    return NextResponse.json(
      { error: err.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user?.email) {
      return NextResponse.json({ error: 'You must be signed in' }, { status: 401 })
    }

    const { teaching_number, body } = await request.json()
    if (!teaching_number || typeof teaching_number !== 'number') {
      return NextResponse.json(
        { error: 'teaching_number is required' },
        { status: 400 }
      )
    }
    if (!body || typeof body !== 'string' || !body.trim()) {
      return NextResponse.json({ error: 'Note body is required' }, { status: 400 })
    }

    const cleanEmail = user.email.trim().toLowerCase()
    const { data, error } = await supabase
      .from('marginalia')
      .insert({
        email: cleanEmail,
        teaching_number,
        body: body.trim(),
        updated_at: new Date().toISOString(),
      })
      .select('id, teaching_number, body, created_at, updated_at')
      .single()

    if (error) {
      console.error('Marginalia insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true, note: data })
  } catch (err: any) {
    console.error('Unexpected marginalia POST error:', err)
    return NextResponse.json(
      { error: err.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user?.email) {
      return NextResponse.json({ error: 'You must be signed in' }, { status: 401 })
    }

    const { id } = await request.json()
    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const cleanEmail = user.email.trim().toLowerCase()

    // Only delete notes that belong to this user
    const { error } = await supabase
      .from('marginalia')
      .delete()
      .eq('id', id)
      .eq('email', cleanEmail)

    if (error) {
      console.error('Marginalia delete error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Unexpected marginalia DELETE error:', err)
    return NextResponse.json(
      { error: err.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}