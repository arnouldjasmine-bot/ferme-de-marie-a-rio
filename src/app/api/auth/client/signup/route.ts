import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const prenom    = formData.get('prenom')?.toString()?.trim() ?? ''
    const nom       = formData.get('nom')?.toString()?.trim() ?? ''
    const email     = formData.get('email')?.toString()?.trim() ?? ''
    const telephone = formData.get('telephone')?.toString()?.trim() ?? ''
    const password  = formData.get('password')?.toString() ?? ''
    const locale    = formData.get('locale')?.toString() ?? 'fr'

    if (!prenom || !nom || !email || !password) {
      return NextResponse.json({ ok: false, error: 'Champs manquants' }, { status: 400 })
    }

    // Service role → compte créé directement sans confirmation email
    const supabase = createServiceClient()

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { prenom, nom, telephone, locale },
    })

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true, user: data.user })
  } catch (err) {
    console.error('Erreur inscription:', err)
    return NextResponse.json({ ok: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
