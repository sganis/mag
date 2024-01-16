version = '1.0.85' // modified by deploy.py.
const CACHE_NAME = `mag-${version}`;

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
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(['/']);
    return self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  console.log('sw activated');
  event.waitUntil((async () => {
    // delete previous cache
    console.log('deleting cache...')
    await caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    });
    // reload window
    await self.clients.matchAll({
        type: 'window'
      }).then(windowClients => {
        console.log('sw reloading all windows...');
        windowClients.forEach((windowClient) => {
          windowClient.navigate(windowClient.url);
        });
      });
    })());
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
// self.addEventListener('fetch', (event) => {
//   event.respondWith((async() => {
//     const url = new URL(event.request.url);
//     const cache = await caches.open(CACHE_NAME);
//     try {
//         const cachedResponse = await cache.match(event.request);
//         const fetchResponse = await fetch(event.request);
//         if(fetchResponse) {
//           if (canBeCached(url))
//             await cache.put(event.request, fetchResponse.clone());
//         }
//         if(cachedResponse) {
//           //console.log('cached: ', url.pathname);
//           return cachedResponse;
//         } else {
//           console.log('fetch: ', url.pathname);
//           return fetchResponse;
//         }
//     } catch (error) {
//         console.log('Fetch failed: ', error);
//         const cachedResponse = await cache.match('/');
//         return cachedResponse;
//     }
//   })());
// });

// fetch the resource from the network
const fromNetwork = (request, timeout) =>
  new Promise((fulfill, reject) => {
    const timeoutId = setTimeout(reject, timeout);
    fetch(request).then(response => {
      console.log('fetch: ', request.url);
      clearTimeout(timeoutId);
      fulfill(response);
      update(request);
    }, reject);
  });

// fetch the resource from the browser cache
const fromCache = request => {
  console.log('cache: ', request.url);
  return caches
    .open(CACHE_NAME)
    .then(cache =>
      cache
        .match(request)
        .then(response => response || cache.match('/'))
        .catch(err => {
          console.log(err)
        })
    );
}

// cache the current page to make it available for offline
const update = request => 
  caches
    .open(CACHE_NAME)
    .then(cache =>
      fetch(request).then(response => cache.put(request, response))
    ).catch(err => {
      console.log(err)
    });

// general strategy when making a request (eg if online try to fetch it
// from the network with a timeout, if something fails serve from cache)
self.addEventListener('fetch', evt => {
  evt.respondWith(
    fromNetwork(evt.request, 10000).catch(() => fromCache(evt.request))
  );
  evt.waitUntil(update(evt.request));
});