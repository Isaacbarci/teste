const CACHE_NAME = `romaneio-cache-${Date.now()}`; // Nome do cache dinâmico

// Instalação do Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll([
                '/',
                'index.html',
                'image.png',
                'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.4/xlsx.full.min.js',
                'https://unpkg.com/html5-qrcode',
            ]))
            .then(() => self.skipWaiting()) // Força o novo Service Worker a se tornar ativo
    );
});

// Intercepta as requisições e serve do cache
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                // Verifica se há uma nova versão no servidor
                fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.status === 200) {
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, networkResponse.clone());
                        });
                    }
                });
                return cachedResponse;
            }
            return fetch(event.request);
        })
    );
});

// Atualiza o cache quando houver uma nova versão
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache); // Remove caches antigos
                    }
                })
            );
        }).then(() => self.clients.claim()) // Assume o controle de todas as páginas
    );
});