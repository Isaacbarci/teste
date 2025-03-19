const CACHE_VERSION = 'v1742385854'; // Atualize apenas quando necessário
const CACHE_NAME = `my-site-cache-${CACHE_VERSION}`;

const CACHE_FILES = [
    '/',
    'index.html',
    'image.png',
    'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.4/xlsx.full.min.js',
    'https://unpkg.com/html5-qrcode',
];

// 🛠️ **Instalação do Service Worker (Armazenamento Inicial)**
self.addEventListener('install', (event) => {
    console.log("Service Worker: Instalando versão", CACHE_VERSION);

    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("Service Worker: Adicionando arquivos ao cache...");
            return cache.addAll(CACHE_FILES);
        }).catch((err) => console.error("Erro ao adicionar arquivos ao cache:", err))
    );

    self.skipWaiting(); // Ativa o novo SW imediatamente
});

// 🛠️ **Ativação do Service Worker (Remove Caches Antigos)**
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

    self.clients.claim(); // Assume o controle imediato das abas abertas
});

// 🛠️ **Interceptação de Requisições (Offline First)**
self.addEventListener('fetch', (event) => {
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    return caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, response.clone());
                        console.log("Service Worker: index.html atualizado no cache.");
                        return response;
                    });
                })
                .catch(() => caches.match('index.html')) // Se offline, retorna do cache
        );
        return;
    }

    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).catch(() => {
                console.warn("Falha ao buscar recurso e sem cache disponível:", event.request.url);
            });
        })
    );
});

// 🛠️ **Adiciona Arquivos ao Cache Dinamicamente**
self.addEventListener('message', (event) => {
    if (event.data.action === 'addToCache') {
        caches.open(CACHE_NAME).then((cache) => {
            cache.add(event.data.file)
                .then(() => console.log(`Service Worker: ${event.data.file} adicionado ao cache.`))
                .catch((err) => console.error("Erro ao adicionar ao cache:", err));
        });
    }
});

// 🛠️ **Forçar Atualização do Service Worker**
self.addEventListener('message', (event) => {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});
