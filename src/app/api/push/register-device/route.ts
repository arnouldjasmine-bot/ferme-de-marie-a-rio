import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/push/register-device
 * Enregistre un token de notification push natif (APNs iOS).
 * Appelé depuis l'app Capacitor après obtention du token APNs.
 *
 * Body : { token: string, platform: 'ios' | 'android' }
 */
export async function POST(request: NextRequest) {
  try {
    const { token, platform } = await request.json() as {
      token: string
      platform: 'ios' | 'android'
    }

    if (!token) {
      return NextResponse.json({ error: 'Token manquant' }, { status: 400 })
    }

    // Récupérer l'utilisateur connecté (optionnel — un client peut aussi être anonyme)
    const supabaseUser = await createClient()
    const { data: { user } } = await supabaseUser.auth.getUser()

    const service = createServiceClient()

    // Upsert : si le token existe déjà on met à jour le user_id et la date
    const { error } = await service
      .from('device_tokens')
      .upsert(
        {
          token,
          platform,
          user_id: user?.id ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'token' }
      )

    if (error) {
      // Si la table n'existe pas encore, on log et on répond OK pour ne pas bloquer l'app
      console.error('[push/register-device] Erreur Supabase:', error.message)
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[push/register-device] Erreur:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
