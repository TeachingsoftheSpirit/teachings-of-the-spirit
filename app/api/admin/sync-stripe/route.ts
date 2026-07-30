import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const ADMIN_EMAIL = 'jprussell@protonmail.com'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-06-24.dahlia',
})

/** Map Checkout price IDs → app tier + interval */
const PRICE_MAP: Record<
  string,
  { tier: 'house_brew' | 'private_reserve'; interval: 'monthly' | 'annual' }
> = {
  // House Brew
  price_1TvnT3DAWPDfVwdnpN1woX0c: { tier: 'house_brew', interval: 'monthly' },
  price_1TvnTaDAWPDfVwdnrquyVBlD: { tier: 'house_brew', interval: 'annual' },
  // Private Reserve
  price_1TvnUGDAWPDfVwdnb0dPIKXk: {
    tier: 'private_reserve',
    interval: 'monthly',
  },
  price_1TvnUpDAWPDfVwdnAN2oCC24: {
    tier: 'private_reserve',
    interval: 'annual',
  },
}

function mapPriceId(priceId: string | undefined | null): {
  tier: string | null
  interval: string | null
} {
  if (!priceId) return { tier: null, interval: null }
  const hit = PRICE_MAP[priceId]
  if (hit) return { tier: hit.tier, interval: hit.interval }
  // Fallback: infer from price id / leave null so admin can see "unknown"
  return { tier: null, interval: null }
}

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

    const admin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select(
        'id, email, username, subscription_status, billing_interval, stripe_customer_id, access_ends_at, created_at, admin_note, admin_note_at'
      )
      .eq('id', profileId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    if (!profile.stripe_customer_id) {
      return NextResponse.json({
        success: true,
        member: profile,
        stripe: {
          found: false,
          message: 'No stripe_customer_id on profile — nothing to sync',
        },
      })
    }

    // Active + trialing + past_due matter for access; also check canceled recently via list
    const subscriptions = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: 'all',
      limit: 10,
    })

    const relevant = subscriptions.data.filter((s) =>
      ['active', 'trialing', 'past_due'].includes(s.status)
    )

    // Prefer active/trialing over past_due
    const ordered = [...relevant].sort((a, b) => {
      const rank = (s: Stripe.Subscription) =>
        s.status === 'active' || s.status === 'trialing' ? 0 : 1
      return rank(a) - rank(b)
    })

    const sub = ordered[0] as
      | (Stripe.Subscription & {
          current_period_end?: number
          cancel_at_period_end?: boolean
        })
      | undefined

    let subscription_status: string | null = null
    let billing_interval: string | null = null
    let access_ends_at: string | null = null
    let stripeSummary: Record<string, unknown>

    if (!sub) {
      subscription_status = 'canceled'
      billing_interval = null
      access_ends_at = null
      stripeSummary = {
        found: true,
        activeSubscription: false,
        customer: profile.stripe_customer_id,
        message: 'No active/trialing/past_due subscription in Stripe',
        rawStatuses: subscriptions.data.map((s) => s.status),
      }
    } else {
      const priceId =
        typeof sub.items.data[0]?.price?.id === 'string'
          ? sub.items.data[0].price.id
          : null
      const mapped = mapPriceId(priceId)

      subscription_status = mapped.tier
      billing_interval = mapped.interval

      // If mapping failed, still record something useful for the admin
      if (!subscription_status) {
        subscription_status = 'private_reserve' // safe? No — leave explicit unknown
        // Use a sentinel the UI can show; keep prior tier if unknown price
        subscription_status = profile.subscription_status
        stripeSummary = {
          found: true,
          activeSubscription: true,
          warning: `Unknown price id ${priceId} — tier left unchanged`,
          status: sub.status,
          cancel_at_period_end: !!sub.cancel_at_period_end,
          priceId,
        }
      } else {
        stripeSummary = {
          found: true,
          activeSubscription: true,
          status: sub.status,
          cancel_at_period_end: !!sub.cancel_at_period_end,
          priceId,
          tier: subscription_status,
          interval: billing_interval,
        }
      }

      const periodEnd = sub.current_period_end
      if (sub.cancel_at_period_end && periodEnd) {
        access_ends_at = new Date(periodEnd * 1000).toISOString()
      } else {
        access_ends_at = null
      }
    }

    const note = `Synced from Stripe ${new Date().toISOString().slice(0, 10)}`

    const { data: updated, error: updateError } = await admin
      .from('profiles')
      .update({
        subscription_status,
        billing_interval,
        access_ends_at,
        admin_note: note,
        admin_note_at: new Date().toISOString(),
      })
      .eq('id', profileId)
      .select(
        'id, email, username, subscription_status, billing_interval, stripe_customer_id, access_ends_at, created_at, admin_note, admin_note_at'
      )
      .single()

    if (updateError) {
      console.error('Sync Stripe update error:', updateError)
      return NextResponse.json({ error: updateError.message }, { status: 500 })
    }

    console.log(
      `Admin Stripe sync by ${user.email}: profile ${profileId}`,
      stripeSummary
    )

    return NextResponse.json({
      success: true,
      member: updated,
      stripe: stripeSummary,
    })
  } catch (err: any) {
    console.error('Admin sync-stripe unexpected:', err)
    return NextResponse.json(
      { error: err.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}