const CACHE_PREFIX = `brebeuf-park-${self.registration.scope}-`;
const CACHE_NAME = `${CACHE_PREFIX}v3`;
const ASSETS = ["./", "./index.html", "./style.css?v=3", "./app.js?v=3", "./manifest.json", "./apple-touch-icon.png", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(async keys => {
    const upgradingLegacyApp = keys.includes("brebeuf-park-v1");
    await Promise.all(keys.filter(key => (key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME) || key === "brebeuf-park-v1").map(key => caches.delete(key)));
    await self.clients.claim();
    // The original app had no controllerchange listener to refresh its stale UI.
    if (upgradingLegacyApp) {
      const windows = await self.clients.matchAll({ type: "window" });
      await Promise.all(windows.filter(client => client.url.startsWith(self.registration.scope)).map(client => client.navigate(client.url)));
    }
  }));
});

self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || !url.href.startsWith(self.registration.scope)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    try {
      const response = await fetch(event.request, { cache: "no-cache" });
      if (response.ok) event.waitUntil(cache.put(event.request, response.clone()));
      return response;
    } catch {
      const cached = await cache.match(event.request);
      if (cached) return cached;
      if (event.request.mode === "navigate") return cache.match("./index.html");
      return Response.error();
    }
  })());
});
