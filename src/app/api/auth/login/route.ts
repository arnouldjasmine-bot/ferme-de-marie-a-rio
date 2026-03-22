import { NextRequest, NextResponse } from 'next/server'

type AdminCredential = { email: string; password: string }

function getAdmins(): AdminCredential[] {
  if (process.env.ADMIN_CREDENTIALS) {
    try {
      return JSON.parse(process.env.ADMIN_CREDENTIALS)
    } catch { /* fallback */ }
  }
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
    const response = NextResponse.json({ ok: true })
    response.cookies.set('dev-admin-session', 'authenticated', {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    })
    return response
  }

  return NextResponse.json({ ok: false }, { status: 401 })
}
