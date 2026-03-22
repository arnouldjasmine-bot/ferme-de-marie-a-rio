import type { Metadata } from 'next'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { Playfair_Display, Dancing_Script, DM_Sans } from 'next/font/google'
import { routing } from '@/i18n/routing'
import { PanierProvider } from '@/lib/panier-context'
import '../globals.css'

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })
const dancing = Dancing_Script({ subsets: ['latin'], variable: '--font-dancing' })
const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans' })

export const metadata: Metadata = {
  title: 'Ferme de Marie à Rio',
  description: 'Produits fermiers frais, livrés chez vous au sud de Rio de Janeiro',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Ferme de Marie à Rio',
  },
  formatDetection: { telephone: false },
  themeColor: '#4A5D4E',
}

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  if (!routing.locales.includes(locale as 'fr' | 'pt-BR')) {
    notFound()
  }

  const messages = await getMessages()

  return (
    <html lang={locale} className={`${playfair.variable} ${dancing.variable} ${dmSans.variable}`}>
      <head>
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Ferme de Marie" />
        {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
          <script
            src={`https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`}
            async
          />
        )}
      </head>
      <body>
        <NextIntlClientProvider messages={messages}>
          <PanierProvider>
            {children}
          </PanierProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}

export function generateStaticParams() {
  return routing.locales.map(locale => ({ locale }))
}
