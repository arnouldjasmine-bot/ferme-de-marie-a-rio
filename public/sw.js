// Service Worker — La Ferme de Marie à Rio

self.addEventListener('install', function() {
  self.skipWaiting()
})

self.addEventListener('activate', function(event) {
  event.waitUntil(clients.claim())
})

self.addEventListener('push', function(event) {
  if (!event.data) return
  var payload
  try { payload = event.data.json() }
  catch(e) { payload = { title: 'La Ferme de Marie', body: event.data.text() } }

  var title = payload.title || 'La Ferme de Marie à Rio'
  var options = {
    body: payload.body || '',
    icon: payload.icon || '/icon-192.png',
    badge: '/icon-192.png',
    data: { url: payload.url || '/fr/mes-commandes' },
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()
  var url = (event.notification.data && event.notification.data.url) || '/fr/mes-commandes'
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
      for (var i = 0; i < clientList.length; i++) {
        if (clientList[i].url === url && 'focus' in clientList[i]) {
          return clientList[i].focus()
        }
      }
      return clients.openWindow(url)
    })
  )
})
