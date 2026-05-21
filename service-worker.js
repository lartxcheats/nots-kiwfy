const CACHE_NAME = 'kiwufy-notif-v1';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || './')
  );
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || 'Nova notificação Kiwufy!',
    icon: './iconeki.png',
    badge: './iconeki.png',
    vibrate: [200, 100, 200],
    data: data,
    tag: 'kiwufy-' + Date.now(),
    requireInteraction: false
  };
  event.waitUntil(
    self.registration.showNotification(data.title || 'Kiwufy', options)
  );
});
