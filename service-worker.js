const CACHE_NAME = 'romaneio-cache-v8';
const OFFLINE_URL = 'index.html';

const FILES_TO_CACHE = [
    './',
    './index.html',
    './romaneio_spool.html',
    './romaneio_suporte.html',
    './logo_palmont.png',
    './image.png',
    './service-worker.js',
    'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.4/xlsx.full.min.js',
    'https://unpkg.com/html5-qrcode'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[ServiceWorker] Cache aberto');
                return cache.addAll(FILES_TO_CACHE);
            })
            .catch((error) => {
                console.error('[ServiceWorker] Falha ao adicionar ao cache:', error);
            })
    );
});

self.addEventListener('fetch', (event) => {
    if (event.request.mode === 'navigate' || 
        (event.request.method === 'GET' && 
         event.request.headers.get('accept').includes('text/html'))) {
        event.respondWith(
            fetch(event.request)
                .catch(() => {
                    return caches.match(OFFLINE_URL);
                })
        );
    } else {
        event.respondWith(
            caches.match(event.request)
                .then((response) => {
                    return response || fetch(event.request);
                })
                .catch(() => {
                    if (event.request.url.endsWith('.html')) {
                        return caches.match(OFFLINE_URL);
                    }
                })
        );
    }
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log('[ServiceWorker] Removendo cache antigo:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});
