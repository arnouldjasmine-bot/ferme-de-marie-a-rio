'use client'

import { useState, useEffect } from 'react'
import { CATEGORIES, type Produit, type Categorie } from '@/types'
import ModalProduit from '@/components/admin/ModalProduit'

const BADGE_COULEURS: Record<string, string> = {
  fruits: '#e8f5e9',
  legumes: '#f1f8e9',
  confiture: '#fff3e0',
  produits_laitiers: '#e3f2fd',
}

export default function PageAdminProduits() {
  const [produits, setProduits] = useState<Produit[]>([])
  const [chargement, setChargement] = useState(true)
  const [modalOuvert, setModalOuvert] = useState(false)
  const [produitEdite, setProduitEdite] = useState<Produit | null>(null)
  const [filtreCategorie, setFiltreCategorie] = useState<Categorie | 'toutes'>('toutes')

  async function charger() {
    setChargement(true)
    const res = await fetch('/api/produits')
    const data = await res.json()
    setProduits(data)
    setChargement(false)
  }

  useEffect(() => { charger() }, [])

  async function sauvegarder(data: Omit<Produit, 'id' | 'created_at'>) {
    if (produitEdite) {
      await fetch('/api/produits', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: produitEdite.id, ...data }) })
    } else {
      await fetch('/api/produits', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })
    }
    setModalOuvert(false)
    charger()
  }

  async function toggleActif(p: Produit) {
    await fetch('/api/produits', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: p.id, actif: !p.actif }) })
    charger()
  }

  async function supprimer(id: string) {
    if (!confirm('Supprimer ce produit ?')) return
    await fetch('/api/produits', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    charger()
  }

  const produitsFiltres = filtreCategorie === 'toutes'
    ? produits
    : produits.filter(p => p.categorie === filtreCategorie)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--couleur-primaire-fonce)', fontFamily: 'var(--police-titre)' }}>
          Gestion des produits
        </h1>
        <button
          onClick={() => { setProduitEdite(null); setModalOuvert(true) }}
          className="px-4 py-2 rounded-lg text-white font-medium text-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--couleur-primaire)' }}
        >
          + Ajouter un produit
        </button>
      </div>

      <div className="flex gap-2 flex-wrap mb-6">
        {(['toutes', ...CATEGORIES.map(c => c.value)] as const).map(val => (
          <button
            key={val}
            onClick={() => setFiltreCategorie(val as Categorie | 'toutes')}
            className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
            style={{
              backgroundColor: filtreCategorie === val ? 'var(--couleur-primaire)' : 'var(--couleur-bordure)',
              color: filtreCategorie === val ? '#fff' : 'var(--couleur-texte)'
            }}
          >
            {val === 'toutes' ? 'Toutes' : CATEGORIES.find(c => c.value === val)?.labelFr}
          </button>
        ))}
      </div>

      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}>
        {chargement ? (
          <div className="py-16 text-center" style={{ color: 'var(--couleur-texte-doux)' }}>Chargement…</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--couleur-bordure)', backgroundColor: 'var(--admin-fond)' }}>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--couleur-texte-doux)' }}>Photo</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--couleur-texte-doux)' }}>Produit</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--couleur-texte-doux)' }}>Catégorie</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--couleur-texte-doux)' }}>Prix</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--couleur-texte-doux)' }}>Stock</th>
                <th className="text-left px-4 py-3 font-medium" style={{ color: 'var(--couleur-texte-doux)' }}>Actif</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {produitsFiltres.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center" style={{ color: 'var(--couleur-texte-doux)' }}>
                    Aucun produit
                  </td>
                </tr>
              )}
              {produitsFiltres.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: i < produitsFiltres.length - 1 ? '1px solid var(--couleur-bordure)' : 'none' }}>
                  <td className="px-4 py-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center" style={{ backgroundColor: 'var(--couleur-accent)' }}>
                      {p.image_url ? <img src={p.image_url} alt={p.nom} className="w-full h-full object-cover" /> : <span className="text-xl">📦</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium" style={{ color: 'var(--couleur-texte)' }}>{p.nom}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--couleur-texte-doux)' }}>{p.unite}</p>
                  </td>
                  <td className="px-4 py-3">
                    {p.categorie && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: BADGE_COULEURS[p.categorie] ?? '#f0f0f0', color: 'var(--couleur-primaire-fonce)' }}>
                        {CATEGORIES.find(c => c.value === p.categorie)?.labelFr}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--couleur-texte)' }}>{p.prix.toFixed(2)} R$</td>
                  <td className="px-4 py-3">
                    <span className="font-medium" style={{ color: p.stock <= 3 ? 'var(--couleur-erreur)' : p.stock <= 10 ? 'var(--couleur-attention)' : 'var(--couleur-succes)' }}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => toggleActif(p)} className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors" style={{ backgroundColor: p.actif ? 'var(--couleur-primaire)' : 'var(--couleur-bordure)' }}>
                      <span className="inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform" style={{ transform: p.actif ? 'translateX(18px)' : 'translateX(2px)' }} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => { setProduitEdite(p); setModalOuvert(true) }} className="px-3 py-1 rounded text-xs font-medium" style={{ backgroundColor: 'var(--couleur-accent)', color: 'var(--couleur-primaire-fonce)' }}>Modifier</button>
                      <button onClick={() => supprimer(p.id)} className="px-3 py-1 rounded text-xs font-medium" style={{ backgroundColor: '#fee2e2', color: 'var(--couleur-erreur)' }}>Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOuvert && (
        <ModalProduit produit={produitEdite} onSauvegarder={sauvegarder} onFermer={() => setModalOuvert(false)} />
      )}
    </div>
  )
}
