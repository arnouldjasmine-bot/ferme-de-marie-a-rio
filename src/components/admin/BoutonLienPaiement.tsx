'use client'

import { useState } from 'react'

function formatTelWhatsApp(tel: string, locale?: string): string {
  // Supprimer tout sauf les chiffres
  let digits = tel.replace(/\D/g, '')
  // Déjà un indicatif pays (≥12 chiffres) → on garde tel quel
  if (digits.length >= 12) return digits
  // Indicatif selon la locale
  const indicatif = locale === 'fr' ? '33' : '55'
  // Supprimer le 0 initial si présent (ex: France 0612... → 612...)
  if (digits.startsWith('0')) digits = digits.slice(1)
  return indicatif + digits
}

export default function BoutonLienPaiement({ id, telephone, locale }: { id: string; telephone?: string; locale?: string }) {
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
    const message = encodeURIComponent(
      `Olá! 🌿 Segue o link para pagamento do seu pedido na Ferme de Marie:\n\n${lien}\n\nObrigada!`
    )
    const numero = telephone ? formatTelWhatsApp(telephone, locale) : ''
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
