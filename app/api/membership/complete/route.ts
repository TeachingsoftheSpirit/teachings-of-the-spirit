import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-06-24.dahlia',
})

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const sessionId = body.session_id || body.sessionId

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription', 'customer'],
    })

    if (!session.customer || !session.subscription) {
      return NextResponse.json({ error: 'Invalid session' }, { status: 400 })
    }

    const customerId =
      typeof session.customer === 'string'
        ? session.customer
        : session.customer.id

    const subscription =
      typeof session.subscription === 'string'
        ? await stripe.subscriptions.retrieve(session.subscription)
        : session.subscription

    const email =
      session.customer_details?.email || session.customer_email

    if (!email) {
      return NextResponse.json(
        { error: 'No email found on session' },
        { status: 400 }
      )
    }

    const interval =
      subscription.items.data[0]?.price?.recurring?.interval
    const billingInterval = interval === 'year' ? 'annual' : 'monthly'

    // Detect tier from price nickname or product name
    const price = subscription.items.data[0]?.price
    const nickname = (price?.nickname || '').toLowerCase()
    const productName =
      typeof price?.product === 'object' && price.product && 'name' in price.product
        ? String((price.product as any).name || '').toLowerCase()
        : ''

    let tier = 'house_brew'
    if (
      nickname.includes('private') ||
      productName.includes('private')
    ) {
      tier = 'private_reserve'
    }

    // Update profile if it already exists
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    if (existingProfile) {
      await supabaseAdmin
        .from('profiles')
        .update({
          stripe_customer_id: customerId,
          subscription_status: tier,
          billing_interval: billingInterval,
          access_ends_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existingProfile.id)
    }

    return NextResponse.json({
      success: true,
      email,
      tier,
      interval: billingInterval,
      customerId,
    })
  } catch (err: any) {
    console.error('membership/complete error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}