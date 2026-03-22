'use client'

import { useState } from 'react'

interface Props {
  avisId: string
  approuve: boolean
  onAction: (id: string, action: 'approve' | 'reject' | 'delete') => void
}

export default function BoutonsAvis({ avisId, approuve, onAction }: Props) {
  const [loading, setLoading] = useState(false)

  async function approuver() {
    setLoading(true)
    await fetch(`/api/avis/${avisId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approuve: true }),
    })
    onAction(avisId, 'approve')
    setLoading(false)
  }

  async function rejeter() {
    setLoading(true)
    await fetch(`/api/avis/${avisId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approuve: false }),
    })
    onAction(avisId, 'reject')
    setLoading(false)
  }

  async function supprimer() {
    if (!confirm('Supprimer cet avis ?')) return
    setLoading(true)
    await fetch(`/api/avis/${avisId}`, { method: 'DELETE' })
    onAction(avisId, 'delete')
    setLoading(false)
  }

  return (
    <div className="flex items-center gap-2">
      {!approuve && (
        <button
          onClick={approuver}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg text-white text-xs font-medium transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: 'var(--couleur-succes)' }}
        >
          ✓ Approuver
        </button>
      )}
      {approuve && (
        <button
          onClick={rejeter}
          disabled={loading}
          className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-opacity hover:opacity-80 disabled:opacity-50"
          style={{ color: 'var(--couleur-texte-doux)', borderColor: 'var(--couleur-bordure)' }}
        >
          Masquer
        </button>
      )}
      <button
        onClick={supprimer}
        disabled={loading}
        className="px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-80 disabled:opacity-50"
        style={{ color: 'var(--couleur-erreur)' }}
      >
        Supprimer
      </button>
    </div>
  )
}
