import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET() {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('avis')
    .select('id, note, commentaire, locale, created_at, profiles(prenom, nom)')
    .eq('approuve', true)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json([], { status: 500 })
  return NextResponse.json(data ?? [])
}

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 })
  }
  const token = authHeader.substring(7)
  const supabase = createServiceClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return NextResponse.json({ error: 'Token invalide' }, { status: 401 })
  }

  try {
    const body = await request.json() as { order_id?: string; note?: number; commentaire?: string; locale?: string }
    const { order_id, note, commentaire, locale = 'fr' } = body

    if (!note || note < 1 || note > 5) {
      return NextResponse.json({ error: 'Note invalide (1-5)' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('avis')
      .insert({
        user_id: user.id,
        order_id: order_id ?? null,
        note,
        commentaire: commentaire?.trim() ?? null,
        locale,
        approuve: false,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ ok: true, data })
  } catch (err) {
    console.error('Erreur avis:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
