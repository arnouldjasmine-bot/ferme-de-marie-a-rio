import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { prenom, nom, telephone, locale },
      },
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
