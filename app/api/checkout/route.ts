import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe/server'

export async function POST(request: Request) {
  try {
    const { priceId } = await request.json()
    if (!priceId) {
      return NextResponse.json({ error: 'Missing priceId' }, { status: 400 })
    }

    const origin = request.headers.get('origin') || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/membership/welcome?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/membership`,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}