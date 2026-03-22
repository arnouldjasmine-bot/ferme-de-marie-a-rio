import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function GET() {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('page_content')
    .select('cle, valeur_fr, valeur_pt')
    .order('cle')

  if (error) return NextResponse.json({}, { status: 500 })

  // Retourner un objet clé → { fr, pt }
  const result: Record<string, { fr: string; pt: string }> = {}
  for (const row of data ?? []) {
    result[row.cle] = { fr: row.valeur_fr, pt: row.valeur_pt }
  }
  return NextResponse.json(result)
}

export async function PATCH(request: NextRequest) {
  // Vérification admin
  const devSession = request.cookies.get('dev-admin-session')?.value
  if (devSession !== 'authenticated') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const body = await request.json() as Record<string, { fr?: string; pt?: string }>

  const supabase = createServiceClient()
  const upserts = Object.entries(body).map(([cle, { fr = '', pt = '' }]) => ({
    cle,
    valeur_fr: fr,
    valeur_pt: pt,
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabase
    .from('page_content')
    .upsert(upserts, { onConflict: 'cle' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
