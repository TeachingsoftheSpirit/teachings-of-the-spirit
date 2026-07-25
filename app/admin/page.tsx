import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import Header from '@/components/Header'
import { stripe } from '@/lib/stripe/server'
import AdminMemberLookup from '@/components/AdminMemberLookup'
import AdminLetters from '@/components/AdminLetters'

const ADMIN_EMAIL = 'jprussell@protonmail.com'

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }
  if (user.email !== ADMIN_EMAIL) {
    redirect('/')
  }

  let stripeStatus = 'Not connected'
  let productCount = 0
  try {
    const products = await stripe.products.list({ limit: 5 })
    productCount = products.data.length
    stripeStatus = 'Connected'
  } catch (err) {
    stripeStatus = 'Error connecting to Stripe'
    console.error(err)
  }

  let counts = {
    total: 0,
    house_brew: 0,
    private_reserve: 0,
    canceled: 0,
    magic: 0,
  }

  try {
    const admin = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { data, error } = await admin
      .from('profiles')
      .select('subscription_status')

    if (!error && data) {
      counts.total = data.length
      for (const row of data) {
        const s = row.subscription_status
        if (s === 'house_brew') counts.house_brew++
        else if (s === 'private_reserve') counts.private_reserve++
        else if (s === 'canceled' || s === 'cancelled') counts.canceled++
        else counts.magic++
      }
    }
  } catch (err) {
    console.error('Admin counts error:', err)
  }

  return (
    <main className="min-h-screen bg-[#F7F4EF]">
      <Header />
      <div className="max-w-3xl mx-auto px-6 pt-16 pb-24">
        <h1 className="text-3xl font-medium text-[#2C2522] mb-2">Admin</h1>
        <p className="text-[#6B5E54] mb-10">Signed in as {user.email}</p>

        <section className="mb-12 p-6 rounded-xl border border-[#E5DFD3] bg-white/50">
          <h2 className="text-lg font-medium text-[#2C2522] mb-3">House counts</h2>
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-3 text-[15px]">
            <div>
              <dt className="text-[#8A7B65] text-sm">Profiles</dt>
              <dd className="text-[#2C2522] font-medium">{counts.total}</dd>
            </div>
            <div>
              <dt className="text-[#8A7B65] text-sm">House Brew</dt>
              <dd className="text-[#2C2522] font-medium">{counts.house_brew}</dd>
            </div>
            <div>
              <dt className="text-[#8A7B65] text-sm">Private Reserve</dt>
              <dd className="text-[#2C2522] font-medium">{counts.private_reserve}</dd>
            </div>
            <div>
              <dt className="text-[#8A7B65] text-sm">Canceled (row)</dt>
              <dd className="text-[#2C2522] font-medium">{counts.canceled}</dd>
            </div>
            <div>
              <dt className="text-[#8A7B65] text-sm">Magic Link only</dt>
              <dd className="text-[#2C2522] font-medium">{counts.magic}</dd>
            </div>
          </dl>
          <p className="mt-4 text-[12px] text-[#8A7B65] leading-relaxed">
            Counts read from profiles.subscription_status. They do not re-query Stripe.
          </p>
        </section>

        <AdminLetters />

        <AdminMemberLookup />

        <section className="mb-12 p-6 rounded-xl border border-[#E5DFD3] bg-white/50">
          <h2 className="text-lg font-medium text-[#2C2522] mb-3">Stripe</h2>
          <p className="text-[15px] text-[#6B5E54] mb-1">
            Status: <span className="text-[#2C2522]">{stripeStatus}</span>
          </p>
          {stripeStatus === 'Connected' && (
            <p className="text-[15px] text-[#6B5E54]">
              Products found: {productCount}
            </p>
          )}
        </section>

        <div className="space-y-4 text-[15px] text-[#2C2522]">
          <p>Launch Admin baseline is in place:</p>
          <ul className="list-disc pl-5 space-y-1 text-[#6B5E54]">
            <li>Letters to the house</li>
            <li>Member lookup + full list dropdown</li>
            <li>Manual tier override + note</li>
            <li>House counts</li>
            <li>Stripe connectivity check</li>
          </ul>
        </div>

        <div className="mt-14">
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="text-sm text-[#6B5E54] hover:text-[#2C2522] underline underline-offset-2 transition-colors"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}