/* eslint-disable no-undef */

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('push', (event) => {
  const eventData = event.data.json()
  console.log(JSON.stringify(eventData))
  self.registration.showNotification(eventData.title, { body: eventData.body, data: eventData.data })
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const url = event.notification?.data?.url ?? 'https://{{CICADA_WEB_HOST}}/'
  console.log(`Opening ${url}`)
  event.waitUntil(self.clients.openWindow(url))
})
