'use client'

import { useState } from 'react'
import { normaliserTelWhatsApp } from '@/lib/tel'

function getMessageWhatsApp(lien: string, locale?: string): string {
  if (locale === 'fr') {
    return encodeURIComponent(
      `Bonjour ! 🌿 Voici le lien pour régler votre commande La Ferme de Marie :\n\n${lien}\n\nMerci !`
    )
  }
  // pt-BR par défaut (clients brésiliens majoritaires)
  return encodeURIComponent(
    `Olá! 🌿 Segue o link para pagamento do seu pedido na Ferme de Marie:\n\n${lien}\n\nObrigada!`
  )
}

export default function BoutonLienPaiement({
  id,
  telephone,
  locale,
}: {
  id: string
  telephone?: string
  locale?: string
}) {
  const [copie, setCopie] = useState(false)

  function getLien() {
    return `${window.location.origin}/payer/${id}`
  }

  function copierLien() {
    navigator.clipboard.writeText(getLien())
    setCopie(true)
    setTimeout(() => setCopie(false), 2000)
  }

  function ouvrirWhatsApp() {
    const lien = getLien()
    const message = getMessageWhatsApp(lien, locale)
    const numero = telephone ? normaliserTelWhatsApp(telephone) : ''
    const url = numero
      ? `https://wa.me/${numero}?text=${message}`
      : `https://wa.me/?text=${message}`
    window.open(url, '_blank')
  }

  const styleBase: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.375rem',
    padding: '0.375rem 0.75rem',
    borderRadius: '0.5rem',
    fontSize: '0.75rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'opacity 0.15s',
  }

  return (
    <div className="flex flex-wrap gap-2">
      {/* Copier le lien */}
      <button
        onClick={copierLien}
        style={{
          ...styleBase,
          border: '1.5px solid var(--vert-sauge)',
          backgroundColor: copie ? '#eef3ee' : 'transparent',
          color: 'var(--vert-sauge-fonce)',
        }}
      >
        {copie ? '✓ Copié !' : '🔗 Lien de paiement'}
      </button>

      {/* WhatsApp */}
      <button
        onClick={ouvrirWhatsApp}
        style={{
          ...styleBase,
          border: '1.5px solid #25D366',
          backgroundColor: 'transparent',
          color: '#128C7E',
        }}
      >
        📲 WhatsApp
      </button>
    </div>
  )
}
