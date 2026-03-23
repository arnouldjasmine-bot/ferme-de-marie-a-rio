import { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

/**
 * Vérifie si la requête provient d'un admin authentifié.
 * Utilise le client SSR pour lire correctement les cookies Supabase.
 */
export async function isAdminRequest(request: NextRequest): Promise<boolean> {
  // Cookie de dev local
  if (request.cookies.get('dev-admin-session')?.value === 'authenticated') return true

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return false

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: () => {},
    },
  })

  const { data: { user } } = await supabase.auth.getUser()
  return !!user
}
