'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

type Article = { nom: string; quantite: number; prix: number }

type Props = {
  id: string
  articles: Article[]
  frais_livraison: number
  mode_livraison: string
}

export default function EditionCommande({ id, articles: initial, frais_livraison, mode_livraison }: Props) {
  const router = useRouter()
  const [articles, setArticles] = useState<Article[]>(initial)
  const [sauvegarde, setSauvegarde] = useState(false)
  const [chargement, setChargement] = useState(false)
  const modifie = JSON.stringify(articles) !== JSON.stringify(initial)

  const sousTotal = articles.reduce((s, a) => s + a.prix * a.quantite, 0)
  const total = sousTotal + (mode_livraison === 'livraison' ? frais_livraison : 0)

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
            <div key={i} className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: 'var(--couleur-texte)' }}>{a.nom}</p>
                <p className="text-xs" style={{ color: 'var(--couleur-texte-doux)' }}>R$ {a.prix.toFixed(2)} / unité</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
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
              </div>
              <span className="text-sm font-semibold w-20 text-right shrink-0" style={{ color: 'var(--couleur-primaire-fonce)' }}>
                R$ {(a.prix * a.quantite).toFixed(2)}
              </span>
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
