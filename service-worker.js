const CACHE_NAME = 
    'romaneio-cache-v5';

const FILES_TO_CACHE = [
    'index.html',
    'romaneio_spool.html',
    'romaneio_suporte.html',
    'logo_palmont.png',
    'image.png',
    'Spools.xlsx',
    'Suportes.xlsx',
    'service-worker.js',
    'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.4/xlsx.full.min.js',
    'https://unpkg.com/html5-qrcode'
];

self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        }).catch(() => {
            return caches.match('index.html');
        })
    );
});

self.addEventListener('activate', (event) => {
    clients.claim();
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});
