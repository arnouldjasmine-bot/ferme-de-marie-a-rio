import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const email    = formData.get('email')?.toString()?.trim() ?? ''
    const password = formData.get('password')?.toString() ?? ''

    if (!email || !password) {
      return NextResponse.json({ ok: false, error: 'Email et mot de passe requis' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 401 })
    }

    return NextResponse.json({ ok: true, user: data.user })
  } catch (err) {
    console.error('Erreur connexion:', err)
    return NextResponse.json({ ok: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
