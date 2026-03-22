'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const liens = [
  { href: '/dashboard',          label: 'Tableau de bord', icone: '📊' },
  { href: '/produits',           label: 'Produits',         icone: '🛒' },
  { href: '/commandes',          label: 'Commandes',        icone: '📦' },
  { href: '/commandes/relances', label: 'Relances',         icone: '⚠️' },
  { href: '/medrio',             label: 'MedRio',           icone: '🏥' },
  { href: '/carte',              label: 'Carte livraisons', icone: '🗺️' },
  { href: '/statistiques',       label: 'Statistiques',     icone: '📈' },
]

export default function SidebarAdmin() {
  const pathname = usePathname()
  const [ouvert, setOuvert] = useState(false)

  const titrePage = liens.find(l => pathname === l.href || pathname.startsWith(l.href + '/'))?.label ?? 'Admin'

  const navContent = (
    <>
      {/* Logo + titre */}
      <div className="flex flex-col items-center mb-8 px-2">
        <Image src="/logo-submark.png" alt="FM" width={56} height={56} className="object-contain brightness-0 invert opacity-90 mb-3" />
        <p className="text-white font-bold text-base text-center leading-tight" style={{ fontFamily: 'var(--font-playfair, Georgia)' }}>
          La Ferme de Marie à Rio
        </p>
        <p className="text-white/50 text-xs mt-0.5 tracking-widest uppercase">Administration</p>
      </div>

      <div className="mb-4 mx-2" style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1">
        {liens.map(({ href, label, icone }) => {
          const actif = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setOuvert(false)}
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
    </>
  )

  return (
    <>
      {/* ── Header mobile ── */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3"
        style={{ backgroundColor: 'var(--vert-sauge-fonce)', height: 56 }}
      >
        <button
          onClick={() => setOuvert(true)}
          className="flex flex-col gap-1.5 p-1"
          aria-label="Menu"
        >
          <span className="block w-6 h-0.5 bg-white/80 rounded" />
          <span className="block w-6 h-0.5 bg-white/80 rounded" />
          <span className="block w-6 h-0.5 bg-white/80 rounded" />
        </button>
        <p className="text-white text-sm font-semibold">{titrePage}</p>
        <Image src="/logo-submark.png" alt="FM" width={32} height={32} className="object-contain brightness-0 invert opacity-80" />
      </header>

      {/* ── Overlay mobile ── */}
      {ouvert && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setOuvert(false)}
        />
      )}

      {/* ── Drawer mobile ── */}
      <aside
        className={`md:hidden fixed top-0 left-0 h-full z-50 flex flex-col py-6 px-3 transition-transform duration-300 ${ouvert ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ width: 240, backgroundColor: 'var(--vert-sauge-fonce)' }}
      >
        <button
          onClick={() => setOuvert(false)}
          className="absolute top-4 right-4 text-white/60 hover:text-white text-xl"
        >
          ✕
        </button>
        {navContent}
      </aside>

      {/* ── Sidebar desktop ── */}
      <aside
        className="hidden md:flex w-60 min-h-screen flex-col py-6 px-3 shrink-0"
        style={{ backgroundColor: 'var(--vert-sauge-fonce)' }}
      >
        {navContent}
      </aside>
    </>
  )
}
