import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as {
      endpoint?: string
      p256dh?: string
      auth_key?: string
      locale?: string
    }

    const { endpoint, p256dh, auth_key, locale = 'fr' } = body

    if (!endpoint || !p256dh || !auth_key) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 })
    }

    // Récupérer l'utilisateur depuis le token
    const authHeader = request.headers.get('authorization')
    let userId: string | null = null
    const supabase = createServiceClient()

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const { data: { user } } = await supabase.auth.getUser(token)
      userId = user?.id ?? null
    }

    // Upsert sur l'endpoint
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert(
        { endpoint, p256dh, auth_key, locale, user_id: userId },
        { onConflict: 'endpoint' }
      )

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Erreur subscribe push:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
