const CACHE_NAME = 'plantae-v1'
const DYNAMIC_CACHE_NAME = 'plantae-dynamic-v1'

// Install event - cache core assets if known, otherwise just activate
self.addEventListener('install', (event) => {
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
  return self.clients.claim()
})

// Fetch event - Network First for API, Cache First for assets, Stale-While-Revalidate for others
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // API Calls - Network First
  if (
    url.pathname.includes('/rest/v1/') ||
    url.pathname.includes('/functions/v1/')
  ) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
            cache.put(event.request.url, response.clone())
            return response
          })
        })
        .catch(() => {
          return caches.match(event.request)
        }),
    )
    return
  }

  // Images and Fonts - Cache First
  if (
    event.request.destination === 'image' ||
    event.request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return (
          response ||
          fetch(event.request).then((fetchRes) => {
            return caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
              cache.put(event.request.url, fetchRes.clone())
              return fetchRes
            })
          })
        )
      }),
    )
    return
  }

  // Default - Stale While Revalidate for HTML/JS/CSS
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        caches.open(DYNAMIC_CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone())
        })
        return networkResponse
      })
      return cachedResponse || fetchPromise
    }),
  )
})
