'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { CATEGORIES, type Produit, type Categorie } from '@/types'
import { usePanier } from '@/lib/panier-context'

const EMOJIS: Record<string, string> = {
  fruits: '🍍', legumes: '🥬', confiture: '🍓', produits_laitiers: '🥛'
}

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

type Props = { produits: Produit[]; locale: string }

export default function CatalogueProduits({ produits, locale }: Props) {
  const t = useTranslations('produits')
  const { ajouterAuPanier, articles } = usePanier()
  const [filtreCategorie, setFiltreCategorie] = useState<Categorie | 'toutes'>('toutes')
  const [ajoutes, setAjoutes] = useState<Set<string>>(new Set())

  const produitsFiltres = filtreCategorie === 'toutes'
    ? produits
    : produits.filter(p => p.categorie === filtreCategorie)

  function handleAjouter(produit: Produit) {
    ajouterAuPanier(produit)
    setAjoutes(prev => new Set(prev).add(produit.id))
    setTimeout(() => setAjoutes(prev => { const s = new Set(prev); s.delete(produit.id); return s }), 1200)
  }

  const labelCat = (cat: Categorie) =>
    locale === 'pt-BR'
      ? CATEGORIES.find(c => c.value === cat)?.labelPt ?? cat
      : CATEGORIES.find(c => c.value === cat)?.labelFr ?? cat

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
        {CATEGORIES.map(cat => (
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
            {EMOJIS[cat.value]} {locale === 'pt-BR' ? cat.labelPt : cat.labelFr}
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
              {/* Image */}
              <div className="relative" style={{ height: 140, backgroundColor: 'var(--couleur-accent)' }}>
                {produit.image_url
                  ? <img src={produit.image_url} alt={produit.nom} className="w-full h-full object-cover" />
                  : <div className="w-full h-full flex items-center justify-center text-4xl">
                      {produit.categorie ? EMOJIS[produit.categorie] : '📦'}
                    </div>
                }
                {produit.stock <= 3 && produit.stock > 0 && (
                  <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium text-white" style={{ backgroundColor: 'var(--couleur-attention)' }}>
                    {locale === 'pt-BR' ? 'Últimas unidades' : 'Dernières unités'}
                  </span>
                )}
              </div>

              {/* Contenu */}
              <div className="p-3 flex flex-col flex-1 gap-2">
                {produit.categorie && (
                  <span className="text-xs font-medium" style={{ color: 'var(--couleur-texte-doux)' }}>
                    {labelCat(produit.categorie)}
                  </span>
                )}
                <p className="font-semibold text-sm leading-tight" style={{ color: 'var(--couleur-texte)' }}>{produit.nom}</p>
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
