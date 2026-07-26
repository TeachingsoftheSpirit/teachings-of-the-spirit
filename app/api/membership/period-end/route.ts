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

    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('email', user.email.trim().toLowerCase())
      .maybeSingle()

    if (!profile?.stripe_customer_id) {
      return NextResponse.json({ endDate: null })
    }

    const subscriptions = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: 'active',
      limit: 1,
    })

    const sub = subscriptions.data[0] as
      | (Stripe.Subscription & { current_period_end?: number })
      | undefined

    const periodEnd = sub?.current_period_end
    if (!periodEnd) {
      return NextResponse.json({ endDate: null })
    }

    return NextResponse.json({
      endDate: new Date(periodEnd * 1000).toISOString(),
    })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ endDate: null })
  }
}