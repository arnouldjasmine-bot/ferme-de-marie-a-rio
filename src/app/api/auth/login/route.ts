import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import crypto from 'crypto'

type AdminCredential = { email: string; password: string }

function getAdmins(): AdminCredential[] {
  if (process.env.ADMIN_CREDENTIALS) {
    try { return JSON.parse(process.env.ADMIN_CREDENTIALS) } catch { /* fallback */ }
  }
  return [{
    email: process.env.ADMIN_EMAIL ?? 'admin@ferme-marie.test',
    password: process.env.ADMIN_PASSWORD ?? 'ferme2024!',
  }]
}

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + (process.env.ADMIN_SALT ?? 'ferme-salt')).digest('hex')
}

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const email    = formData.get('email')?.toString().trim() ?? ''
  const password = formData.get('password')?.toString() ?? ''

  const admins = getAdmins()
  const adminMatch = admins.find(a => a.email === email)

  let valide = false

  if (adminMatch) {
    // 1. Vérifier si un mot de passe surchargé existe dans Supabase (après reset)
    try {
      const supabase = createServiceClient()
      const { data } = await supabase
        .from('admin_settings')
        .select('valeur')
        .eq('cle', 'admin_password_hash')
        .single()

      if (data?.valeur) {
        valide = data.valeur === hashPassword(password)
      } else {
        // Pas de surcharge → mot de passe env var
        valide = adminMatch.password === password
      }
    } catch {
      // Supabase indisponible → fallback env var
      valide = adminMatch.password === password
    }
  }

  if (valide) {
    const response = NextResponse.json({ ok: true })
    response.cookies.set('dev-admin-session', 'authenticated', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 30,
      path: '/'
    })
    return response
  }

  return NextResponse.json({ ok: false }, { status: 401 })
}
