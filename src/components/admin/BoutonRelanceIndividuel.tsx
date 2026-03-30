'use client'

import { useState } from 'react'

type Props = {
  commandeId: string
  userId: string | null
  telephone: string
  prenom: string
  total: number
  locale: string
}

function messageWhatsApp(prenom: string, total: number, telephone: string, locale: string): string {
  const pt = locale === 'pt-BR'
  const msg = pt
    ? `Olá ${prenom}, tudo bem? Passando para lembrar que o pagamento do seu pedido de R$ ${total.toFixed(2)} ainda está pendente. Pode me enviar o comprovante quando puder? Obrigada! 🌿`
    : `Bonjour ${prenom}, j'espère que vous allez bien ! Je me permets de vous relancer concernant le paiement de votre commande de R$ ${total.toFixed(2)} qui est toujours en attente. Merci d'avance ! 🌿`
  const tel = telephone.replace(/\D/g, '')
  const base = tel.startsWith('55') ? tel : `55${tel}`
  return `https://wa.me/${base}?text=${encodeURIComponent(msg)}`
}

export default function BoutonRelanceIndividuel({ commandeId, userId, telephone, prenom, total, locale }: Props) {
  const [envoiPush, setEnvoiPush] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle')

  async function envoyerPush() {
    if (!userId) return
    setEnvoiPush('loading')
    try {
      const pt = locale === 'pt-BR'
      const res = await fetch('/api/push/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          payload: {
            title: pt ? '⏰ Lembrete de pagamento' : '⏰ Rappel de paiement',
            body: pt
              ? `Seu pedido de R$ ${total.toFixed(2)} aguarda pagamento.`
              : `Votre commande de R$ ${total.toFixed(2)} est en attente de paiement.`,
            url: pt ? '/pt-BR/mes-commandes' : '/fr/mes-commandes',
            icon: '/logo-submark.png',
          },
        }),
      })
      const json = await res.json()
      setEnvoiPush(json.ok && json.sent > 0 ? 'ok' : 'err')
      setTimeout(() => setEnvoiPush('idle'), 3000)
    } catch {
      setEnvoiPush('err')
      setTimeout(() => setEnvoiPush('idle'), 3000)
    }
  }

  return (
    <div className="flex flex-wrap gap-2 mt-2">
      <a
        href={messageWhatsApp(prenom, total, telephone, locale)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
        style={{ backgroundColor: '#25D366' }}
      >
        📱 Relancer par WhatsApp
      </a>

      {userId && (
        <button
          onClick={envoyerPush}
          disabled={envoiPush === 'loading'}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-opacity hover:opacity-80 disabled:opacity-50"
          style={{
            backgroundColor: envoiPush === 'ok' ? '#4A5D4E' : envoiPush === 'err' ? '#C0522A' : '#6B7280',
          }}
        >
          {envoiPush === 'loading' && '…'}
          {envoiPush === 'ok' && '✓ Notification envoyée'}
          {envoiPush === 'err' && '✗ Aucune notification active'}
          {envoiPush === 'idle' && '🔔 Notifier'}
        </button>
      )}
    </div>
  )
}
