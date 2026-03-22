import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendPush, type PushSubscriptionRecord } from '@/lib/push'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  // Vérification session admin
  const cookieStore = await cookies()
  const devSession = cookieStore.get('dev-admin-session')?.value
  if (devSession !== 'authenticated') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const supabase = createServiceClient()
    const { data: subs, error } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth_key, locale')

    if (error) throw error

    let sent = 0
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
          await sendPush(sub, payload)
          sent++
        } catch (e) {
          console.error('Erreur push stock:', e)
        }
      })
    )

    return NextResponse.json({ ok: true, sent })
  } catch (err) {
    console.error('Erreur stock push:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
