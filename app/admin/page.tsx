import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Header from '@/components/Header'

const ADMIN_EMAIL = 'jprussell@protonmail.com'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Only allow the designated admin
  if (user.email !== ADMIN_EMAIL) {
    redirect('/')
  }

  return (
    <main className="min-h-screen bg-[#F7F4EF]">
      <Header />
      <div className="max-w-3xl mx-auto px-6 pt-16 pb-24">
        <h1 className="text-3xl font-medium text-[#2C2522] mb-2">
          Admin
        </h1>
        <p className="text-[#6B5E54] mb-10">
          Signed in as {user.email}
        </p>

        <div className="space-y-4 text-[15px] text-[#2C2522]">
          <p>This is the beginning of the protected administrative area.</p>
          <p>From here we will later add:</p>
          <ul className="list-disc pl-5 space-y-1 text-[#6B5E54]">
            <li>Stripe / subscription management</li>
            <li>Notes and internal tools</li>
            <li>Conversation monitoring</li>
            <li>Other house-keeping functions</li>
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