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

  const actif = (href: string) => pathname.startsWith(href)

  const items = [
    {
      href: `/${locale}`,
      exact: true,
      label: pt ? 'Início' : 'Accueil',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 12L12 3l9 9"/><path d="M9 21V12h6v9"/>
        </svg>
      ),
    },
    {
      href: `/${locale}/produits`,
      label: pt ? 'Produtos' : 'Produits',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
        </svg>
      ),
    },
    {
      href: `/${locale}/panier`,
      label: pt ? 'Carrinho' : 'Panier',
      badge: totalArticles > 0 ? totalArticles : null,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
        </svg>
      ),
    },
    {
      href: `/${locale}/avis`,
      label: pt ? 'Avaliações' : 'Avis',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ),
    },
    {
      href: user ? `/${locale}/mes-commandes` : `/${locale}/compte/connexion`,
      label: user ? (pt ? 'Pedidos' : 'Commandes') : (pt ? 'Entrar' : 'Compte'),
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
        </svg>
      ),
    },
  ]

  return (
    <>
      {/* Spacer pour que le contenu ne passe pas sous la barre */}
      <div className="h-16 sm:hidden" />

      <nav
        className="sm:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around safe-area-inset-bottom"
        style={{
          backgroundColor: 'rgba(245, 242, 233, 0.97)',
          backdropFilter: 'blur(12px)',
          borderTop: '1px solid var(--couleur-bordure)',
          boxShadow: '0 -2px 12px rgba(0,0,0,0.08)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {items.map(item => {
          const isActif = item.exact
            ? pathname === item.href
            : actif(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-0.5 py-2 px-3 relative"
              style={{ color: isActif ? 'var(--vert-sauge-fonce)' : 'var(--couleur-texte-doux)' }}
            >
              <div className="relative">
                {item.icon}
                {item.badge != null && (
                  <span
                    className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-xs flex items-center justify-center font-bold text-white"
                    style={{ backgroundColor: 'var(--terracotta)', fontSize: 10 }}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium" style={{ fontSize: 10 }}>{item.label}</span>
              {isActif && (
                <span
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-5 h-0.5 rounded-full"
                  style={{ backgroundColor: 'var(--vert-sauge-fonce)' }}
                />
              )}
            </Link>
          )
        })}
      </nav>
    </>
  )
}
