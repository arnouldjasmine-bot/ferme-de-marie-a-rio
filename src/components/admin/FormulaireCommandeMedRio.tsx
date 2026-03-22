'use client'

import { useState } from 'react'

type Produit = {
  id: string
  nom: string
  prix: number
  unite: string
  stock: number
}

type LigneArticle = {
  id: string
  nom: string
  prix_catalogue: number
  prix_custom: number
  quantite: number
  unite: string
}

const ADRESSE_BOTAFOGO = 'Rua Lauro Müller, 116 - Botafogo, Rio de Janeiro - RJ, 22290-160'
const ADRESSE_BARRA = 'Av. Afonso Arinos de Melo Franco, 222 - 5º andar - Barra da Tijuca, Rio de Janeiro - RJ, 22631-455'

export default function FormulaireCommandeMedRio({ produits }: { produits: Produit[] }) {
  const [lignes, setLignes] = useState<LigneArticle[]>(
    produits.map(p => ({
      id: p.id,
      nom: p.nom,
      prix_catalogue: p.prix,
      prix_custom: p.prix,
      quantite: 0,
      unite: p.unite,
    }))
  )
  const [botafogo, setBotafogo] = useState(true)
  const [barra, setBarra] = useState(true)
  const [chargement, setChargement] = useState(false)
  const [erreur, setErreur] = useState('')
  const [lienPaiement, setLienPaiement] = useState('')
  const [copie, setCopie] = useState(false)

  const articlesSelectionnes = lignes.filter(l => l.quantite > 0)

  const total = articlesSelectionnes.reduce(
    (acc, l) => acc + l.prix_custom * l.quantite,
    0
  )

  function setQuantite(id: string, val: number) {
    setLignes(prev =>
      prev.map(l => (l.id === id ? { ...l, quantite: Math.max(0, val) } : l))
    )
  }

  function setPrix(id: string, val: number) {
    setLignes(prev =>
      prev.map(l => (l.id === id ? { ...l, prix_custom: Math.max(0, val) } : l))
    )
  }

  async function handleSubmit() {
    setErreur('')
    if (articlesSelectionnes.length === 0) {
      setErreur('Ajoutez au moins un article.')
      return
    }
    if (!botafogo && !barra) {
      setErreur('Sélectionnez au moins une adresse de livraison.')
      return
    }

    setChargement(true)
    try {
      const articles = articlesSelectionnes.map(l => ({
        id: l.id,
        nom: l.nom,
        quantite: l.quantite,
        prix: l.prix_custom,
        unite: l.unite,
      }))

      const adresse = botafogo ? ADRESSE_BOTAFOGO : ADRESSE_BARRA
      const adresse2 = botafogo && barra ? ADRESSE_BARRA : null

      const res = await fetch('/api/commandes/medrio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articles, adresse, adresse2, total }),
      })
      const json = await res.json()
      if (!json.ok) throw new Error(json.error ?? 'Erreur')

      setLienPaiement(`${window.location.origin}/payer/${json.id}`)

      // Réinitialiser le formulaire
      setLignes(prev => prev.map(l => ({ ...l, quantite: 0, prix_custom: l.prix_catalogue })))
    } catch (err) {
      setErreur(err instanceof Error ? err.message : 'Erreur serveur')
    } finally {
      setChargement(false)
    }
  }

  async function copierLien() {
    await navigator.clipboard.writeText(lienPaiement)
    setCopie(true)
    setTimeout(() => setCopie(false), 2500)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Infos client fixes */}
      <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--couleur-texte-doux)' }}>
          Client
        </p>
        <div className="flex flex-col gap-1">
          <p className="text-sm font-bold" style={{ color: 'var(--couleur-primaire-fonce)' }}>🏥 MedRio</p>
          <p className="text-sm" style={{ color: 'var(--couleur-texte)' }}>📞 024 98166 8526</p>
        </div>
      </div>

      {/* Adresses */}
      <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--couleur-texte-doux)' }}>
          Adresses de livraison
        </p>
        <div className="flex flex-col gap-3">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={botafogo}
              onChange={e => setBotafogo(e.target.checked)}
              className="mt-0.5 accent-green-700"
            />
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--couleur-texte)' }}>Botafogo</p>
              <p className="text-xs" style={{ color: 'var(--couleur-texte-doux)' }}>{ADRESSE_BOTAFOGO}</p>
            </div>
          </label>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={barra}
              onChange={e => setBarra(e.target.checked)}
              className="mt-0.5 accent-green-700"
            />
            <div>
              <p className="text-sm font-medium" style={{ color: 'var(--couleur-texte)' }}>Barra da Tijuca</p>
              <p className="text-xs" style={{ color: 'var(--couleur-texte-doux)' }}>{ADRESSE_BARRA}</p>
            </div>
          </label>
        </div>
      </div>

      {/* Articles */}
      <div className="rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}>
        <p className="text-xs font-semibold uppercase tracking-wider px-4 pt-4 pb-2" style={{ color: 'var(--couleur-texte-doux)' }}>
          Articles
        </p>
        <div className="flex flex-col divide-y" style={{ borderColor: 'var(--couleur-bordure)' }}>
          {lignes.map(l => (
            <div key={l.id} className="px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2">
              <p className="text-sm font-medium flex-1" style={{ color: 'var(--couleur-texte)' }}>
                {l.nom}
                <span className="text-xs ml-1" style={{ color: 'var(--couleur-texte-doux)' }}>/ {l.unite}</span>
              </p>
              <div className="flex items-center gap-3 flex-wrap">
                {/* Prix unitaire */}
                <div className="flex items-center gap-1">
                  <span className="text-xs" style={{ color: 'var(--couleur-texte-doux)' }}>R$</span>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={l.prix_custom}
                    onChange={e => setPrix(l.id, parseFloat(e.target.value) || 0)}
                    className="w-20 text-sm text-right border rounded-lg px-2 py-1 outline-none"
                    style={{ borderColor: 'var(--couleur-bordure)', color: 'var(--couleur-texte)' }}
                  />
                </div>
                {/* Quantité */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setQuantite(l.id, l.quantite - 1)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold transition-opacity hover:opacity-70"
                    style={{ backgroundColor: 'var(--couleur-bordure)', color: 'var(--couleur-texte)' }}
                  >−</button>
                  <span className="w-8 text-center text-sm font-medium" style={{ color: 'var(--couleur-texte)' }}>
                    {l.quantite}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantite(l.id, l.quantite + 1)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold transition-opacity hover:opacity-70"
                    style={{ backgroundColor: 'var(--vert-sauge-fonce)', color: '#fff' }}
                  >+</button>
                </div>
                {/* Sous-total */}
                {l.quantite > 0 && (
                  <span className="text-xs font-medium w-20 text-right" style={{ color: 'var(--couleur-primaire-fonce)' }}>
                    = R$ {(l.prix_custom * l.quantite).toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        {articlesSelectionnes.length > 0 && (
          <div className="px-4 py-3 flex items-center justify-between" style={{ borderTop: '2px solid var(--couleur-bordure)' }}>
            <span className="text-sm font-bold" style={{ color: 'var(--couleur-primaire-fonce)' }}>Total</span>
            <span className="text-lg font-bold" style={{ color: 'var(--couleur-primaire-fonce)' }}>R$ {total.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Erreur */}
      {erreur && (
        <p className="text-sm px-3 py-2 rounded-lg" style={{ backgroundColor: '#fdf0ec', color: '#C0522A' }}>
          {erreur}
        </p>
      )}

      {/* Lien de paiement généré */}
      {lienPaiement && (
        <div className="rounded-xl p-4 flex flex-col gap-3" style={{ backgroundColor: '#eef3ee', border: '1px solid #4A5D4E33' }}>
          <p className="text-sm font-semibold" style={{ color: '#4A5D4E' }}>✅ Commande créée ! Lien de paiement :</p>
          <p className="text-xs break-all rounded p-2 bg-white" style={{ color: '#4A5D4E' }}>{lienPaiement}</p>
          <button
            type="button"
            onClick={copierLien}
            className="self-start px-4 py-2 rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-80"
            style={{ backgroundColor: '#4A5D4E' }}
          >
            {copie ? '✓ Copié !' : '📋 Copier le lien'}
          </button>
          <button
            type="button"
            onClick={() => setLienPaiement('')}
            className="self-start text-xs underline"
            style={{ color: 'var(--couleur-texte-doux)' }}
          >
            Créer une autre commande
          </button>
        </div>
      )}

      {/* Bouton créer */}
      {!lienPaiement && (
        <button
          type="button"
          onClick={handleSubmit}
          disabled={chargement || articlesSelectionnes.length === 0}
          className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-40"
          style={{ backgroundColor: 'var(--vert-sauge-fonce)' }}
        >
          {chargement ? 'Création en cours…' : `Créer la commande — R$ ${total.toFixed(2)}`}
        </button>
      )}
    </div>
  )
}
