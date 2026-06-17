const CACHE = 'habitoapp-v12';
const ARCHIVOS = ['/', '/index.html', '/manifest.json'];

// Instalar y cachear archivos estáticos
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)));
  self.skipWaiting();
});

// Borrar cachés antiguas al activar
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Servir desde caché (solo archivos estáticos, no la API)
self.addEventListener('fetch', e => {
  if (e.request.url.includes('/habitos')) return;
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});

// Recibir mensaje de la app para mostrar notificación con botones
self.addEventListener('message', e => {
  if (e.data.type === 'MOSTRAR_NOTIFICACION') {
    self.registration.showNotification('⚡ Recordatorio de hábito', {
      body: `¡Es hora de: ${e.data.nombre}!`,
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      tag: e.data.habitoId,
      requireInteraction: true,
      actions: [
        { action: 'aceptar',  title: '✅ Aceptar'  },
        { action: 'rechazar', title: '❌ Rechazar' }
      ],
      data: { habitoId: e.data.habitoId }
    });
  }
});

// Manejar clic en los botones de la notificación del sistema
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const habitoId = e.notification.data && e.notification.data.habitoId;
  if (!habitoId) return;

  const estado = e.action === 'aceptar' ? 'En progreso' : 'No completado';

  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      if (clients.length > 0) {
        clients[0].postMessage({ type: 'CAMBIAR_ESTADO', habitoId, estado });
        clients[0].focus();
      }
    })
  );
});