const CACHE_VERSION = '1742388701'; // 🚀 GitHub Actions substituirá essa linha
const CACHE_NAME = `my-site-cache-${CACHE_VERSION}`;

const CACHE_FILES = [
    '/',
    'index.html',
    'image.png',
    'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.4/xlsx.full.min.js',
    'https://unpkg.com/html5-qrcode',
    'version.txt' // 🔥 Adicionado para verificar novas versões do cache
];

// 🛠️ **Instalação do Service Worker**
self.addEventListener('install', (event) => {
    console.log(`Service Worker: Instalando versão ${CACHE_NAME}`);

    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("Service Worker: Adicionando arquivos ao cache...");
            return cache.addAll(CACHE_FILES);
        }).catch((err) => console.error("Erro ao adicionar arquivos ao cache:", err))
    );

    self.skipWaiting(); // Ativa imediatamente a nova versão do SW
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
    if (event.request.mode === 'navigate') {
        // ⚡ Sempre buscar a versão mais recente do `index.html`
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

// 🔄 **Verificar mudanças no `version.txt` para forçar atualização**
self.addEventListener('message', async (event) => {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    }

    if (event.data.action === 'checkForUpdate') {
        const response = await fetch('/version.txt');
        const newVersion = await response.text();

        if (newVersion !== CACHE_VERSION) {
            console.log("Service Worker: Nova versão detectada. Atualizando...");
            self.skipWaiting();
        }
    }
});
