'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Article = { nom: string; quantite: number; prix: number }
type Produit = { id: string; nom: string; prix: number; unite: string }

type Props = {
  id: string
  articles: Article[]
  frais_livraison: number
  mode_livraison: string
  produits?: Produit[]
}

export default function EditionCommande({ id, articles: initial, frais_livraison, mode_livraison, produits = [] }: Props) {
  const router = useRouter()
  const [articles, setArticles] = useState<Article[]>(initial)
  const [sauvegarde, setSauvegarde] = useState(false)
  const [chargement, setChargement] = useState(false)
  const [ajouterOuvert, setAjouterOuvert] = useState(false)
  const [produitChoisi, setProduitChoisi] = useState('')
  const [qteAjouter, setQteAjouter] = useState(1)
  const modifie = JSON.stringify(articles) !== JSON.stringify(initial)

  const sousTotal = articles.reduce((s, a) => s + a.prix * a.quantite, 0)
  const total = sousTotal + (mode_livraison === 'livraison' ? frais_livraison : 0)

  function ajouterArticle() {
    const p = produits.find(p => p.id === produitChoisi)
    if (!p) return
    const idx = articles.findIndex(a => a.nom === p.nom)
    if (idx >= 0) {
      const next = [...articles]
      next[idx] = { ...next[idx], quantite: next[idx].quantite + qteAjouter }
      setArticles(next)
    } else {
      setArticles(prev => [...prev, { nom: p.nom, quantite: qteAjouter, prix: p.prix }])
    }
    setProduitChoisi('')
    setQteAjouter(1)
    setAjouterOuvert(false)
  }

  function modifierPrix(i: number, val: number) {
    setArticles(prev => {
      const next = [...prev]
      next[i] = { ...next[i], prix: Math.max(0, val) }
      return next
    })
  }

  function modifierQte(i: number, delta: number) {
    setArticles(prev => {
      const next = [...prev]
      const nouvelle = next[i].quantite + delta
      if (nouvelle <= 0) return next.filter((_, idx) => idx !== i)
      next[i] = { ...next[i], quantite: nouvelle }
      return next
    })
  }

  async function sauvegarder() {
    setChargement(true)
    await fetch(`/api/commandes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ articles, total }),
    })
    setSauvegarde(true)
    setTimeout(() => setSauvegarde(false), 2000)
    setChargement(false)
    router.refresh()
  }

  return (
    <div className="rounded-xl p-4 mb-4" style={{ backgroundColor: 'var(--couleur-fond-carte)', boxShadow: 'var(--ombre-carte)' }}>
      <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--couleur-texte-doux)' }}>Articles</p>

      {articles.length === 0 ? (
        <p className="text-sm py-2" style={{ color: 'var(--couleur-texte-doux)' }}>Aucun article</p>
      ) : (
        <div className="flex flex-col gap-2 mb-3">
          {articles.map((a, i) => (
            <div key={i} className="flex flex-col gap-1.5 py-2" style={{ borderBottom: '1px solid var(--couleur-bordure)' }}>
              <p className="text-sm font-medium" style={{ color: 'var(--couleur-texte)' }}>{a.nom}</p>
              <div className="flex items-center gap-2 flex-wrap">
                {/* Prix unitaire éditable */}
                <div className="flex items-center gap-1">
                  <span className="text-xs" style={{ color: 'var(--couleur-texte-doux)' }}>R$</span>
                  <input
                    type="number"
                    min={0}
                    step={0.5}
                    value={a.prix}
                    onChange={e => modifierPrix(i, parseFloat(e.target.value) || 0)}
                    className="w-20 text-sm text-right border rounded-lg px-2 py-1 outline-none"
                    style={{ borderColor: 'var(--couleur-bordure)', color: 'var(--couleur-texte)' }}
                  />
                  <span className="text-xs" style={{ color: 'var(--couleur-texte-doux)' }}>/u</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => modifierQte(i, -1)}
                  className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-base transition-opacity hover:opacity-70"
                  style={{ backgroundColor: 'var(--couleur-accent)', color: 'var(--couleur-primaire-fonce)' }}
                >
                  −
                </button>
                <span className="w-5 text-center text-sm font-semibold" style={{ color: 'var(--couleur-texte)' }}>{a.quantite}</span>
                <button
                  onClick={() => modifierQte(i, +1)}
                  className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-base transition-opacity hover:opacity-70"
                  style={{ backgroundColor: 'var(--couleur-accent)', color: 'var(--couleur-primaire-fonce)' }}
                >
                  +
                </button>
                <span className="text-sm font-semibold ml-2" style={{ color: 'var(--couleur-primaire-fonce)' }}>
                  = R$ {(a.prix * a.quantite).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Total */}
      <div className="pt-3" style={{ borderTop: '1px solid var(--couleur-bordure)' }}>
        {mode_livraison === 'livraison' && frais_livraison > 0 && (
          <div className="flex justify-between text-sm mb-1" style={{ color: 'var(--couleur-texte-doux)' }}>
            <span>Frais de livraison</span>
            <span>R$ {frais_livraison.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-sm">
          <span style={{ color: 'var(--couleur-texte)' }}>Total</span>
          <span style={{ color: 'var(--couleur-primaire-fonce)' }}>R$ {total.toFixed(2)}</span>
        </div>
      </div>

      {/* Ajouter un article */}
      {produits.length > 0 && (
        <div className="mt-3">
          {!ajouterOuvert ? (
            <button
              onClick={() => setAjouterOuvert(true)}
              className="text-sm underline opacity-60 hover:opacity-90 transition-opacity"
              style={{ color: 'var(--vert-sauge-fonce)' }}
            >
              + Ajouter un article
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <select
                value={produitChoisi}
                onChange={e => setProduitChoisi(e.target.value)}
                className="text-sm border rounded-lg px-2 py-1 outline-none flex-1 min-w-0"
                style={{ borderColor: 'var(--couleur-bordure)', color: 'var(--couleur-texte)' }}
              >
                <option value="">— Choisir —</option>
                {produits.map(p => (
                  <option key={p.id} value={p.id}>{p.nom} (R$ {p.prix.toFixed(2)}/{p.unite})</option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={qteAjouter}
                onChange={e => setQteAjouter(parseInt(e.target.value) || 1)}
                className="w-16 text-sm border rounded-lg px-2 py-1 outline-none text-center"
                style={{ borderColor: 'var(--couleur-bordure)', color: 'var(--couleur-texte)' }}
              />
              <button
                onClick={ajouterArticle}
                disabled={!produitChoisi}
                className="px-3 py-1 rounded-lg text-white text-sm font-semibold disabled:opacity-40 transition-opacity hover:opacity-80"
                style={{ backgroundColor: 'var(--vert-sauge-fonce)' }}
              >
                Ajouter
              </button>
              <button
                onClick={() => setAjouterOuvert(false)}
                className="text-sm underline opacity-50 hover:opacity-80"
                style={{ color: 'var(--couleur-texte-doux)' }}
              >
                Annuler
              </button>
            </div>
          )}
        </div>
      )}

      {modifie && (
        <button
          onClick={sauvegarder}
          disabled={chargement}
          className="mt-4 w-full py-2 rounded-lg text-white text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: sauvegarde ? 'var(--vert-olive)' : 'var(--vert-sauge-fonce)' }}
        >
          {sauvegarde ? '✓ Sauvegardé' : chargement ? 'Sauvegarde…' : 'Sauvegarder les modifications'}
        </button>
      )}
    </div>
  )
}
