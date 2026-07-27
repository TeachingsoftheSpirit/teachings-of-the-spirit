import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

function service() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function requireEmail() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user?.email) return null
  return user.email.trim().toLowerCase()
}

/** GET — list my shelves (with item counts) */
export async function GET() {
  try {
    const email = await requireEmail()
    if (!email) {
      return NextResponse.json({ error: 'You must be signed in' }, { status: 401 })
    }

    const admin = service()
    const { data: cats, error } = await admin
      .from('member_categories')
      .select('id, name, sort_order, created_at')
      .eq('email', email)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      console.error('categories GET:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const categories = cats || []
    if (categories.length === 0) {
      return NextResponse.json({ categories: [] })
    }

    const ids = categories.map((c) => c.id)
    const { data: items } = await admin
      .from('member_category_items')
      .select('category_id')
      .in('category_id', ids)

    const counts = new Map<string, number>()
    for (const row of items || []) {
      counts.set(row.category_id, (counts.get(row.category_id) || 0) + 1)
    }

    return NextResponse.json({
      categories: categories.map((c) => ({
        ...c,
        item_count: counts.get(c.id) || 0,
      })),
    })
  } catch (err: any) {
    console.error('categories GET:', err)
    return NextResponse.json(
      { error: err.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}

/** POST { name } — create shelf */
export async function POST(req: NextRequest) {
  try {
    const email = await requireEmail()
    if (!email) {
      return NextResponse.json({ error: 'You must be signed in' }, { status: 401 })
    }

    const body = await req.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (!name || name.length < 1) {
      return NextResponse.json({ error: 'name required' }, { status: 400 })
    }
    if (name.length > 80) {
      return NextResponse.json({ error: 'name too long' }, { status: 400 })
    }

    const admin = service()
    const { data, error } = await admin
      .from('member_categories')
      .insert({ email, name, sort_order: 0 })
      .select('id, name, sort_order, created_at')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'You already have a shelf with that name' },
          { status: 409 }
        )
      }
      console.error('categories POST:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      category: { ...data, item_count: 0 },
    })
  } catch (err: any) {
    console.error('categories POST:', err)
    return NextResponse.json(
      { error: err.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}