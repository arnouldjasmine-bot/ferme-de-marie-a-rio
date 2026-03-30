'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function BoutonSupprimerCommande({ id }: { id: string }) {
  const router = useRouter()
  const [confirme, setConfirme] = useState(false)
  const [chargement, setChargement] = useState(false)

  async function supprimer() {
    setChargement(true)
    await fetch(`/api/commandes/${id}`, { method: 'DELETE' })
    router.push('/commandes')
    router.refresh()
  }

  if (!confirme) {
    return (
      <button
        onClick={() => setConfirme(true)}
        className="text-xs underline opacity-40 hover:opacity-70 transition-opacity"
        style={{ color: 'var(--couleur-erreur)' }}
      >
        Supprimer cette commande
      </button>
    )
  }

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: '#fdf0ec', border: '1px solid #C0522A33' }}>
      <p className="text-xs font-medium flex-1" style={{ color: '#C0522A' }}>
        Supprimer définitivement cette commande ?
      </p>
      <button
        onClick={supprimer}
        disabled={chargement}
        className="px-3 py-1.5 rounded-lg text-white text-xs font-semibold transition-opacity hover:opacity-80 disabled:opacity-50"
        style={{ backgroundColor: '#C0522A' }}
      >
        {chargement ? '…' : 'Confirmer'}
      </button>
      <button
        onClick={() => setConfirme(false)}
        className="text-xs underline opacity-60 hover:opacity-90"
        style={{ color: 'var(--couleur-texte-doux)' }}
      >
        Annuler
      </button>
    </div>
  )
}
