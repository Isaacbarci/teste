const CACHE_NAME = 'my-site-cache-v42';
const CACHE_VERSION = Date.now(); // Sempre muda para forçar atualização

// Lista de arquivos para cache
const CACHE_FILES = [
    '/',
    'index.html',
    'image.png',
    'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.4/xlsx.full.min.js',
    'https://unpkg.com/html5-qrcode',
];

// Instalação do Service Worker (cache inicial)
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Força o SW a substituir o antigo imediatamente
    event.waitUntil(
        caches.open(`${CACHE_NAME}-${CACHE_VERSION}`).then((cache) => {
            return cache.addAll(CACHE_FILES).catch((err) => console.error("Erro ao adicionar arquivos ao cache", err));
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

// Intercepta as requisições
self.addEventListener('fetch', (event) => {
    if (event.request.mode === 'navigate') {
        // Se o usuário estiver offline, servimos o index.html do cache
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Atualiza o cache com a versão mais recente do HTML
                    return caches.open(`${CACHE_NAME}-${CACHE_VERSION}`).then((cache) => {
                        cache.put(event.request, response.clone());
                        return response;
                    });
                })
                .catch(() => caches.match('index.html')) // Se offline, retorna a versão do cache
        );
        return;
    }

    // Para outros arquivos, tenta servir do cache primeiro
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
