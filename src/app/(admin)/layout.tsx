import type { Metadata } from 'next'
import '../globals.css'
import SidebarAdmin from '@/components/admin/SidebarAdmin'
import BoutonRefreshMobile from '@/components/admin/BoutonRefreshMobile'

export const metadata: Metadata = {
  title: 'Admin — Ferme de Marie à Rio',
  robots: { index: false, follow: false },
  manifest: '/admin-manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FM Admin',
  },
  themeColor: '#4A5D4E',
}

type Props = {
  children: React.ReactNode
}

export default function AdminLayout({ children }: Props) {
  return (
    <html lang="fr">
      <head>
        <link rel="manifest" href="/admin-manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="FM Admin" />
        <meta name="theme-color" content="#4A5D4E" />
      </head>
      <body>
        <div className="min-h-screen flex">
          <SidebarAdmin />
          <main className="flex-1 p-4 md:p-8 pt-16 md:pt-8 overflow-x-hidden" style={{ backgroundColor: 'var(--admin-fond)' }}>
            {children}
            <BoutonRefreshMobile />
          </main>
        </div>
      </body>
    </html>
  )
}
