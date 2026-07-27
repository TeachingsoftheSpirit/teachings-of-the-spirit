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

type Ctx = { params: Promise<{ id: string }> }

async function ownedCategory(admin: ReturnType<typeof service>, id: string, email: string) {
  const { data } = await admin
    .from('member_categories')
    .select('id, name, sort_order, created_at, email')
    .eq('id', id)
    .eq('email', email)
    .maybeSingle()
  return data
}

/** GET — shelf + items (with titles) */
export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const email = await requireEmail()
    if (!email) {
      return NextResponse.json({ error: 'You must be signed in' }, { status: 401 })
    }
    const { id } = await ctx.params
    const admin = service()
    const cat = await ownedCategory(admin, id, email)
    if (!cat) {
      return NextResponse.json({ error: 'Shelf not found' }, { status: 404 })
    }

    const { data: items, error } = await admin
      .from('member_category_items')
      .select('id, teaching_number, sort_order, note, created_at')
      .eq('category_id', id)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const numbers = (items || []).map((i) => i.teaching_number)
    let titles = new Map<number, { title: string; date: string }>()
    if (numbers.length > 0) {
      const { data: teachings } = await admin
        .from('teachings')
        .select('teaching_number, title, date')
        .in('teaching_number', numbers)
      titles = new Map(
        (teachings || []).map((t) => [
          t.teaching_number,
          { title: t.title, date: t.date },
        ])
      )
    }

    return NextResponse.json({
      category: {
        id: cat.id,
        name: cat.name,
        sort_order: cat.sort_order,
        created_at: cat.created_at,
      },
      items: (items || []).map((i) => ({
        ...i,
        teachings: titles.get(i.teaching_number) || null,
      })),
    })
  } catch (err: any) {
    console.error('category GET:', err)
    return NextResponse.json(
      { error: err.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}

/** PATCH { name } — rename */
export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const email = await requireEmail()
    if (!email) {
      return NextResponse.json({ error: 'You must be signed in' }, { status: 401 })
    }
    const { id } = await ctx.params
    const body = await req.json()
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    if (!name) {
      return NextResponse.json({ error: 'name required' }, { status: 400 })
    }
    if (name.length > 80) {
      return NextResponse.json({ error: 'name too long' }, { status: 400 })
    }

    const admin = service()
    const cat = await ownedCategory(admin, id, email)
    if (!cat) {
      return NextResponse.json({ error: 'Shelf not found' }, { status: 404 })
    }

    const { data, error } = await admin
      .from('member_categories')
      .update({ name })
      .eq('id', id)
      .eq('email', email)
      .select('id, name, sort_order, created_at')
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'You already have a shelf with that name' },
          { status: 409 }
        )
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, category: data })
  } catch (err: any) {
    console.error('category PATCH:', err)
    return NextResponse.json(
      { error: err.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}

/** DELETE — remove shelf (items cascade) */
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const email = await requireEmail()
    if (!email) {
      return NextResponse.json({ error: 'You must be signed in' }, { status: 401 })
    }
    const { id } = await ctx.params
    const admin = service()
    const cat = await ownedCategory(admin, id, email)
    if (!cat) {
      return NextResponse.json({ error: 'Shelf not found' }, { status: 404 })
    }

    const { error } = await admin
      .from('member_categories')
      .delete()
      .eq('id', id)
      .eq('email', email)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('category DELETE:', err)
    return NextResponse.json(
      { error: err.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}

/**
 * POST actions:
 * { action: 'add', teaching_number, note? }
 * { action: 'remove', teaching_number }
 * { action: 'reorder', items: [{ id, sort_order }] }  — optional later
 */
export async function POST(req: NextRequest, ctx: Ctx) {
  try {
    const email = await requireEmail()
    if (!email) {
      return NextResponse.json({ error: 'You must be signed in' }, { status: 401 })
    }
    const { id } = await ctx.params
    const admin = service()
    const cat = await ownedCategory(admin, id, email)
    if (!cat) {
      return NextResponse.json({ error: 'Shelf not found' }, { status: 404 })
    }

    const body = await req.json()
    const action = body.action

    if (action === 'add') {
      const teaching_number = Number(body.teaching_number)
      if (!Number.isFinite(teaching_number) || teaching_number < 1) {
        return NextResponse.json(
          { error: 'teaching_number required' },
          { status: 400 }
        )
      }
      const note =
        typeof body.note === 'string' && body.note.trim()
          ? body.note.trim()
          : null

      // Also ensure flat Special Collections has it
      await admin.from('saved_teachings').upsert(
        {
          email,
          teaching_number,
          memo: note,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'email,teaching_number' }
      )

      const { data, error } = await admin
        .from('member_category_items')
        .upsert(
          {
            category_id: id,
            teaching_number,
            note,
            sort_order: 0,
          },
          { onConflict: 'category_id,teaching_number' }
        )
        .select('id, teaching_number, sort_order, note, created_at')
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ success: true, item: data })
    }

    if (action === 'remove') {
      const teaching_number = Number(body.teaching_number)
      if (!Number.isFinite(teaching_number)) {
        return NextResponse.json(
          { error: 'teaching_number required' },
          { status: 400 }
        )
      }
      const { error } = await admin
        .from('member_category_items')
        .delete()
        .eq('category_id', id)
        .eq('teaching_number', teaching_number)

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (err: any) {
    console.error('category POST:', err)
    return NextResponse.json(
      { error: err.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}