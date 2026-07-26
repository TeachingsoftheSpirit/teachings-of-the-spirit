import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-06-24.dahlia',
})

export async function POST() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const cleanEmail = user.email.trim().toLowerCase()

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('stripe_customer_id, subscription_status')
      .eq('email', cleanEmail)
      .maybeSingle()

    if (profileError || !profile?.stripe_customer_id) {
      console.error('Cancel: no stripe_customer_id for', cleanEmail, profileError)
      return NextResponse.json(
        { error: 'No membership record found on your profile' },
        { status: 404 }
      )
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: 'all',
      limit: 20,
    })

    console.log(
      'Cancel debug — customer',
      profile.stripe_customer_id,
      'found',
      subscriptions.data.length,
      'subscriptions:',
      subscriptions.data.map((s) => ({
        id: s.id,
        status: s.status,
        cancel_at_period_end: s.cancel_at_period_end,
      }))
    )

    // Anything we can still schedule for cancellation
    const candidate = subscriptions.data.find(
      (s) =>
        s.status === 'active' ||
        s.status === 'trialing' ||
        s.status === 'past_due' ||
        (s.cancel_at_period_end && s.status !== 'canceled')
    )

    if (candidate) {
      if (candidate.cancel_at_period_end) {
        // Already scheduled — treat as success
        return NextResponse.json({
          success: true,
          alreadyCanceling: true,
          cancelAt: candidate.cancel_at
            ? new Date(candidate.cancel_at * 1000).toISOString()
            : null,
        })
      }

      // Schedule cancellation at period end
      const updated = await stripe.subscriptions.update(candidate.id, {
        cancel_at_period_end: true,
      })

      return NextResponse.json({
        success: true,
        cancelAt: updated.cancel_at
          ? new Date(updated.cancel_at * 1000).toISOString()
          : null,
      })
    }

    // Nothing left to cancel — treat as a quiet success so the member still gets the goodbye
    // (the subscription has already been fully canceled at some point)
    return NextResponse.json({
      success: true,
      alreadyFullyCanceled: true,
    })
  } catch (err: any) {
    console.error('Cancel membership error:', err)
    return NextResponse.json(
      { error: err.message || 'Unable to cancel membership' },
      { status: 500 }
    )
  }
}