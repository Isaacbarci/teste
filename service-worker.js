const CACHE_NAME = 'my-site-cache-v37';
const CACHE_VERSION = Date.now(); // Sempre muda para forçar atualização

// Instalação do Service Worker
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Força o SW a substituir o antigo imediatamente
    event.waitUntil(
        caches.open(`${CACHE_NAME}-${CACHE_VERSION}`).then((cache) => {
            return cache.addAll([
                '/',
                'index.html?v=' + CACHE_VERSION, // Sempre carregar a versão mais recente
                'image.png',
                'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.4/xlsx.full.min.js',
                'https://unpkg.com/html5-qrcode',
            ]).catch((err) => console.error("Erro ao adicionar arquivos ao cache", err));
        })
    );
});

// Ativação do Service Worker (limpa caches antigos)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (!cache.includes(`${CACHE_NAME}-${CACHE_VERSION}`)) {
                        console.log("Removendo cache antigo:", cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    clients.claim(); // Aplica o novo SW sem precisar recarregar a aba
});

// Intercepta as requisições e sempre busca um HTML novo
self.addEventListener('fetch', (event) => {
    if (event.request.mode === 'navigate') {
        // Sempre busca o index.html atualizado
        event.respondWith(fetch(event.request));
        return;
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});

// Adiciona arquivos ao cache dinamicamente
self.addEventListener('message', (event) => {
    if (event.data.action === 'addToCache') {
        caches.open(`${CACHE_NAME}-${CACHE_VERSION}`).then((cache) => {
            cache.add(event.data.file).catch((err) => console.error("Erro ao adicionar ao cache:", err));
        });
    }
});
