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
    const password = body.password
    const username = (body.username || '').trim() || null

    if (!sessionId || !password) {
      return NextResponse.json(
        { error: 'Session and password are required' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Resolve email + tier from the Stripe session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    })

    const email =
      session.customer_details?.email || session.customer_email

    if (!email) {
      return NextResponse.json(
        { error: 'No email found on session' },
        { status: 400 }
      )
    }

    const subscription =
      typeof session.subscription === 'string'
        ? await stripe.subscriptions.retrieve(session.subscription)
        : session.subscription

    const interval =
      subscription?.items?.data?.[0]?.price?.recurring?.interval
    const billingInterval = interval === 'year' ? 'annual' : 'monthly'

    const price = subscription?.items?.data?.[0]?.price
    const nickname = (price?.nickname || '').toLowerCase()
    let tier = 'house_brew'
    if (nickname.includes('private')) tier = 'private_reserve'

    // Username uniqueness (if provided)
    if (username) {
      const { data: taken } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('username', username)
        .maybeSingle()

      if (taken) {
        return NextResponse.json(
          { error: 'That username is already taken' },
          { status: 400 }
        )
      }
    }

    // Does an auth user already exist for this email?
    const { data: listData } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = listData?.users?.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    )

    let userId: string

    if (existingUser) {
      // Update password on existing user
      const { error: updateError } =
        await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
          password,
          email_confirm: true,
        })
      if (updateError) {
        return NextResponse.json(
          { error: updateError.message },
          { status: 400 }
        )
      }
      userId = existingUser.id
    } else {
      // Create new auth user
      const { data: authData, error: authError } =
        await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        })
      if (authError) {
        return NextResponse.json(
          { error: authError.message },
          { status: 400 }
        )
      }
      userId = authData.user.id
    }

    // Upsert profile — email is the durable key
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(
        {
          id: userId,
          email,
          username,
          subscription_status: tier,
          billing_interval: billingInterval,
          access_ends_at: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      )

    if (profileError) {
      console.error('Profile upsert error:', profileError)
      return NextResponse.json(
        { error: profileError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, email, userId })
  } catch (err: any) {
    console.error('set-credentials error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}