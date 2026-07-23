import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
})

export async function POST(req: NextRequest) {
  try {
    const { session_id, username, password } = await req.json()

    if (!session_id || !username || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const cleanUsername = username.trim().toLowerCase()

    if (cleanUsername.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Verify the Stripe session is paid
    const session = await stripe.checkout.sessions.retrieve(session_id)
    if (session.payment_status !== 'paid') {
      return NextResponse.json(
        { error: 'Payment not completed' },
        { status: 400 }
      )
    }

    const email = session.customer_details?.email || session.customer_email
    if (!email) {
      return NextResponse.json(
        { error: 'No email found on the payment session' },
        { status: 400 }
      )
    }

    // Service-role client
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Check username is free
    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .ilike('username', cleanUsername)
      .maybeSingle()

    if (existing) {
      return NextResponse.json(
        { error: 'That username is already taken. Please choose another.' },
        { status: 409 }
      )
    }

    // Find the Auth user by email
    const { data: listData, error: listError } =
      await supabaseAdmin.auth.admin.listUsers()

    if (listError) {
      console.error(listError)
      return NextResponse.json(
        { error: 'Unable to look up account' },
        { status: 500 }
      )
    }

    const authUser = listData.users.find(
      (u) => u.email?.toLowerCase() === email.toLowerCase()
    )

    if (!authUser) {
      return NextResponse.json(
        { error: 'Account not found. Please contact support.' },
        { status: 404 }
      )
    }

    // Set the password
    const { error: updateAuthError } =
      await supabaseAdmin.auth.admin.updateUserById(authUser.id, {
        password,
      })

    if (updateAuthError) {
      console.error(updateAuthError)
      return NextResponse.json(
        { error: 'Unable to set password' },
        { status: 500 }
      )
    }

    // Set the username on the profile
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({
        username: cleanUsername,
        updated_at: new Date().toISOString(),
      })
      .eq('email', email)

    if (profileError) {
      console.error(profileError)
      return NextResponse.json(
        { error: 'Unable to save username' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, username: cleanUsername })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json(
      { error: err.message || 'Unexpected error' },
      { status: 500 }
    )
  }
}