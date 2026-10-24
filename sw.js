/**
 * SERENOA - Service Worker v4.0 (GitHub Pages & Navegación Offline)
 * Estrategia Network-First para activos de código (HTML, CSS, JS) para reflejar cambios inmediatamente.
 * Estrategia Cache-First / Stale-While-Revalidate para imágenes y tipografías.
 */

const CACHE_NAME = 'serenoa-v4.0';

const STATIC_ASSETS = [
    './',
    './index.html',
    './frontend/css/styles.css?v=3.0',
    './frontend/js/app.js?v=3.0',
    './frontend/img/hero-dessert.png',
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,400&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap'
];

// 1. Instalación inmediata del Service Worker
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS).catch((err) => {
                console.warn('[SW] Aviso precacheando:', err);
            });
        })
    );
});

// 2. Activación y purga agresiva de todas las cachés anteriores
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        console.log('[SW] Purgando caché obsoleta:', key);
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. Estrategia inteligente de entrega
self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = request.url;

    // No interceptar peticiones al backend API
    if (url.includes('/api/')) {
        return;
    }

    const isCodeAsset = request.destination === 'document' || 
                        request.destination === 'script' || 
                        request.destination === 'style' ||
                        url.endsWith('.html') ||
                        url.includes('.js') ||
                        url.includes('.css');

    // Para código (HTML, CSS, JS): Network-First (Obtener la versión más fresca de GitHub)
    if (isCodeAsset) {
        event.respondWith(
            fetch(request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const clone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                }
                return networkResponse;
            }).catch(() => {
                return caches.match(request);
            })
        );
        return;
    }

    // Para activos pesados (Imágenes, Fuentes): Stale-While-Revalidate
    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            const fetchPromise = fetch(request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const clone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
                }
                return networkResponse;
            }).catch(() => cachedResponse);

            return cachedResponse || fetchPromise;
        })
    );
});
