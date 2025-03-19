const CACHE_NAME = 'romaneio-cache-v1';

// Função para adicionar um arquivo ao cache
const addToCache = async (cacheName, file) => {
    const cache = await caches.open(cacheName);
    await cache.add(file);
};

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
    );
});

// Intercepta as requisições e serve do cache
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => response || fetch(event.request))
    );
});

// Mensagem para adicionar um novo arquivo ao cache
self.addEventListener('message', (event) => {
    if (event.data.action === 'addToCache') {
        addToCache(CACHE_NAME, event.data.file);
    }
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
        })
    );
});