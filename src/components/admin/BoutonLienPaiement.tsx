'use client'

import { useState } from 'react'
import React from 'react'

export default function BoutonLienPaiement({ id }: { id: string }) {
  const [copie, setCopie] = useState(false)

  function copierLien() {
    const lien = `${window.location.origin}/payer/${id}`
    navigator.clipboard.writeText(lien)
    setCopie(true)
    setTimeout(() => setCopie(false), 2000)
  }

  const style: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.375rem 0.75rem',
    borderRadius: '0.5rem',
    border: '1.5px solid var(--vert-sauge)',
    backgroundColor: 'transparent',
    color: 'var(--vert-sauge-fonce)',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.15s',
  }

  const styleActif: React.CSSProperties = {
    ...style,
    backgroundColor: '#eef3ee',
    borderColor: 'var(--vert-sauge-fonce)',
  }

  return (
    <button onClick={copierLien} style={copie ? styleActif : style}>
      {copie ? '✓ Lien copié !' : '🔗 Lien de paiement'}
    </button>
  )
}
