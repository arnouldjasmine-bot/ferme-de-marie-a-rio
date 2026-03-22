import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendPush, type PushSubscriptionRecord } from '@/lib/push'

// Cron job : relances paiement à 3j et 6j après livraison estimée
export async function GET() {
  try {
    const supabase = createServiceClient()
    const now = new Date()

    // Trouver les commandes confirmées non payées
    const { data: commandes, error } = await supabase
      .from('orders')
      .select('id, prenom, user_id, locale, created_at, paiement_statut')
      .eq('statut', 'confirmee')
      .neq('paiement_statut', 'payee')
      .not('user_id', 'is', null)

    if (error) throw error

    let sent = 0

    await Promise.allSettled(
      (commandes ?? []).map(async (commande: {
        id: string
        prenom: string
        user_id: string
        locale: string
        created_at: string
        paiement_statut: string | null
      }) => {
        const createdAt = new Date(commande.created_at)
        const diffDays = Math.floor((now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24))

        // Relance à 3 jours ou 6 jours
        if (diffDays !== 3 && diffDays !== 6) return

        const { data: subs } = await supabase
          .from('push_subscriptions')
          .select('endpoint, p256dh, auth_key, locale')
          .eq('user_id', commande.user_id)

        if (!subs?.length) return

        const pt = (commande.locale ?? 'fr') === 'pt-BR'
        const payload = {
          title: pt ? '⏰ Lembrete de pagamento' : '⏰ Rappel de paiement',
          body: pt
            ? `Seu pedido de ${commande.prenom} aguarda o pagamento. Acesse seus pedidos.`
            : `Votre commande est en attente de paiement. Accédez à vos commandes.`,
          url: pt ? '/pt-BR/mes-commandes' : '/fr/mes-commandes',
          icon: '/logo-submark.png',
        }

        await Promise.allSettled(
          subs.map(async (sub: PushSubscriptionRecord) => {
            try { await sendPush(sub, payload); sent++ } catch (e) { console.error(e) }
          })
        )
      })
    )

    return NextResponse.json({ ok: true, sent })
  } catch (err) {
    console.error('Erreur relances push:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
