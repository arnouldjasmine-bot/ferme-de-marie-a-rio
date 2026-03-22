import type { Metadata } from 'next'
import '../globals.css'
import SidebarAdmin from '@/components/admin/SidebarAdmin'

export const metadata: Metadata = {
  title: 'Admin — Ferme de Marie à Rio',
  robots: { index: false, follow: false }
}

type Props = {
  children: React.ReactNode
}

export default function AdminLayout({ children }: Props) {
  return (
    <html lang="fr">
      <body>
        <div className="min-h-screen flex">
          <SidebarAdmin />
          <main className="flex-1 p-6 md:p-8" style={{ backgroundColor: 'var(--admin-fond)' }}>
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
