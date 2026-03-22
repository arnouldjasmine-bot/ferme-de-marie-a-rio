import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendPush, type PushPayload, type PushSubscriptionRecord } from '@/lib/push'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      user_id?: string
      payload: PushPayload
    }

    const { user_id, payload } = body
    if (!payload) return NextResponse.json({ error: 'Payload manquant' }, { status: 400 })

    const supabase = createServiceClient()
    let query = supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh, auth_key')

    if (user_id) {
      query = query.eq('user_id', user_id)
    }

    const { data: subs, error } = await query
    if (error) throw error

    let sent = 0
    await Promise.allSettled(
      (subs ?? []).map(async (sub: PushSubscriptionRecord) => {
        try {
          await sendPush(sub, payload)
          sent++
        } catch (e) {
          console.error('Erreur push:', e)
        }
      })
    )

    return NextResponse.json({ ok: true, sent })
  } catch (err) {
    console.error('Erreur notify push:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
