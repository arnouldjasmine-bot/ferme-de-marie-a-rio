'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'

function isCapacitorApp(): boolean {
  if (typeof window === 'undefined') return false
  return !!(window as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()
}

/**
 * Redirige vers /bienvenue au premier lancement de l'app Capacitor.
 * Ne fait rien sur le site web.
 * Mémorise en localStorage que l'onboarding a été fait.
 */
export default function OnboardingGuard() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()

  useEffect(() => {
    if (!isCapacitorApp()) return
    if (pathname.includes('/bienvenue')) return

    const done = localStorage.getItem('ferme-onboarding-done')
    if (!done) {
      router.replace(`/${locale}/bienvenue`)
    }
  }, [pathname, locale, router])

  return null
}
