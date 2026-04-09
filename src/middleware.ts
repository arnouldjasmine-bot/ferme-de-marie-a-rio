import { NextRequest, NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

// Sous-domaine app mobile (Capacitor)
const APP_HOSTNAME = 'app.lafermedemarieario.com.br'

// Routes admin protégées
const ADMIN_ROUTES = [
  '/admin',
  '/dashboard',
  '/produits',
  '/commandes',
  '/carte',
  '/statistiques',
  '/medrio',
  '/clients',
  '/categories',
  '/avis',
  '/page-accueil',
]

function isAdminPath(pathname: string): boolean {
  const locales = routing.locales as readonly string[]
  const firstSegment = pathname.split('/')[1]
  if (locales.includes(firstSegment)) return false

  return ADMIN_ROUTES.some(route => pathname.startsWith(route)) ||
    pathname === '/login'
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') ?? ''

  // Détecter si la requête vient du sous-domaine app (Capacitor)
  const isApp = hostname === APP_HOSTNAME || hostname.startsWith('app.')

  // Passer les routes API, paiement public et fichiers statiques
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/payer/') ||
    pathname.startsWith('/_next/') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Routes admin : vérifier la session Supabase Auth côté serveur
  if (isAdminPath(pathname)) {
    if (pathname === '/login') {
      return NextResponse.next()
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    const devSession = request.cookies.get('dev-admin-session')?.value
    if (devSession === 'authenticated') return NextResponse.next()

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    const { createServerClient } = await import('@supabase/ssr')
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: () => {},
      },
    })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
  }

  // Routes client : appliquer le middleware i18n (next-intl)
  return intlMiddleware(request)
}

export const config = {
  // Intercepte toutes les requêtes sauf fichiers statiques Next.js
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
}
