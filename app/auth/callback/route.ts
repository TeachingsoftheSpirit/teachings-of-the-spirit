import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Always land on the Thank-you page after a successful key
      return NextResponse.redirect(`${origin}/verified`)
    }
  }

  // Quiet failure
  return NextResponse.redirect(`${origin}/?key=invalid`)
}