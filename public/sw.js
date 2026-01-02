// Minimal Service Worker to enable PWA installation
self.addEventListener('install', (event) => {
    console.log('SW installed');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('SW activated');
});

self.addEventListener('fetch', (event) => {
    // Required for PWA installation criteria
    // We can add caching logic here later if needed
});
