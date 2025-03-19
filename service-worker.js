const CACHE_VERSION = '__CACHE_VERSION__'; // 🚀 O GitHub Actions irá substituir esta linha
const CACHE_NAME = `my-site-cache-${CACHE_VERSION}`;

const CACHE_FILES = [
    '/',
    'index.html',
    'image.png',
    'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.4/xlsx.full.min.js',
    'https://unpkg.com/html5-qrcode',
];

// 🛠️ **Instalação do Service Worker**
self.addEventListener('install', (event) => {
    console.log(`Service Worker: Instalando versão ${CACHE_NAME}`);

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log("Service Worker: Adicionando arquivos ao cache...");
                return cache.addAll(CACHE_FILES);
            })
            .catch((err) => console.error("Erro ao adicionar arquivos ao cache:", err))
    );

    self.skipWaiting(); // Ativa imediatamente a nova versão do Service Worker
});

// 🛠️ **Ativação do Service Worker**
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

    self.clients.claim(); // Assume controle imediato das abas abertas
});

// 🛠️ **Interceptação de Requisições**
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                return cachedResponse; // Retorna do cache se disponível
            }

            return fetch(event.request)
                .then((networkResponse) => {
                    if (!networkResponse || networkResponse.status !== 200) {
                        return networkResponse;
                    }

                    // Atualiza apenas requisições do mesmo domínio
                    if (event.request.url.startsWith(self.location.origin)) {
                        caches.open(CACHE_NAME).then((cache) => {
                            cache.put(event.request, networkResponse.clone());
                            console.log(`Service Worker: Atualizando cache para ${event.request.url}`);
                        });
                    }

                    return networkResponse;
                })
                .catch(() => caches.match('index.html')); // Se offline, retorna index.html
        })
    );
});

// 🛠️ **Forçar Atualização do Service Worker**
self.addEventListener('message', (event) => {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});
