'use client'

import { useEffect } from 'react'

/**
 * Initialise les notifications push natives dans l'app Capacitor (iOS).
 * Ce composant ne fait rien dans un navigateur web normal.
 *
 * Flux :
 *  1. Détecte si on est dans l'app Capacitor
 *  2. Demande la permission APNs
 *  3. Récupère le token APNs
 *  4. Enregistre le token en base via /api/push/register-device
 *  5. Écoute les notifications reçues au premier plan
 *  6. Gère le tap sur une notification → navigation vers l'URL
 */
export default function CapacitorPushInit() {
  useEffect(() => {
    const isCapacitor =
      typeof window !== 'undefined' &&
      !!(window as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()

    if (!isCapacitor) return

    let cleanupFns: (() => void)[] = []

    async function initPush() {
      try {
        const { PushNotifications } = await import('@capacitor/push-notifications')

        // Demande la permission (affiche le dialogue natif iOS)
        const perm = await PushNotifications.requestPermissions()
        if (perm.receive !== 'granted') return

        // S'enregistre auprès d'APNs
        await PushNotifications.register()

        // Token reçu → on l'envoie au backend
        const regListener = await PushNotifications.addListener('registration', async (token) => {
          try {
            await fetch('/api/push/register-device', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ token: token.value, platform: 'ios' }),
            })
          } catch (e) {
            console.error('[Push] Échec enregistrement token', e)
          }
        })
        cleanupFns.push(() => regListener.remove())

        // Erreur d'enregistrement
        const errListener = await PushNotifications.addListener('registrationError', (err) => {
          console.error('[Push] Erreur APNs registration:', err)
        })
        cleanupFns.push(() => errListener.remove())

        // Notification reçue en premier plan
        const rcvListener = await PushNotifications.addListener('pushNotificationReceived', (_notification) => {
          // La notification s'affiche automatiquement grâce à presentationOptions dans capacitor.config.ts
        })
        cleanupFns.push(() => rcvListener.remove())

        // Tap sur une notification → naviguer vers l'URL
        const actListener = await PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
          const url = action.notification.data?.url as string | undefined
          if (url) {
            window.location.href = url
          }
        })
        cleanupFns.push(() => actListener.remove())

      } catch (e) {
        console.error('[Push] Erreur initialisation:', e)
      }
    }

    initPush()

    return () => {
      cleanupFns.forEach(fn => fn())
    }
  }, [])

  return null
}
