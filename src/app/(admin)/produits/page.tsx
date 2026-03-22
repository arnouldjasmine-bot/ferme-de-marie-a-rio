'use client'

import { useState } from 'react'
import { CATEGORIES, type Produit, type Categorie } from '@/types'
import ModalProduit from '@/components/admin/ModalProduit'

// Données de démo (remplacées par Supabase une fois connecté)
const PRODUITS_DEMO: Produit[] = [
  { id: '1', nom: 'Tomates cerises', description: 'Tomates cerises bio', prix: 8.50, unite: '500g', stock: 20, categorie: 'legumes', image_url: null, actif: true, created_at: '' },
  { id: '2', nom: 'Confiture de fraise', description: 'Faite maison', prix: 12.00, unite: 'pot 300g', stock: 15, categorie: 'confiture', image_url: null, actif: true, created_at: '' },
  { id: '3', nom: 'Fromage frais', description: 'Fromage de vache', prix: 10.00, unite: 'unité', stock: 8, categorie: 'produits_laitiers', image_url: null, actif: true, created_at: '' },
]

const BADGE_COULEURS: Record<string, string> = {
  fruits: '#e8f5e9',
  legumes: '#f1f8e9',
  confiture: '#fff3e0',
  produits_laitiers: '#e3f2fd',
}

export default function PageAdminProduits() {
  const [produits, setProduits] = useState<Produit[]>(PRODUITS_DEMO)
  const [modalOuvert, setModalOuvert] = useState(false)
  const [produitEdite, setProduitEdite] = useState<Produit | null>(null)
  const [filtreCategorie, setFiltreCategorie] = useState<Categorie | 'toutes'>('toutes')

  function ouvrirAjout() {
    setProduitEdite(null)
    setModalOuvert(true)
  }

  function ouvrirEdition(p: Produit) {
    setProduitEdite(p)
    setModalOuvert(true)
  }

  function sauvegarder(data: Omit<Produit, 'id' | 'created_at'>) {
    if (produitEdite) {
      setProduits(prev => prev.map(p => p.id === produitEdite.id ? { ...p, ...data } : p))
    } else {
      const nouveau: Produit = { ...data, id: Date.now().toString(), created_at: new Date().toISOString() }
      setProduits(prev => [...prev, nouveau])
    }
    setModalOuvert(false)
  }

  function toggleActif(id: string) {
    setProduits(prev => prev.map(p => p.id === id ? { ...p, actif: !p.actif } : p))
  }

  function supprimer(id: string) {
    if (confirm('Supprimer ce produit ?')) {
      setProduits(prev => prev.filter(p => p.id !== id))
    }
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
          onClick={ouvrirAjout}
          className="px-4 py-2 rounded-lg text-white font-medium text-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--couleur-primaire)' }}
        >
          + Ajouter un produit
        </button>
      </div>

      {/* Filtres catégories */}
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => setFiltreCategorie('toutes')}
          className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
          style={{
            backgroundColor: filtreCategorie === 'toutes' ? 'var(--couleur-primaire)' : 'var(--couleur-bordure)',
            color: filtreCategorie === 'toutes' ? '#fff' : 'var(--couleur-texte)'
          }}
        >
          Toutes
        </button>
        {CATEGORIES.map(cat => (
          <button
            key={cat.value}
            onClick={() => setFiltreCategorie(cat.value)}
            className="px-3 py-1.5 rounded-full text-sm font-medium transition-colors"
            style={{
              backgroundColor: filtreCategorie === cat.value ? 'var(--couleur-primaire)' : 'var(--couleur-bordure)',
              color: filtreCategorie === cat.value ? '#fff' : 'var(--couleur-texte)'
            }}
          >
            {cat.labelFr}
          </button>
        ))}
      </div>

      {/* Tableau produits */}
      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}>
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
                  Aucun produit dans cette catégorie
                </td>
              </tr>
            )}
            {produitsFiltres.map((p, i) => (
              <tr key={p.id} style={{ borderBottom: i < produitsFiltres.length - 1 ? '1px solid var(--couleur-bordure)' : 'none' }}>
                {/* Photo */}
                <td className="px-4 py-3">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center" style={{ backgroundColor: 'var(--couleur-accent)' }}>
                    {p.image_url
                      ? <img src={p.image_url} alt={p.nom} className="w-full h-full object-cover" />
                      : <span className="text-xl">📦</span>
                    }
                  </div>
                </td>
                {/* Nom + description */}
                <td className="px-4 py-3">
                  <p className="font-medium" style={{ color: 'var(--couleur-texte)' }}>{p.nom}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--couleur-texte-doux)' }}>{p.unite}</p>
                </td>
                {/* Catégorie */}
                <td className="px-4 py-3">
                  {p.categorie && (
                    <span
                      className="px-2 py-1 rounded-full text-xs font-medium"
                      style={{ backgroundColor: BADGE_COULEURS[p.categorie], color: 'var(--couleur-primaire-fonce)' }}
                    >
                      {CATEGORIES.find(c => c.value === p.categorie)?.labelFr}
                    </span>
                  )}
                </td>
                {/* Prix */}
                <td className="px-4 py-3 font-medium" style={{ color: 'var(--couleur-texte)' }}>
                  {p.prix.toFixed(2)} R$
                </td>
                {/* Stock */}
                <td className="px-4 py-3">
                  <span
                    className="font-medium"
                    style={{ color: p.stock <= 3 ? 'var(--couleur-erreur)' : p.stock <= 10 ? 'var(--couleur-attention)' : 'var(--couleur-succes)' }}
                  >
                    {p.stock}
                  </span>
                </td>
                {/* Toggle actif */}
                <td className="px-4 py-3">
                  <button
                    onClick={() => toggleActif(p.id)}
                    className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors"
                    style={{ backgroundColor: p.actif ? 'var(--couleur-primaire)' : 'var(--couleur-bordure)' }}
                  >
                    <span
                      className="inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform"
                      style={{ transform: p.actif ? 'translateX(18px)' : 'translateX(2px)' }}
                    />
                  </button>
                </td>
                {/* Actions */}
                <td className="px-4 py-3">
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => ouvrirEdition(p)}
                      className="px-3 py-1 rounded text-xs font-medium transition-opacity hover:opacity-70"
                      style={{ backgroundColor: 'var(--couleur-accent)', color: 'var(--couleur-primaire-fonce)' }}
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => supprimer(p.id)}
                      className="px-3 py-1 rounded text-xs font-medium transition-opacity hover:opacity-70"
                      style={{ backgroundColor: '#fee2e2', color: 'var(--couleur-erreur)' }}
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalOuvert && (
        <ModalProduit
          produit={produitEdite}
          onSauvegarder={sauvegarder}
          onFermer={() => setModalOuvert(false)}
        />
      )}
    </div>
  )
}
