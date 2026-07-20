import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user?.email) {
      return NextResponse.json({ error: 'You must be signed in' }, { status: 401 })
    }

    const cleanEmail = user.email.trim().toLowerCase()

    // First get the saved rows
    const { data: saved, error } = await supabase
      .from('saved_teachings')
      .select('id, teaching_number, memo, created_at')
      .eq('email', cleanEmail)
      .order('created_at', { ascending: false })
      .limit(30)

    if (error) {
      console.error('Error fetching saved teachings:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!saved || saved.length === 0) {
      return NextResponse.json({ saved: [] })
    }

    // Then fetch the titles for those teaching numbers
    const numbers = saved.map((s) => s.teaching_number)
    const { data: teachings } = await supabase
      .from('teachings')
      .select('teaching_number, title, date')
      .in('teaching_number', numbers)

    // Merge them
    const teachingsMap = new Map(
      (teachings || []).map((t) => [t.teaching_number, t])
    )

    const result = saved.map((s) => ({
      id: s.id,
      teaching_number: s.teaching_number,
      memo: s.memo,
      created_at: s.created_at,
      teachings: teachingsMap.get(s.teaching_number) || null,
    }))

    return NextResponse.json({ saved: result })
  } catch (err: any) {
    console.error('Unexpected error:', err)
    return NextResponse.json(
      { error: err.message || 'Something went wrong' },
      { status: 500 }
    )
  }
}