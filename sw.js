/*
 * Service worker: permite abrir el juego sin conexión.
 * IMPORTANTE: cada vez que subas cambios, sube también el número de VERSION
 * para que los móviles descarguen la versión nueva.
 */
const VERSION = 'torrujuegos-v2';
const ARCHIVOS = [
  './', 'index.html', 'privacidad.html', 'manifest.webmanifest', 'css/estilos.css',
  'js/config.js', 'js/base.js', 'js/datos.js', 'js/sync.js', 'js/app.js',
  'js/juegos/peluqueria.js', 'js/juegos/bola.js', 'js/juegos/frutas.js', 'js/juegos/tuercas.js', 'js/juegos/parejas.js', 'js/juegos/misiones.js',
  'iconos/logo.svg', 'iconos/icono-192.png', 'iconos/icono-512.png', 'iconos/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(claves => Promise.all(claves.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});

// Archivos del juego: primero la caché (rápido y sin conexión) y se actualiza en segundo plano.
// Las llamadas a Supabase nunca se guardan en caché.
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.hostname.endsWith('supabase.co')) return;
  e.respondWith(
    caches.open(VERSION).then(async cache => {
      const guardada = await cache.match(e.request);
      const red = fetch(e.request).then(r => { if (r.ok && (url.origin === location.origin || url.hostname.includes('gstatic') || url.hostname.includes('googleapis'))) cache.put(e.request, r.clone()); return r; }).catch(() => guardada);
      return guardada || red;
    })
  );
});
