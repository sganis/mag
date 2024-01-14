// version = 1.0.78 // modified by deploy.py.
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
    await caches.delete(cacheName);
    const cache = await caches.open(cacheName);
    await cache.addAll([
      '/',
      '/index.html',
      // '/assets/bootstrap-icons.woff2',
      // '/assets/bootstrap-icons.woff',
      // '/assets/index.css',
      // '/assets/index.js',
    ]);
    return self.skipWaiting();
  })());
});



self.addEventListener('activate', event => {
  console.log('sw activated, deleting cache...');
  event.waitUntil(
    self.clients.matchAll({
        type: 'window'
      }).then(windowClients => {
        console.log('sw reloading all windows...');
        windowClients.forEach((windowClient) => {
          windowClient.navigate(windowClient.url);
        });
      }));
    //return self.clients.claim();
});

const cachePatterns = ['/','.ico','.png','.js','.css','.woff','manifest.json'];

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

// stale with revalidate strategy
self.addEventListener('fetch', (event) => {
  event.respondWith((async() => {
    const url = new URL(event.request.url);
    const cache = await caches.open(cacheName);
    try {
        const cachedResponse = await cache.match(event.request);
        const fetchResponse = await fetch(event.request);
        if(fetchResponse) {
          if (canBeCached(url))
            await cache.put(event.request, fetchResponse.clone());
        }
        if(cachedResponse) {
          //console.log('cached: ', url.pathname);
          return cachedResponse;
        } else {
          console.log('fetch: ', url.pathname);
          return fetchResponse;
        }
    } catch (error) {
        console.log('Fetch failed: ', error);
        const cachedResponse = await cache.match('/');
        return cachedResponse;
    }
  })());
});

