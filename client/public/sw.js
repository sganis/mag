// version = 1.0.36 // modified by deploy.py.
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
  // event.waitUntil((async () => {
  //   //const cache = await caches.open(cacheName);
  //   // cache.addAll([
  //   //   '/',
  //   //   '/index.html',
  //   //   '/assets/bootstrap-icons.woff2',
  //   //   '/assets/bootstrap-icons.woff',
  //   //   '/assets/index.css',
  //   //   '/assets/index.js',
  //   // ]);
  // })());
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
  // Optional: Get a list of all the current open windows/tabs under
  // our service worker's control, and force them to reload.
  // This can "unbreak" any open windows/tabs as soon as the new
  // service worker activates, rather than users having to manually reload.
  self.clients.matchAll({
    type: 'window'
  }).then(windowClients => {
    console.log('sw reloading all windows...');
    windowClients.forEach((windowClient) => {
      windowClient.navigate(windowClient.url);
    });
  });
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
          console.log('cached: ', url.pathname);
          return cachedResponse;
        } else {
          console.log('fetch: ', url.pathname);
          return fetchResponse;
        }
    } catch (error) {
        console.log('Fetch failed: ', error);
        const cachedResponse = await cache.match('/index.html');
        return cachedResponse;
    }
  })());
});
