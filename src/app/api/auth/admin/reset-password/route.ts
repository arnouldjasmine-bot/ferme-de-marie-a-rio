import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import crypto from 'crypto'

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + (process.env.ADMIN_SALT ?? 'ferme-salt')).digest('hex')
}

export async function POST(request: NextRequest) {
  const { token, password } = await request.json()

  if (!token || !password || password.length < 8) {
    return NextResponse.json({ error: 'Données invalides.' }, { status: 400 })
  }

  const supabase = createServiceClient()

  // Vérifier le token
  const { data: tokenRow } = await supabase
    .from('admin_reset_tokens')
    .select('*')
    .eq('token', token)
    .eq('used', false)
    .single()

  if (!tokenRow) {
    return NextResponse.json({ error: 'Lien invalide ou expiré.' }, { status: 400 })
  }

  if (new Date(tokenRow.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Ce lien a expiré. Faites une nouvelle demande.' }, { status: 400 })
  }

  // Marquer le token comme utilisé
  await supabase.from('admin_reset_tokens').update({ used: true }).eq('id', tokenRow.id)

  // Stocker le nouveau mot de passe hashé dans admin_settings
  const hashed = hashPassword(password)
  await supabase.from('admin_settings').upsert(
    { cle: 'admin_password_hash', valeur: hashed, updated_at: new Date().toISOString() },
    { onConflict: 'cle' }
  )

  return NextResponse.json({ ok: true })
}
