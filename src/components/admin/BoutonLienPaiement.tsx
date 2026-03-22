'use client'

import { useState } from 'react'

/**
 * Normalise un numéro de téléphone pour l'API wa.me.
 * wa.me attend le numéro complet sans + ni espaces : ex. 5521999999999
 * On auto-ajoute l'indicatif pays si le client a oublié de le saisir.
 */
function formatTelWhatsApp(tel: string, locale?: string): string {
  // Garder uniquement les chiffres
  let digits = tel.replace(/\D/g, '')

  if (locale === 'pt-BR') {
    // Brésil : indicatif 55, DDD 2 chiffres obligatoire
    // ex: "21 98166-8526" → "5521981668526"
    if (!digits.startsWith('55')) {
      // Si le numéro commence par 0 (format local brésilien), on retire le 0
      if (digits.startsWith('0')) digits = digits.slice(1)
      digits = '55' + digits
    }
  } else if (locale === 'fr') {
    // France : indicatif 33
    // ex: "0612345678" → "33612345678"
    if (digits.startsWith('0')) {
      digits = '33' + digits.slice(1)
    } else if (!digits.startsWith('33')) {
      digits = '33' + digits
    }
  }
  // Sinon : utilise le numéro tel quel (le client a saisi l'indicatif complet)

  return digits
}

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
