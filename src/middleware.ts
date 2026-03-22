import { NextRequest, NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

// Routes admin protégées
const ADMIN_ROUTES = [
  '/admin',
  '/dashboard',
  '/produits',
  '/commandes',
  '/carte',
  '/statistiques'
]

function isAdminPath(pathname: string): boolean {
  // Les routes (admin) n'ont pas de préfixe de locale
  // On détecte si c'est une route admin en vérifiant l'absence de préfixe de locale
  const locales = routing.locales as readonly string[]
  const firstSegment = pathname.split('/')[1]
  if (locales.includes(firstSegment)) return false

  return ADMIN_ROUTES.some(route => pathname.startsWith(route)) ||
    pathname === '/login'
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

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

    // Cookie de dev (sans Supabase configuré)
    const devSession = request.cookies.get('dev-admin-session')?.value
    if (devSession === 'authenticated') return NextResponse.next()

    // Sans Supabase configuré : redirection login
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // Vérification du cookie de session Supabase
    const accessToken = request.cookies.get('sb-access-token')?.value ||
      request.cookies.get(`sb-${new URL(supabaseUrl).hostname.split('.')[0]}-auth-token`)?.value

    if (!accessToken) {
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
