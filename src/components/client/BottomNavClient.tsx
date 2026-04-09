'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import { usePanier } from '@/lib/panier-context'
import { useAuth } from './AuthProvider'

export default function BottomNavClient() {
  const locale = useLocale()
  const pathname = usePathname()
  const pt = locale === 'pt-BR'
  const { totalArticles } = usePanier()
  const { user } = useAuth()

  const isActive = (href: string, exact = false) =>
    exact ? pathname === href : pathname.startsWith(href)

  const items = [
    {
      href: `/${locale}`,
      exact: true,
      label: pt ? 'Início' : 'Accueil',
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12L12 3l9 9"/>
          <path d="M9 21V12h6v9"/>
        </svg>
      ),
    },
    {
      href: `/${locale}/produits`,
      label: pt ? 'Produtos' : 'Produits',
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
          <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
        </svg>
      ),
    },
    {
      href: `/${locale}/panier`,
      label: pt ? 'Carrinho' : 'Panier',
      badge: totalArticles > 0 ? totalArticles : null,
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
          <line x1="3" y1="6" x2="21" y2="6"/>
          <path d="M16 10a4 4 0 01-8 0"/>
        </svg>
      ),
    },
    {
      href: `/${locale}/avis`,
      label: pt ? 'Avaliações' : 'Avis',
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ),
    },
    {
      href: user ? `/${locale}/mes-commandes` : `/${locale}/compte/connexion`,
      label: user ? (pt ? 'Pedidos' : 'Compte') : (pt ? 'Entrar' : 'Compte'),
      icon: (active: boolean) => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="4"/>
          <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        </svg>
      ),
    },
  ]

  return (
    <>
      {/* Spacer */}
      <div className="h-20 sm:hidden" />

      <nav
        className="sm:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{
          backgroundColor: 'rgba(245, 242, 233, 0.96)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(74,93,78,0.10)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        <div className="flex items-center justify-around px-1 pt-1 pb-1">
          {items.map(item => {
            const active = item.exact ? isActive(item.href, true) : isActive(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl relative transition-all"
                style={{
                  color: active ? 'var(--vert-sauge-fonce)' : 'var(--couleur-texte-doux)',
                  backgroundColor: active ? 'rgba(74,93,78,0.08)' : 'transparent',
                  minWidth: 52,
                }}
              >
                <div className="relative">
                  {item.icon(active)}
                  {item.badge != null && (
                    <span
                      className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full flex items-center justify-center font-bold text-white"
                      style={{ backgroundColor: 'var(--terracotta)', fontSize: 9 }}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <span
                  className="font-medium"
                  style={{
                    fontSize: 9,
                    color: active ? 'var(--vert-sauge-fonce)' : 'var(--couleur-texte-doux)',
                    fontFamily: 'var(--font-dm-sans)',
                  }}
                >
                  {item.label}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
