import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { endpoint?: string }
    const { endpoint } = body

    if (!endpoint) {
      return NextResponse.json({ error: 'endpoint manquant' }, { status: 400 })
    }

    const supabase = createServiceClient()
    await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Erreur unsubscribe push:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
