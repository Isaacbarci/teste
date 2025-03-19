const CACHE_NAME = 'my-site-cache-v1';
const CACHE_FILES = [
    '/',
    'index.html',
    'image.png',
    'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.4/xlsx.full.min.js',
    'https://unpkg.com/html5-qrcode',
];

// Instalação do Service Worker (armazenamento inicial no cache)
self.addEventListener('install', (event) => {
    console.log("Service Worker: Instalando...");
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("Service Worker: Cache inicial adicionado.");
            return cache.addAll(CACHE_FILES);
        }).catch((err) => console.error("Erro ao adicionar arquivos ao cache:", err))
    );
    self.skipWaiting(); // Força ativação imediata do novo SW
});

// Ativação do Service Worker (limpa caches antigos)
self.addEventListener('activate', (event) => {
    console.log("Service Worker: Ativando e limpando caches antigos...");
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log("Service Worker: Removendo cache antigo:", cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim(); // Garante que o novo SW assume o controle imediatamente
});

// Intercepta requisições para garantir que o site funcione offline
self.addEventListener('fetch', (event) => {
    if (event.request.mode === 'navigate') {
        // Sempre buscar a versão mais recente do index.html quando online
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    // Atualiza o cache com a nova versão do HTML
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, response.clone());
                        console.log("Service Worker: index.html atualizado no cache.");
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
            return response || fetch(event.request).catch(() => {
                console.warn("Falha ao buscar recurso e sem cache disponível:", event.request.url);
            });
        })
    );
});

// Adiciona arquivos ao cache dinamicamente
self.addEventListener('message', (event) => {
    if (event.data.action === 'addToCache') {
        caches.open(CACHE_NAME).then((cache) => {
            cache.add(event.data.file)
                .then(() => console.log(`Service Worker: ${event.data.file} adicionado ao cache.`))
                .catch((err) => console.error("Erro ao adicionar ao cache:", err));
        });
    }
});
