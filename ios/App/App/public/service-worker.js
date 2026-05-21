const CACHE_NAME = 'comprovantes-v1';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './script.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => response || fetch(event.request))
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
    body: data.body || 'Novo comprovante recebido!',
    icon: './mercado.jfif',
    badge: './mercado.jfif',
    vibrate: [200, 100, 200],
    data: data,
    tag: 'mercadopago-' + Date.now(),
    requireInteraction: false
  };

  event.waitUntil(
    self.registration.showNotification(data.title || '', options)
  );
});
