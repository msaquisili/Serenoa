/**
 * SERENOA - Service Worker para GitHub Pages & Navegación Offline
 * Acelera la carga del catálogo mediante caché de activos estáticos, fuentes e imágenes.
 */

const CACHE_NAME = 'serenoa-catalog-v2.4';

const STATIC_ASSETS = [
    './',
    './index.html',
    './frontend/css/styles.css',
    './frontend/js/app.js',
    './frontend/js/app.js?v=2.3',
    './frontend/img/hero-dessert.png',
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap'
];

// 1. Instalación del Service Worker y precaché de recursos críticos
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS).catch((err) => {
                console.warn('[SW] Aviso precacheando activos iniciales:', err);
            });
        }).then(() => self.skipWaiting())
    );
});

// 2. Activación y limpieza de cachés antiguas
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. Estrategia de entrega: Stale-While-Revalidate para archivos locales e imágenes
self.addEventListener('fetch', (event) => {
    const request = event.request;

    // No interceptar llamadas a la API backend
    if (request.url.includes('/api/')) {
        return;
    }

    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            const fetchPromise = fetch(request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(() => cachedResponse);

            return cachedResponse || fetchPromise;
        })
    );
});
