import type { Metadata } from 'next'
import '../globals.css'
import { Playfair_Display, DM_Sans } from 'next/font/google'

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })
const dmSans   = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' })

export const metadata: Metadata = {
  title: 'Paiement — La Ferme de Marie à Rio',
  robots: { index: false, follow: false },
}

export default function PayerLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${playfair.variable} ${dmSans.variable}`}>
      <body>
        {children}
      </body>
    </html>
  )
}
