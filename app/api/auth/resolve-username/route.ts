import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json()

    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    // Service-role client (server only – never expose this key to the browser)
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

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('email')
      .ilike('username', username.trim())
      .maybeSingle()

    if (error) {
      console.error('resolve-username error:', error)
      return NextResponse.json(
        { error: 'Unable to look up username' },
        { status: 500 }
      )
    }

    if (!data?.email) {
      return NextResponse.json(
        { error: 'No member found with that username' },
        { status: 404 }
      )
    }

    return NextResponse.json({ email: data.email })
  } catch (err) {
    console.error(err)
    return NextResponse.json(
      { error: 'Unexpected error' },
      { status: 500 }
    )
  }
}