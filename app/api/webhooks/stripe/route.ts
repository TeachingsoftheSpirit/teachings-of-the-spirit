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
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        const { data: profile, error: profileError } = await supabaseAdmin
          .from('profiles')
          .select('id, email, subscription_status, billing_interval')
          .eq('stripe_customer_id', customerId)
          .maybeSingle()

        if (profileError || !profile) {
          console.error('No profile found for customer', customerId)
          break
        }

        const isCanceled =
          subscription.status === 'canceled' ||
          (subscription as any).cancel_at_period_end === true

        if (!isCanceled) {
          break
        }

        let accessEndsAt: string | null = null

        if (profile.billing_interval === 'annual') {
          const now = new Date()
          const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
          accessEndsAt = endOfMonth.toISOString()

          if (event.type === 'customer.subscription.deleted' || subscription.status === 'canceled') {
            await issueAnnualPartialRefund(subscription, profile.email)
          }
        } else {
          const periodEnd = (subscription as any).current_period_end
          if (periodEnd) {
            accessEndsAt = new Date(periodEnd * 1000).toISOString()
          }
        }

        await supabaseAdmin
          .from('profiles')
          .update({
            subscription_status: 'canceled',
            access_ends_at: accessEndsAt,
            updated_at: new Date().toISOString(),
          })
          .eq('id', profile.id)

        console.log(`Membership canceled for ${profile.email}. Access ends at ${accessEndsAt}`)
        break
      }

      default:
        break
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Webhook handler error:', err)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}

async function issueAnnualPartialRefund(
  subscription: Stripe.Subscription,
  email: string
) {
  try {
    const invoices = await stripe.invoices.list({
      subscription: subscription.id,
      status: 'paid',
      limit: 1,
    })

    const latestInvoice = invoices.data[0] as any
    if (!latestInvoice || !latestInvoice.charge) {
      return
    }

    const chargeId = typeof latestInvoice.charge === 'string'
      ? latestInvoice.charge
      : latestInvoice.charge.id

    const now = new Date()
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    const periodEnd = (subscription as any).current_period_end
    const periodStart = (subscription as any).current_period_start

    if (!periodEnd || !periodStart || periodEnd * 1000 <= endOfMonth.getTime()) {
      return
    }

    const totalMs = periodEnd * 1000 - periodStart * 1000
    const unusedMs = periodEnd * 1000 - endOfMonth.getTime()
    const refundFraction = unusedMs / totalMs
    const amountPaid = latestInvoice.amount_paid
    const refundAmount = Math.floor(amountPaid * refundFraction)

    if (refundAmount < 50) {
      return
    }

    await stripe.refunds.create({
      charge: chargeId,
      amount: refundAmount,
      reason: 'requested_by_customer',
      metadata: {
        reason: 'annual_partial_refund',
        email,
      },
    })

    console.log(`Issued partial refund of ${refundAmount} cents to ${email}`)
  } catch (err) {
    console.error('Failed to issue annual partial refund:', err)
  }
}