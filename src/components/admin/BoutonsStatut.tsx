'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type Statut = 'en_attente' | 'confirmee' | 'livree'

const ETAPES: { statut: Statut; label: string; couleur: string }[] = [
  { statut: 'en_attente', label: 'En attente', couleur: '#D27D56' },
  { statut: 'confirmee',  label: 'Confirmée',  couleur: '#4A5D4E' },
  { statut: 'livree',     label: 'Livrée',     couleur: '#93A27D' },
]

export default function BoutonsStatut({ id, statut }: { id: string; statut: Statut }) {
  const router = useRouter()
  const [chargement, setChargement] = useState(false)

  async function changerStatut(nouveau: Statut) {
    if (nouveau === statut || chargement) return
    setChargement(true)
    await fetch(`/api/commandes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statut: nouveau }),
    })
    router.refresh()
    setChargement(false)
  }

  return (
    <div className="flex gap-2 mt-3">
      {ETAPES.map(e => (
        <button
          key={e.statut}
          onClick={() => changerStatut(e.statut)}
          disabled={chargement}
          className="flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all"
          style={{
            backgroundColor: e.statut === statut ? e.couleur : 'transparent',
            color: e.statut === statut ? '#fff' : e.couleur,
            border: `1.5px solid ${e.couleur}`,
            opacity: chargement ? 0.6 : 1,
          }}
        >
          {e.label}
        </button>
      ))}
    </div>
  )
}
