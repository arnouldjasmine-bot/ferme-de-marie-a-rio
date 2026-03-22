'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function BoutonPaiementStatut({ id, paiement_statut }: { id: string; paiement_statut: string }) {
  const router = useRouter()
  const [chargement, setChargement] = useState(false)
  const payee = paiement_statut === 'payee'

  async function toggle() {
    setChargement(true)
    await fetch(`/api/commandes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paiement_statut: payee ? 'en_attente' : 'payee' }),
    })
    router.refresh()
    setChargement(false)
  }

  return (
    <button
      onClick={toggle}
      disabled={chargement}
      className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
      style={{
        backgroundColor: payee ? '#eef3ee' : 'transparent',
        color: payee ? '#4A5D4E' : '#D27D56',
        border: `1.5px solid ${payee ? '#4A5D4E' : '#D27D56'}`,
      }}
    >
      {chargement ? '…' : payee ? '✓ Payée' : 'Marquer payée'}
    </button>
  )
}
