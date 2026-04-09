'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { type Produit } from '@/types'
import { usePanier } from '@/lib/panier-context'
import { useAuth } from './AuthProvider'
import BoutonFavori from './BoutonFavori'
import { createBrowserClient } from '@supabase/ssr'

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
  const [favorisIds, setFavorisIds] = useState<Set<string>>(new Set())

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  useEffect(() => {
    if (!user) { setFavorisIds(new Set()); return }
    supabase.from('favoris').select('product_id').eq('user_id', user.id).then(({ data }) => {
      if (data) setFavorisIds(new Set(data.map((f: { product_id: string }) => f.product_id)))
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const produitsFiltres = filtreCategorie === 'favoris'
    ? produits.filter(p => favorisIds.has(p.id))
    : filtreCategorie === 'toutes'
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
      {/* ── Filtres catégories ── */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-5 -mx-4 px-4 scrollbar-hide">
        <button
          onClick={() => setFiltreCategorie('toutes')}
          className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors"
          style={{
            backgroundColor: filtreCategorie === 'toutes' ? 'var(--vert-sauge-fonce)' : 'var(--couleur-fond-carte)',
            color: filtreCategorie === 'toutes' ? '#fff' : 'var(--couleur-texte)',
            boxShadow: filtreCategorie === 'toutes' ? 'none' : '0 1px 6px rgba(0,0,0,0.07)',
          }}
        >
          {locale === 'pt-BR' ? 'Todos' : 'Tous'}
        </button>

        {user && favorisIds.size > 0 && (
          <button
            onClick={() => setFiltreCategorie('favoris')}
            className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors"
            style={{
              backgroundColor: filtreCategorie === 'favoris' ? 'var(--terracotta)' : 'var(--couleur-fond-carte)',
              color: filtreCategorie === 'favoris' ? '#fff' : 'var(--couleur-texte)',
              boxShadow: filtreCategorie === 'favoris' ? 'none' : '0 1px 6px rgba(0,0,0,0.07)',
            }}
          >
            ❤️ {locale === 'pt-BR' ? 'Favoritos' : 'Favoris'}
          </button>
        )}

        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => setFiltreCategorie(cat.value)}
            className="shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors"
            style={{
              backgroundColor: filtreCategorie === cat.value ? 'var(--vert-sauge-fonce)' : 'var(--couleur-fond-carte)',
              color: filtreCategorie === cat.value ? '#fff' : 'var(--couleur-texte)',
              boxShadow: filtreCategorie === cat.value ? 'none' : '0 1px 6px rgba(0,0,0,0.07)',
            }}
          >
            {cat.emoji} {locale === 'pt-BR' ? cat.label_pt : cat.label_fr}
          </button>
        ))}
      </div>

      {/* ── Grille produits ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pb-6">
        {produitsFiltres.map(produit => {
          const quantiteAuPanier = articles.find(a => a.produit.id === produit.id)?.quantite ?? 0
          const estAjoute = ajoutes.has(produit.id)
          const stockBas = produit.stock <= 3 && produit.stock > 0

          return (
            <div
              key={produit.id}
              className="rounded-2xl overflow-hidden flex flex-col"
              style={{
                backgroundColor: 'var(--couleur-fond-carte)',
                boxShadow: '0 2px 12px rgba(74,93,78,0.09)',
              }}
            >
              {/* Image carrée */}
              <div className="relative" style={{ aspectRatio: '1/1', backgroundColor: 'var(--couleur-accent)' }}>
                <Link href={`/${locale}/produits/${produit.id}`} className="block w-full h-full absolute inset-0">
                  {produit.image_url
                    ? <img src={produit.image_url} alt={produit.nom} className="w-full h-full object-cover" />
                    : <div className="w-full h-full flex items-center justify-center text-4xl">
                        {produit.categorie ? emojiCat(produit.categorie) : '📦'}
                      </div>
                  }
                </Link>

                {/* Badge stock bas */}
                {stockBas && (
                  <span
                    className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-white font-semibold"
                    style={{ backgroundColor: 'var(--couleur-attention)', fontSize: 10 }}
                  >
                    {locale === 'pt-BR' ? `${produit.stock} rest.` : `${produit.stock} rest.`}
                  </span>
                )}

                {/* Bouton favori */}
                {user && (
                  <div className="absolute top-1.5 right-1.5">
                    <BoutonFavori
                      productId={produit.id}
                      locale={locale}
                      initialFavori={favorisIds.has(produit.id)}
                      onToggle={(isFav) => setFavorisIds(prev => {
                        const next = new Set(prev)
                        if (isFav) next.add(produit.id); else next.delete(produit.id)
                        return next
                      })}
                    />
                  </div>
                )}
              </div>

              {/* Infos */}
              <div className="p-3 flex flex-col flex-1 gap-1">
                <p className="font-semibold text-xs leading-tight" style={{ color: 'var(--couleur-texte)' }}>
                  {locale === 'pt-BR' && produit.nom_pt ? produit.nom_pt : produit.nom}
                </p>

                <div className="flex items-baseline gap-1">
                  <span className="font-bold text-sm" style={{ color: 'var(--vert-sauge-fonce)' }}>
                    R$ {produit.prix.toFixed(2)}
                  </span>
                  <span className="text-xs" style={{ color: 'var(--couleur-texte-doux)', fontSize: 10 }}>
                    / {tradUnit(produit.unite, locale)}
                  </span>
                </div>

                <div className="mt-auto pt-1">
                  {produit.stock === 0 ? (
                    <p
                      className="text-center text-xs py-2 rounded-xl font-medium"
                      style={{ backgroundColor: 'var(--couleur-accent)', color: 'var(--couleur-texte-doux)' }}
                    >
                      {t('rupture')}
                    </p>
                  ) : (
                    <button
                      onClick={() => handleAjouter(produit)}
                      className="w-full py-2 rounded-xl text-white font-semibold transition-all"
                      style={{
                        fontSize: 12,
                        backgroundColor: estAjoute ? 'var(--couleur-succes)' : 'var(--vert-sauge)',
                        transform: estAjoute ? 'scale(0.97)' : 'scale(1)',
                      }}
                    >
                      {estAjoute
                        ? '✓'
                        : quantiteAuPanier > 0
                          ? `+ (${quantiteAuPanier})`
                          : locale === 'pt-BR' ? '+ Carrinho' : '+ Panier'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
