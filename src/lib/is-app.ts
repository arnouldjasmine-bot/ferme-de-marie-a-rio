import { headers } from 'next/headers'

/**
 * Détecte si la requête vient du sous-domaine app (Capacitor iOS/Android).
 * Utilisable uniquement dans les Server Components.
 *
 * app.lafermedemarieario.com.br → true
 * lafermedemarieario.com.br     → false
 * localhost:3000                → false (sauf si NEXT_PUBLIC_IS_APP=1 en dev)
 */
export async function isAppMode(): Promise<boolean> {
  // Variable d'env pour tester le mode app en local
  if (process.env.NEXT_PUBLIC_IS_APP === '1') return true

  const headersList = await headers()
  const host = headersList.get('host') ?? ''
  return host.startsWith('app.')
}
