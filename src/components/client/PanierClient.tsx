'use client'

import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { usePanier } from '@/lib/panier-context'

export default function PanierClient({ locale }: { locale: string }) {
  const t = useTranslations('panier')
  const { articles, totalPrix, retirerDuPanier, modifierQuantite } = usePanier()

  if (articles.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">🛒</div>
        <p className="text-lg mb-6" style={{ color: 'var(--couleur-texte-doux)' }}>{t('vide')}</p>
        <Link
          href={`/${locale}/produits`}
          className="inline-block px-6 py-3 rounded-lg text-white font-medium transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--couleur-primaire)' }}
        >
          {t('continuer')}
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Liste articles */}
      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}>
        {articles.map((article, i) => (
          <div
            key={article.produit.id}
            className="flex items-center gap-4 p-4"
            style={{ borderBottom: i < articles.length - 1 ? '1px solid var(--couleur-bordure)' : 'none' }}
          >
            {/* Image */}
            <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 flex items-center justify-center text-2xl" style={{ backgroundColor: 'var(--couleur-accent)' }}>
              {article.produit.image_url
                ? <img src={article.produit.image_url} alt={article.produit.nom} className="w-full h-full object-cover" />
                : '📦'
              }
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold truncate" style={{ color: 'var(--couleur-texte)' }}>{article.produit.nom}</p>
              <p className="text-sm" style={{ color: 'var(--couleur-texte-doux)' }}>R$ {article.produit.prix.toFixed(2)} / {article.produit.unite}</p>
            </div>

            {/* Quantité */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => modifierQuantite(article.produit.id, article.quantite - 1)}
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg transition-opacity hover:opacity-70"
                style={{ backgroundColor: 'var(--couleur-accent)', color: 'var(--couleur-primaire-fonce)' }}
              >
                −
              </button>
              <span className="w-6 text-center font-semibold" style={{ color: 'var(--couleur-texte)' }}>{article.quantite}</span>
              <button
                onClick={() => modifierQuantite(article.produit.id, Math.min(article.quantite + 1, article.produit.stock))}
                className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg transition-opacity hover:opacity-70"
                style={{ backgroundColor: 'var(--couleur-accent)', color: 'var(--couleur-primaire-fonce)' }}
              >
                +
              </button>
            </div>

            {/* Sous-total */}
            <p className="w-20 text-right font-bold shrink-0" style={{ color: 'var(--couleur-primaire-fonce)' }}>
              R$ {(article.produit.prix * article.quantite).toFixed(2)}
            </p>

            {/* Supprimer */}
            <button
              onClick={() => retirerDuPanier(article.produit.id)}
              className="ml-2 opacity-40 hover:opacity-70 transition-opacity text-lg shrink-0"
              style={{ color: 'var(--couleur-erreur)' }}
              title={t('supprimer')}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Total + bouton commander */}
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}>
        <div className="flex justify-between items-center mb-4">
          <span className="font-semibold" style={{ color: 'var(--couleur-texte)' }}>{t('sousTotal')}</span>
          <span className="text-xl font-bold" style={{ color: 'var(--couleur-primaire-fonce)' }}>
            R$ {totalPrix.toFixed(2)}
          </span>
        </div>
        <p className="text-xs text-center mb-3" style={{ color: 'var(--couleur-texte-doux)' }}>
          {locale === 'pt-BR'
            ? 'Mínimo de R$ 30 para entrega a domicílio'
            : 'Minimum de R$ 30 pour la livraison à domicile'}
        </p>
        <Link
          href={`/${locale}/commande`}
          className="block w-full text-center py-3 rounded-lg text-white font-semibold transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--couleur-primaire)' }}
        >
          {t('commander')}
        </Link>
        <Link
          href={`/${locale}/produits`}
          className="block w-full text-center py-2 mt-3 text-sm transition-opacity hover:opacity-70"
          style={{ color: 'var(--couleur-texte-doux)' }}
        >
          {t('continuer')}
        </Link>
      </div>
    </div>
  )
}
