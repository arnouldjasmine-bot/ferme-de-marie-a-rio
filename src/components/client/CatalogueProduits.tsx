'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { type Produit } from '@/types'
import { usePanier } from '@/lib/panier-context'
import { useAuth } from './AuthProvider'
import BoutonFavori from './BoutonFavori'

type CategorieItem = { id: string; value: string; label_fr: string; label_pt: string; emoji: string }

const UNITES_PT: Record<string, string> = {
  'pièce': 'unidade',
  'unité': 'unidade',
  'unidade': 'unidade',
  'pot 300g': 'pote 300g',
  'pot 200ml': 'pote 200ml',
  'pot 250g': 'pote 250g',
  'pot 500g': 'pote 500g',
  'kg': 'kg',
  'g': 'g',
  '500g': '500g',
  '250g': '250g',
  '1kg': '1kg',
}

function tradUnit(unite: string, locale: string): string {
  if (locale !== 'pt-BR') return unite
  return UNITES_PT[unite] ?? unite
}

type Props = { produits: Produit[]; locale: string; categories: CategorieItem[] }

export default function CatalogueProduits({ produits, locale, categories }: Props) {
  const t = useTranslations('produits')
  const { ajouterAuPanier, articles } = usePanier()
  const { user } = useAuth()
  const [filtreCategorie, setFiltreCategorie] = useState<string>('toutes')
  const [ajoutes, setAjoutes] = useState<Set<string>>(new Set())

  const produitsFiltres = filtreCategorie === 'toutes'
    ? produits
    : produits.filter(p => p.categorie === filtreCategorie)

  function handleAjouter(produit: Produit) {
    ajouterAuPanier(produit)
    setAjoutes(prev => new Set(prev).add(produit.id))
    setTimeout(() => setAjoutes(prev => { const s = new Set(prev); s.delete(produit.id); return s }), 1200)
  }

  const labelCat = (cat: string) => {
    const found = categories.find(c => c.value === cat)
    if (!found) return cat
    return locale === 'pt-BR' ? found.label_pt : found.label_fr
  }
  const emojiCat = (cat: string) => categories.find(c => c.value === cat)?.emoji ?? '🌿'

  return (
    <div>
      {/* Filtres */}
      <div className="flex gap-2 flex-wrap mb-8">
        <button
          onClick={() => setFiltreCategorie('toutes')}
          className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
          style={{
            backgroundColor: filtreCategorie === 'toutes' ? 'var(--couleur-primaire)' : 'var(--couleur-fond-carte)',
            color: filtreCategorie === 'toutes' ? '#fff' : 'var(--couleur-texte)',
            boxShadow: 'var(--ombre-carte)'
          }}
        >
          {locale === 'pt-BR' ? 'Todos' : 'Tous'}
        </button>
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => setFiltreCategorie(cat.value)}
            className="px-4 py-2 rounded-full text-sm font-medium transition-colors"
            style={{
              backgroundColor: filtreCategorie === cat.value ? 'var(--couleur-primaire)' : 'var(--couleur-fond-carte)',
              color: filtreCategorie === cat.value ? '#fff' : 'var(--couleur-texte)',
              boxShadow: 'var(--ombre-carte)'
            }}
          >
            {cat.emoji} {locale === 'pt-BR' ? cat.label_pt : cat.label_fr}
          </button>
        ))}
      </div>

      {/* Grille produits */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {produitsFiltres.map(produit => {
          const quantiteAuPanier = articles.find(a => a.produit.id === produit.id)?.quantite ?? 0
          const estAjoute = ajoutes.has(produit.id)

          return (
            <div
              key={produit.id}
              className="rounded-xl overflow-hidden flex flex-col"
              style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}
            >
              {/* Image cliquable → fiche produit */}
              <div className="relative" style={{ height: 140, backgroundColor: 'var(--couleur-accent)' }}>
                <Link href={`/${locale}/produits/${produit.id}`} className="block w-full h-full">
                  {produit.image_url
                    ? <img src={produit.image_url} alt={produit.nom} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-4xl">
                        {produit.categorie ? emojiCat(produit.categorie) : '📦'}
                      </div>
                  }
                </Link>
                {produit.stock <= 3 && produit.stock > 0 && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: 'var(--couleur-attention)' }}>
                    {locale === 'pt-BR' ? 'Últimas unidades' : 'Dernières unités'}
                  </span>
                )}
                {/* Bouton favori — visible uniquement si connecté */}
                {user && (
                  <div className="absolute top-2 right-2">
                    <BoutonFavori productId={produit.id} locale={locale} />
                  </div>
                )}
              </div>

              {/* Contenu */}
              <div className="p-3 flex flex-col flex-1 gap-2">
                {produit.categorie && (
                  <span className="text-xs font-medium" style={{ color: 'var(--couleur-texte-doux)' }}>
                    {emojiCat(produit.categorie)} {labelCat(produit.categorie)}
                  </span>
                )}
                <Link href={`/${locale}/produits/${produit.id}`} className="font-semibold text-sm leading-tight hover:underline" style={{ color: 'var(--couleur-texte)' }}>{produit.nom}</Link>
                <div className="flex items-baseline gap-1 mt-auto">
                  <span className="font-bold" style={{ color: 'var(--couleur-primaire-fonce)' }}>
                    R$ {produit.prix.toFixed(2)}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--couleur-texte-doux)' }}>/ {tradUnit(produit.unite, locale)}</span>
                </div>
                <p className="text-xs" style={{ color: produit.stock <= 3 ? 'var(--couleur-attention)' : 'var(--couleur-texte-doux)' }}>
                  {locale === 'pt-BR' ? `Estoque: ${produit.stock}` : `Stock : ${produit.stock}`}
                </p>

                {produit.stock === 0
                  ? <p className="text-xs text-center py-2 rounded-lg" style={{ backgroundColor: 'var(--couleur-accent)', color: 'var(--couleur-texte-doux)' }}>
                      {t('rupture')}
                    </p>
                  : (
                    <button
                      onClick={() => handleAjouter(produit)}
                      className="w-full py-2 rounded-lg text-white text-sm font-medium transition-all"
                      style={{
                        backgroundColor: estAjoute ? 'var(--couleur-succes)' : 'var(--couleur-primaire)',
                        transform: estAjoute ? 'scale(0.97)' : 'scale(1)'
                      }}
                    >
                      {estAjoute ? (locale === 'pt-BR' ? '✓ Adicionado' : '✓ Ajouté') : quantiteAuPanier > 0 ? `${t('ajouter')} (${quantiteAuPanier})` : t('ajouter')}
                    </button>
                  )
                }
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
