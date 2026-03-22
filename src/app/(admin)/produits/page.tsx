'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CATEGORIES, type Produit } from '@/types'

type CategorieDB = { id: string; value: string; label_fr: string; label_pt: string; emoji: string }

export default function PageAdminProduits() {
  const [produits, setProduits] = useState<Produit[]>([])
  const [categories, setCategories] = useState<CategorieDB[]>([])
  const [chargement, setChargement] = useState(true)
  const [filtreCategorie, setFiltreCategorie] = useState<string>('toutes')

  async function charger() {
    setChargement(true)
    const [resProduits, resCats] = await Promise.all([
      fetch('/api/produits'),
      fetch('/api/categories'),
    ])
    setProduits(await resProduits.json())
    const cats = await resCats.json()
    setCategories(Array.isArray(cats) && cats.length > 0
      ? cats
      : CATEGORIES.map((c, i) => ({ id: String(i), value: c.value, label_fr: c.labelFr, label_pt: c.labelPt, emoji: '' }))
    )
    setChargement(false)
  }

  useEffect(() => { charger() }, [])

  async function toggleActif(e: React.MouseEvent, p: Produit) {
    e.preventDefault()
    e.stopPropagation()
    await fetch('/api/produits', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: p.id, actif: !p.actif }) })
    charger()
  }

  const produitsFiltres = filtreCategorie === 'toutes'
    ? produits
    : produits.filter(p => p.categorie === filtreCategorie)

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl md:text-2xl font-bold" style={{ color: 'var(--couleur-primaire-fonce)', fontFamily: 'var(--police-titre)' }}>
          Produits ({produits.length})
        </h1>
        <Link
          href="/produits/nouveau"
          className="px-3 py-2 rounded-lg text-white font-medium text-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--couleur-primaire)' }}
        >
          + Ajouter
        </Link>
      </div>

      {/* Filtres */}
      <div className="flex gap-2 flex-wrap mb-5">
        {(['toutes', ...categories.map(c => c.value)]).map(val => (
          <button
            key={val}
            onClick={() => setFiltreCategorie(val)}
            className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
            style={{
              backgroundColor: filtreCategorie === val ? 'var(--couleur-primaire)' : 'var(--couleur-bordure)',
              color: filtreCategorie === val ? '#fff' : 'var(--couleur-texte)'
            }}
          >
            {val === 'toutes' ? 'Toutes' : `${categories.find(c => c.value === val)?.emoji ?? ''} ${categories.find(c => c.value === val)?.label_fr ?? val}`}
          </button>
        ))}
      </div>

      {/* Liste */}
      {chargement ? (
        <div className="py-16 text-center" style={{ color: 'var(--couleur-texte-doux)' }}>Chargement…</div>
      ) : produitsFiltres.length === 0 ? (
        <div className="rounded-xl py-12 text-center" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}>
          <p style={{ color: 'var(--couleur-texte-doux)' }}>Aucun produit</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {produitsFiltres.map(p => (
            <Link
              key={p.id}
              href={`/produits/${p.id}`}
              className="flex items-center gap-3 p-3 rounded-xl transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)', opacity: p.actif ? 1 : 0.6 }}
            >
              {/* Image */}
              <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 flex items-center justify-center" style={{ backgroundColor: 'var(--couleur-accent)' }}>
                {p.image_url ? <img src={p.image_url} alt={p.nom} className="w-full h-full object-cover" /> : <span className="text-2xl">📦</span>}
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-sm truncate" style={{ color: 'var(--couleur-texte)' }}>{p.nom}</p>
                  {p.categorie && (() => {
                    const cat = categories.find(c => c.value === p.categorie)
                    return (
                      <span className="text-xs px-2 py-0.5 rounded-full shrink-0" style={{ backgroundColor: '#f0f4f0', color: 'var(--couleur-primaire-fonce)' }}>
                        {cat?.emoji} {cat?.label_fr ?? p.categorie}
                      </span>
                    )
                  })()}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-sm font-bold" style={{ color: 'var(--couleur-primaire-fonce)' }}>R$ {p.prix.toFixed(2)}</span>
                  <span className="text-xs" style={{ color: 'var(--couleur-texte-doux)' }}>/ {p.unite}</span>
                  <span className="text-xs font-medium" style={{ color: p.stock <= 3 ? 'var(--couleur-erreur)' : p.stock <= 10 ? 'var(--couleur-attention)' : 'var(--couleur-succes)' }}>
                    Stock : {p.stock}
                  </span>
                </div>
              </div>

              {/* Toggle actif */}
              <button
                onClick={(e) => toggleActif(e, p)}
                className="relative inline-flex h-6 w-10 items-center rounded-full transition-colors shrink-0"
                style={{ backgroundColor: p.actif ? 'var(--couleur-primaire)' : 'var(--couleur-bordure)' }}
                title={p.actif ? 'Désactiver' : 'Activer'}
              >
                <span className="inline-block h-4 w-4 rounded-full bg-white transition-transform" style={{ transform: p.actif ? 'translateX(22px)' : 'translateX(2px)' }} />
              </button>

              {/* Chevron */}
              <span style={{ color: 'var(--couleur-texte-doux)' }}>›</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
