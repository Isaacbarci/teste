const CACHE_NAME = 'romaneio-cache-v1';

async function checkVersionUpdate() {
    try {
        const response = await fetch('/version.txt');
        const serverVersion = await response.text();

        const cache = await caches.open(CACHE_NAME);
        const cachedVersion = await cache.match('/version.txt');

        if (!cachedVersion || (await cachedVersion.text()) !== serverVersion) {
            console.log('Nova versão detectada! Limpando cache...');
            await caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key))));
            await cache.put('/version.txt', new Response(serverVersion));
            location.reload(); // Recarrega a página
        }
    } catch (error) {
        console.error('Erro ao verificar versão:', error);
    }
}

// Checa a cada 60 segundos
setInterval(checkVersionUpdate, 60000);

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll([
            '/',
            'index.html',
            'image.png',
            'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.17.4/xlsx.full.min.js',
            'https://unpkg.com/html5-qrcode',
            '/version.txt' // Garante que o arquivo é armazenado no cache
        ]))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            return cachedResponse || fetch(event.request);
        })
    );
});