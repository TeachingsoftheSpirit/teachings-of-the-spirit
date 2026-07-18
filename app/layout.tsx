import type { Metadata } from 'next'
import { EB_Garamond } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'

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
      <body className="font-garamond antialiased bg-[#F7F4EF] text-[#2C2522]">
        <Header />
        {children}
      </body>
    </html>
  )
}