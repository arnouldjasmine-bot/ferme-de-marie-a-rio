import { NextRequest, NextResponse } from 'next/server'

type AdminCredential = { email: string; password: string }

function getAdmins(): AdminCredential[] {
  // Variable unique JSON : [{"email":"...","password":"..."},...]
  if (process.env.ADMIN_CREDENTIALS) {
    try {
      return JSON.parse(process.env.ADMIN_CREDENTIALS)
    } catch { /* fallback */ }
  }
  // Fallback : variable simple (rétrocompatibilité)
  const email    = process.env.ADMIN_EMAIL    ?? 'admin@ferme-marie.test'
  const password = process.env.ADMIN_PASSWORD ?? 'ferme2024!'
  return [{ email, password }]
}

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const email    = formData.get('email')?.toString().trim() ?? ''
  const password = formData.get('password')?.toString() ?? ''

  const admins = getAdmins()
  const valide = admins.some(a => a.email === email && a.password === password)

  if (valide) {
    const response = NextResponse.redirect(new URL('/dashboard', request.url))
    response.cookies.set('dev-admin-session', 'authenticated', {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: '/'
    })
    return response
  }

  const url = new URL('/login', request.url)
  url.searchParams.set('erreur', '1')
  return NextResponse.redirect(url)
}
