const CACHE_NAME = "criaflix-cache-v1"
const OFFLINE_URL = "/offline.html"

// Arquivos básicos que o app precisa
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/favicon.ico",
  "/apple-touch-icon.png",
]

// ========================
// INSTALL
// ========================
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// ========================
// ACTIVATE
// ========================
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key)
          }
        })
      )
    )
  )
  self.clients.claim()
})

// ========================
// FETCH
// ========================
self.addEventListener("fetch", (event) => {
  const { request } = event

  // Ignora métodos diferentes de GET
  if (request.method !== "GET") return

  // Cache-first para imagens (TMDB, posters, backdrops)
  if (request.destination === "image") {
    event.respondWith(
      caches.match(request).then((cached) => {
        return (
          cached ||
          fetch(request).then((response) => {
            const responseClone = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone)
            })
            return response
          })
        )
      })
    )
    return
  }

  // Network-first para páginas e API
  event.respondWith(
    fetch(request)
      .then((response) => {
        const responseClone = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseClone)
        })
        return response
      })
      .catch(() => caches.match(request) || caches.match(OFFLINE_URL))
  )
})
