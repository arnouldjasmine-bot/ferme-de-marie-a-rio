import type { Metadata } from 'next'
import '../globals.css'

export const metadata: Metadata = {
  title: 'Connexion — Ferme de Marie à Rio',
  robots: { index: false, follow: false }
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
