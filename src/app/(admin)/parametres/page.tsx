'use client'

import { useState, useEffect } from 'react'

type PageContent = Record<string, { fr: string; pt: string }>

export default function PageParametres() {
  const [contenu, setContenu] = useState<PageContent>({})
  const [chargement, setChargement] = useState(true)
  const [sauvegarde, setSauvegarde] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/page-content')
      .then(r => r.json())
      .then((data: PageContent) => { setContenu(data); setChargement(false) })
  }, [])

  function setFraisLivraison(valeur: string) {
    setContenu(prev => ({ ...prev, frais_livraison: { fr: valeur, pt: valeur } }))
  }

  async function sauvegarder() {
    setSauvegarde('...')
    const res = await fetch('/api/page-content', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contenu),
    })
    const json = await res.json() as { ok: boolean; error?: string }
    setSauvegarde(json.ok ? 'Sauvegardé ✓' : (json.error ?? 'Erreur'))
    setTimeout(() => setSauvegarde(null), 3000)
  }

  const fraisLivraison = contenu.frais_livraison?.fr ?? ''

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl md:text-2xl font-bold" style={{ color: 'var(--couleur-primaire-fonce)', fontFamily: 'var(--police-titre)' }}>
          Réglages
        </h1>
        <button
          onClick={sauvegarder}
          className="px-4 py-2 rounded-lg text-white font-medium text-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--couleur-primaire)' }}
        >
          {sauvegarde ?? 'Sauvegarder'}
        </button>
      </div>

      {chargement ? (
        <div className="py-12 text-center" style={{ color: 'var(--couleur-texte-doux)' }}>Chargement…</div>
      ) : (
        <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}>
          <h2 className="font-semibold text-sm mb-1" style={{ color: 'var(--couleur-primaire-fonce)' }}>Frais de livraison</h2>
          <p className="text-xs mb-4" style={{ color: 'var(--couleur-texte-doux)' }}>
            Montant ajouté au panier en mode livraison (retrait à la ferme reste gratuit).
          </p>
          <div className="flex items-center gap-2 max-w-[200px]">
            <span className="text-sm font-medium" style={{ color: 'var(--couleur-texte)' }}>R$</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={fraisLivraison}
              onChange={e => setFraisLivraison(e.target.value)}
              className="w-full border rounded-xl px-3 py-2 text-sm outline-none"
              style={{ borderColor: 'var(--couleur-bordure)' }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
