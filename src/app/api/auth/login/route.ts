import { NextRequest, NextResponse } from 'next/server'

const DEV_EMAIL    = process.env.ADMIN_EMAIL    ?? 'admin@ferme-marie.test'
const DEV_PASSWORD = process.env.ADMIN_PASSWORD ?? 'ferme2024!'

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const email    = formData.get('email')?.toString().trim()
  const password = formData.get('password')?.toString()

  if (email === DEV_EMAIL && password === DEV_PASSWORD) {
    const response = NextResponse.redirect(new URL('/dashboard', request.url))
    // Cookie de session simple pour le dev
    response.cookies.set('dev-admin-session', 'authenticated', {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      path: '/'
    })
    return response
  }

  // Mauvais identifiants
  const url = new URL('/login', request.url)
  url.searchParams.set('erreur', '1')
  return NextResponse.redirect(url)
}
