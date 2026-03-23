import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendPush, type PushSubscriptionRecord } from '@/lib/push'
import { isAdminRequest } from '@/lib/supabase/admin-auth'

export async function POST(request: NextRequest) {
  if (!await isAdminRequest(request)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const supabase = createServiceClient()
    const { data: subs, error } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth_key, locale')

    if (error) throw error

    let sent = 0
    const errors: string[] = []
    await Promise.allSettled(
      (subs ?? []).map(async (sub: PushSubscriptionRecord & { locale?: string }) => {
        const pt = sub.locale === 'pt-BR'
        const payload = {
          title: pt ? 'La Ferme de Marie 🌿' : 'La Ferme de Marie 🌿',
          body: pt
            ? 'Novos produtos disponíveis na fazenda! Confira o catálogo.'
            : 'Nouveaux produits disponibles à la ferme ! Consultez le catalogue.',
          url: pt ? '/pt-BR/produits' : '/fr/produits',
          icon: '/logo-submark.png',
        }
        try {
          const result = await sendPush(sub, payload)
          if (result === 'ok') sent++
          else {
            errors.push(`expired: ${sub.endpoint.slice(0, 40)}`)
            // Supprimer l'abonnement expiré de la base
            await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
          }
        } catch (e) {
          const msg = e instanceof Error ? e.message : String(e)
          errors.push(`error: ${msg}`)
          console.error('Erreur push stock:', e)
        }
      })
    )

    console.log(`Push stock: sent=${sent}, errors=${JSON.stringify(errors)}`)
    return NextResponse.json({ ok: true, sent, total: subs?.length ?? 0, errors })
  } catch (err) {
    console.error('Erreur stock push:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
