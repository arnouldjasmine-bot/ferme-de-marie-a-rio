'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { useState } from 'react'
import { usePanier } from '@/lib/panier-context'
import { useAuth } from './AuthProvider'

export default function NavClient() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const { totalArticles } = usePanier()
  const { user, profile, signOut } = useAuth()
  const [menuOuvert, setMenuOuvert] = useState(false)
  const pt = locale === 'pt-BR'

  function changerLocale(nouvelleLocale: string) {
    const segments = pathname.split('/')
    segments[1] = nouvelleLocale
    router.push(segments.join('/'))
  }

  async function handleSignOut() {
    setMenuOuvert(false)
    await signOut()
    router.push(`/${locale}`)
    router.refresh()
  }

  return (
    <header
      className="sticky top-0 z-50"
      style={{
        backgroundColor: 'rgba(245, 242, 233, 0.96)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid var(--couleur-bordure)',
        boxShadow: 'var(--ombre-nav)'
      }}
    >
      <div className="max-w-6xl mx-auto px-4 py-1 flex items-center justify-between gap-4">

        {/* Logo principal */}
        <Link href={`/${locale}`} className="shrink-0">
          <Image
            src="/logo.png"
            alt="Ferme de Marie à Rio"
            width={200}
            height={130}
            className="object-contain w-28 sm:w-40 md:w-44"
            priority
          />
        </Link>

        {/* Navigation centrale */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link
            href={`/${locale}/produits`}
            className="relative pb-0.5 transition-colors hover:opacity-70"
            style={{ color: 'var(--vert-sauge-fonce)', fontFamily: 'var(--font-dm-sans)' }}
          >
            {t('produits')}
          </Link>
          <Link
            href={`/${locale}/avis`}
            className="relative pb-0.5 transition-colors hover:opacity-70"
            style={{ color: 'var(--vert-sauge-fonce)', fontFamily: 'var(--font-dm-sans)' }}
          >
            {pt ? 'Avaliações' : 'Avis'}
          </Link>
        </nav>

        {/* Droite : langue + compte + panier */}
        <div className="flex items-center gap-3">
          {/* Sélecteur langue */}
          <div className="flex items-center gap-1 text-xs font-semibold tracking-widest uppercase">
            <button
              onClick={() => changerLocale('fr')}
              className="px-1.5 py-0.5 rounded transition-all"
              style={{
                color: locale === 'fr' ? 'var(--vert-sauge-fonce)' : 'var(--couleur-texte-doux)',
                fontWeight: locale === 'fr' ? 700 : 400,
                borderBottom: locale === 'fr' ? '2px solid var(--terracotta)' : '2px solid transparent'
              }}
            >
              FR
            </button>
            <span style={{ color: 'var(--couleur-bordure)' }}>|</span>
            <button
              onClick={() => changerLocale('pt-BR')}
              className="px-1.5 py-0.5 rounded transition-all"
              style={{
                color: locale === 'pt-BR' ? 'var(--vert-sauge-fonce)' : 'var(--couleur-texte-doux)',
                fontWeight: locale === 'pt-BR' ? 700 : 400,
                borderBottom: locale === 'pt-BR' ? '2px solid var(--terracotta)' : '2px solid transparent'
              }}
            >
              PT
            </button>
          </div>

          {/* Compte utilisateur */}
          {!user ? (
            <Link
              href={`/${locale}/compte/connexion`}
              className="hidden sm:flex items-center gap-1 text-sm font-medium px-3 py-1.5 rounded-full border transition-colors hover:opacity-80"
              style={{ color: 'var(--vert-sauge-fonce)', borderColor: 'var(--couleur-bordure)' }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
              <span>{pt ? 'Entrar' : 'Se connecter'}</span>
            </Link>
          ) : (
            <div className="relative">
              <button
                onClick={() => setMenuOuvert(v => !v)}
                className="hidden sm:flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full border transition-colors hover:opacity-80"
                style={{ color: 'var(--vert-sauge-fonce)', borderColor: 'var(--couleur-bordure)' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                </svg>
                <span>{profile?.prenom ?? (pt ? 'Conta' : 'Compte')}</span>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                  <path d="M2 3l3 4 3-4"/>
                </svg>
              </button>

              {menuOuvert && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOuvert(false)} />
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-xl overflow-hidden z-20 py-1"
                    style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-modale)', border: '1px solid var(--couleur-bordure)' }}
                  >
                    <Link
                      href={`/${locale}/mes-commandes`}
                      onClick={() => setMenuOuvert(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                      style={{ color: 'var(--couleur-texte)' }}
                    >
                      📦 {pt ? 'Meus pedidos' : 'Mes commandes'}
                    </Link>
                    <Link
                      href={`/${locale}/favoris`}
                      onClick={() => setMenuOuvert(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors"
                      style={{ color: 'var(--couleur-texte)' }}
                    >
                      ❤️ {pt ? 'Favoritos' : 'Favoris'}
                    </Link>
                    <div style={{ height: 1, backgroundColor: 'var(--couleur-bordure)', margin: '4px 0' }} />
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors text-left"
                      style={{ color: 'var(--couleur-texte-doux)' }}
                    >
                      ↩ {pt ? 'Sair' : 'Se déconnecter'}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Bouton panier */}
          <Link
            href={`/${locale}/panier`}
            className="relative flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full text-white text-sm font-medium transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--vert-sauge)', fontFamily: 'var(--font-dm-sans)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
            </svg>
            <span className="hidden sm:inline">{t('panier')}</span>
            {totalArticles > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold text-white"
                style={{ backgroundColor: 'var(--terracotta)' }}
              >
                {totalArticles}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
