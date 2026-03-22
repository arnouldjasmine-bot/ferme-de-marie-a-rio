/* eslint-disable no-restricted-globals */
// Service worker custom — géré par @ducanh2912/next-pwa (customWorkerSrc: 'worker')
// Ce fichier est compilé séparément et fusionné avec le SW généré par next-pwa.

declare const self: ServiceWorkerGlobalScope

self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) return

  let payload: { title?: string; body?: string; url?: string; icon?: string }
  try {
    payload = event.data.json() as { title?: string; body?: string; url?: string; icon?: string }
  } catch {
    payload = { title: 'La Ferme de Marie', body: event.data.text() }
  }

  const title = payload.title ?? 'La Ferme de Marie à Rio'
  const options: NotificationOptions = {
    body: payload.body ?? '',
    icon: payload.icon ?? '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: payload.url ?? '/fr/mes-commandes' },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close()
  const url: string = (event.notification.data as { url?: string })?.url ?? '/fr/mes-commandes'
  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return (client as WindowClient).focus()
          }
        }
        return self.clients.openWindow(url)
      })
  )
})
