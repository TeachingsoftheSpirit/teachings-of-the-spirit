import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
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
  const onlyAdmins = url.searchParams.get('admins') === '1'
  const q = (url.searchParams.get('q') || '').trim().toLowerCase()

  if (onlyAdmins) {
    const { data, error } = await admin
      .from('profiles')
      .select('email, subscription_status, billing_interval, admin_level')
      .not('admin_level', 'is', null)
      .order('email')
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
  }

  if (q.length >= 2) {
    const { data, error } = await admin
      .from('profiles')
      .select('email, subscription_status, billing_interval, admin_level')
      .ilike('email', `%${q}%`)
      .order('email')
      .limit(20)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data || [])
  }

  return NextResponse.json([])
}

export async function POST(req: NextRequest) {
  const { adminLevel } = await getMembership()
  if (!isCriticalAdmin(adminLevel)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const email = (body.email || '').trim().toLowerCase()
  const newLevel = body.admin_level

  if (!email) {
    return NextResponse.json({ error: 'Email required' }, { status: 400 })
  }
  if (newLevel !== null && newLevel !== 'maintenance' && newLevel !== 'critical') {
    return NextResponse.json({ error: 'Invalid admin level' }, { status: 400 })
  }

  const admin = service()
  const { error } = await admin
    .from('profiles')
    .update({ admin_level: newLevel })
    .eq('email', email)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}