const CACHE_NAME = 'my-site-cache-v33'; // Mude a versão para forçar atualização

// Função para adicionar um arquivo ao cache
const addToCache = async (cacheName, file) => {
    try {
        const cache = await caches.open(cacheName);
        await cache.add(file);
    } catch (err) {
        console.error(`Erro ao adicionar ${file} ao cache:`, err);
    }
};

// Instalação do Service Worker
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll([
                    '/',
                    'index.html',
                    'image.png',
                    'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.4/xlsx.full.min.js',
                    'https://unpkg.com/html5-qrcode',
                ]).catch((err) => console.error("Erro ao adicionar arquivos ao cache", err));
            })
    );
});

// Intercepta as requisições e serve do cache (fallback para rede)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request).catch(() => {
                console.warn("Falha ao buscar recurso:", event.request.url);
            });
        })
    );
});

// Recebe mensagens para adicionar arquivos ao cache dinamicamente
self.addEventListener('message', (event) => {
    if (event.data.action === 'addToCache' && event.data.file) {
        addToCache(CACHE_NAME, event.data.file);
    }
});

// Atualiza o cache e remove versões antigas
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log("Removendo cache antigo:", cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});
