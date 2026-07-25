import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

const ADMIN_EMAIL = 'jprussell@protonmail.com'

const ALLOWED_TIERS = new Set([
  '',
  'house_brew',
  'private_reserve',
  'canceled',
])

const ALLOWED_INTERVALS = new Set(['', 'monthly', 'annual'])

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user?.email || user.email !== ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const profileId = typeof body.profile_id === 'string' ? body.profile_id : ''
    if (!profileId) {
      return NextResponse.json({ error: 'profile_id required' }, { status: 400 })
    }

    const tierRaw = body.subscription_status
    const intervalRaw = body.billing_interval
    const noteRaw = typeof body.admin_note === 'string' ? body.admin_note.trim() : ''
    const clearAccessEnds = body.clear_access_ends === true
    const accessEndsAt =
      typeof body.access_ends_at === 'string' && body.access_ends_at
        ? body.access_ends_at
        : null

    const subscription_status =
      tierRaw === null || tierRaw === undefined || tierRaw === ''
        ? null
        : String(tierRaw)

    const billing_interval =
      intervalRaw === null || intervalRaw === undefined || intervalRaw === ''
        ? null
        : String(intervalRaw)

    if (subscription_status !== null && !ALLOWED_TIERS.has(subscription_status)) {
      return NextResponse.json({ error: 'Invalid tier' }, { status: 400 })
    }
    if (billing_interval !== null && !ALLOWED_INTERVALS.has(billing_interval)) {
      return NextResponse.json({ error: 'Invalid interval' }, { status: 400 })
    }

    const updates: Record<string, unknown> = {
      subscription_status,
      billing_interval,
    }

    if (clearAccessEnds) {
      updates.access_ends_at = null
    } else if (accessEndsAt) {
      updates.access_ends_at = accessEndsAt
    }

    if (noteRaw) {
      updates.admin_note = noteRaw
      updates.admin_note_at = new Date().toISOString()
    }

    const admin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data, error } = await admin
      .from('profiles')
      .update(updates)
      .eq('id', profileId)
      .select(
        'id, email, username, subscription_status, billing_interval, stripe_customer_id, access_ends_at, created_at, admin_note, admin_note_at'
      )
      .single()

    if (error) {
      console.error('Admin override error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(
      `Admin override by ${user.email}: profile ${profileId}`,
      updates
    )

    return NextResponse.json({ success: true, member: data })
  } catch (err: any) {
    console.error('Admin override unexpected:', err)
    return NextResponse.json(
      { error: err.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}