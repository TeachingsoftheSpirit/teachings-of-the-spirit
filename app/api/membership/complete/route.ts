import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const PRICE_MAP: Record<string, { tier: string; interval: string }> = {
  'price_1TvnT3DAWPDfVwdnpN1woX0c': { tier: 'house_brew', interval: 'monthly' },
  'price_1TvnTaDAWPDfVwdnrquyVBlD': { tier: 'house_brew', interval: 'annual' },
  'price_1TvnUGDAWPDfVwdnb0dPIKXk': { tier: 'private_reserve', interval: 'monthly' },
  'price_1TvnUpDAWPDfVwdnAN2oCC24': { tier: 'private_reserve', interval: 'annual' },
}

export async function POST(request: Request) {
  try {
    const { session_id } = await request.json()
    if (!session_id) {
      return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items'],
    })

    if (session.payment_status !== 'paid') {
      return NextResponse.json({ error: 'Payment not completed' }, { status: 400 })
    }

    const email = session.customer_details?.email?.trim().toLowerCase()
    if (!email) {
      return NextResponse.json({ error: 'No email on the Stripe session' }, { status: 400 })
    }

    const priceId = session.line_items?.data?.[0]?.price?.id
    const mapping = priceId ? PRICE_MAP[priceId] : null

    if (!mapping) {
      return NextResponse.json({ error: 'Unknown price' }, { status: 400 })
    }

    // 1. Make sure an Auth user exists for this email
    let userId: string | null = null

    // Try to find an existing user
    const { data: listData } = await supabaseAdmin.auth.admin.listUsers()
    const existing = listData?.users?.find(u => u.email?.toLowerCase() === email)

    if (existing) {
      userId = existing.id
    } else {
      // Create a new Auth user (no password yet – that comes on the welcome page)
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true,
      })
      if (createError || !newUser.user) {
        console.error('Create user error:', createError)
        return NextResponse.json({ error: createError?.message || 'Unable to create user' }, { status: 500 })
      }
      userId = newUser.user.id
    }

    // 2. Upsert the profile using the Auth user id
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(
        {
          id: userId,
          email,
          subscription_status: mapping.tier,
          billing_interval: mapping.interval,
          stripe_customer_id: typeof session.customer === 'string'
            ? session.customer
            : session.customer?.id ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )

    if (profileError) {
      console.error('Profile update error:', profileError)
      return NextResponse.json({ error: profileError.message }, { status: 500 })
    }

    return NextResponse.json({
      email,
      tier: mapping.tier,
      interval: mapping.interval,
    })
  } catch (err: any) {
    console.error('Membership complete error:', err)
    return NextResponse.json({ error: err.message || 'Something went wrong' }, { status: 500 })
  }
}