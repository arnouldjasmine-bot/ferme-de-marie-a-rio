'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const liens = [
  { href: '/dashboard',    label: 'Tableau de bord', icone: '📊' },
  { href: '/produits',     label: 'Produits',         icone: '🧺' },
  { href: '/commandes',    label: 'Commandes',        icone: '📦' },
  { href: '/carte',        label: 'Carte livraisons', icone: '🗺️' },
  { href: '/statistiques', label: 'Statistiques',     icone: '📈' },
]

export default function SidebarAdmin() {
  const pathname = usePathname()

  return (
    <aside
      className="w-60 min-h-screen flex flex-col py-6 px-3 shrink-0"
      style={{ backgroundColor: 'var(--vert-sauge-fonce)' }}
    >
      {/* Logo submark + titre */}
      <div className="flex flex-col items-center mb-8 px-2">
        <Image src="/logo-submark.png" alt="FM" width={56} height={56} className="object-contain brightness-0 invert opacity-90 mb-3" />
        <p className="text-white font-bold text-base text-center leading-tight" style={{ fontFamily: 'var(--font-playfair, Georgia)' }}>
          La Ferme de Marie à Rio
        </p>
        <p className="text-white/50 text-xs mt-0.5 tracking-widest uppercase">Administration</p>
      </div>

      {/* Séparateur */}
      <div className="mb-4 mx-2" style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1">
        {liens.map(({ href, label, icone }) => {
          const actif = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
              style={{
                backgroundColor: actif ? 'rgba(245,242,233,0.15)' : 'transparent',
                color: actif ? '#fff' : 'rgba(255,255,255,0.65)',
                borderLeft: actif ? '3px solid var(--terracotta)' : '3px solid transparent',
              }}
            >
              <span className="text-base">{icone}</span>
              <span>{label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Déconnexion */}
      <div className="mt-4 mx-2" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '12px' }}>
        <form action="/api/auth/logout" method="POST">
          <button type="submit" className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-opacity hover:opacity-80" style={{ color: 'rgba(255,255,255,0.5)' }}>
            <span>↩</span> Se déconnecter
          </button>
        </form>
      </div>
    </aside>
  )
}
