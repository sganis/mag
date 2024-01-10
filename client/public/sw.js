const cacheName = 'mag-1.0';

// self.addEventListener('message', event => {
//   console.log('message:', event.data);
//   if (event.data.action == 'skipWaiting') {
//     console.log('skip waiting');
//     self.skipWaiting();
//   }
// });


self.addEventListener('install', event => {
  console.log('sw installed');
  event.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    cache.addAll(['/','/index.html']);
  })());
  // activate inmediatelly
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  console.log('sw activated, deleting cache...');
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(keys
        .filter(key => key.startsWith(cacheName))
        .map(key => caches.delete(key))
      );
    })
  );
  return clients.claim();
});

const cachePatterns = [
  '/index.html', '/favicon.ico',
  '.png','.js','.css','.woff',
  'manifest.json'
];

const canBeCached = (url) => {
  if (location.origin !== url.origin)
    return false;
  if (url.pathname.includes('/api'))
    return false;
  
  for (let p of cachePatterns)
    //if (new RegExp(p).test(requestURL.pathname)) {
    if (url.pathname.includes(p))
      return true;

  return false;
}

self.addEventListener('fetch', (event) => {
  event.respondWith((async() => {
    const url = new URL(event.request.url);
    const cache = await caches.open(cacheName);
    try {
        const cachedResponse = await cache.match(event.request);
        if(cachedResponse) {
            console.log('cached: ', url.pathname);
            return cachedResponse;
        }
        const fetchResponse = await fetch(event.request);
        if(fetchResponse) {
            console.log('fetch: ', url.pathname);
            if (canBeCached(url))
              await cache.put(event.request, fetchResponse.clone());
            return fetchResponse;
        }
    } catch (error) {
        console.log('Fetch failed: ', error);
        const cachedResponse = await cache.match('/index.html');
        return cachedResponse;
    }
  })());
});
