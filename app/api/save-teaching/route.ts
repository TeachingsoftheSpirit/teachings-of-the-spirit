import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Require a real authenticated session
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user?.email) {
      return NextResponse.json({ error: 'You must be signed in' }, { status: 401 })
    }

    const { teaching_number, memo } = await request.json()

    if (!teaching_number || typeof teaching_number !== 'number') {
      return NextResponse.json({ error: 'teaching_number is required' }, { status: 400 })
    }

    const cleanEmail = user.email.trim().toLowerCase()

    const { data, error } = await supabase
      .from('saved_teachings')
      .upsert(
        {
          email: cleanEmail,
          teaching_number,
          memo: memo || null,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: 'email,teaching_number',
        }
      )
      .select()
      .single()

    if (error) {
      console.error('Error saving teaching:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, saved: data })
  } catch (err: any) {
    console.error('Unexpected error:', err)
    return NextResponse.json(
      { error: err.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}