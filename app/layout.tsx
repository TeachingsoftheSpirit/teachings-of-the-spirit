import type { Metadata } from 'next'
import { EB_Garamond } from 'next/font/google'
import './globals.css'
import Footer from '@/components/Footer'

const garamond = EB_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-garamond',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Teachings of the Spirit',
  description: 'A private library of spiritual teachings received over many years',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={garamond.variable}>
      <body className="font-garamond antialiased bg-[#F7F4EF] text-[#2C2522] min-h-screen flex flex-col">
        <div className="flex-1">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  )
}