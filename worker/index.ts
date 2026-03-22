/// <reference lib="webworker" />
/// <reference no-default-lib="true"/>

export type {} // make this a module to avoid redeclaration issues

declare const self: ServiceWorkerGlobalScope & typeof globalThis

// ── Push event ──────────────────────────────────────────────────────
self.addEventListener('push', (event: PushEvent) => {
  if (!event.data) return

  let payload: {
    title?: string
    body?: string
    url?: string
    icon?: string
    badge?: string
  } = {}

  try {
    payload = event.data.json() as typeof payload
  } catch {
    payload = { title: 'La Ferme de Marie', body: event.data.text() }
  }

  const title = payload.title ?? 'La Ferme de Marie à Rio'
  const options: NotificationOptions = {
    body: payload.body ?? '',
    icon: payload.icon ?? '/logo-submark.png',
    badge: payload.badge ?? '/logo-submark.png',
    data: { url: payload.url ?? '/' },
  }

  event.waitUntil(self.registration.showNotification(title, options))
})

// ── Notification click ───────────────────────────────────────────────
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close()

  const url: string = (event.notification.data?.url as string | undefined) ?? '/'

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(clients => {
        const existing = clients.find(c => c.url === url || c.url.startsWith(self.location.origin))
        if (existing) {
          existing.focus()
          return existing.navigate(url)
        }
        return self.clients.openWindow(url)
      })
  )
})
