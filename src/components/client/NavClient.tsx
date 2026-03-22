'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { usePanier } from '@/lib/panier-context'

export default function NavClient() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const { totalArticles } = usePanier()

  function changerLocale(nouvelleLocale: string) {
    const segments = pathname.split('/')
    segments[1] = nouvelleLocale
    router.push(segments.join('/'))
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
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between gap-4">

        {/* Logo principal */}
        <Link href={`/${locale}`} className="shrink-0">
          <Image
            src="/logo.png"
            alt="Ferme de Marie à Rio"
            width={160}
            height={105}
            className="object-contain w-24 sm:w-36 md:w-40"
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
        </nav>

        {/* Droite : langue + panier */}
        <div className="flex items-center gap-4">
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
