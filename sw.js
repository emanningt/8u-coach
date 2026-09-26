const CACHE = "8u-coach-v1.1.0";
const CORE = [
  "./",
  "./index.html",
  "./styles.css",
  "./app.js",
  "./data/drills.js",
  "./data/practices.js",
  "./data/rules.js",
  "./data/coaching-cues.js",
  "./manifest.json",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
];
self.addEventListener("install", (event) =>
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(CORE))
      .then(() => self.skipWaiting()),
  ),
);
self.addEventListener("activate", (event) =>
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith("8u-coach-") && k !== CACHE)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  ),
);
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== "GET" || url.origin !== self.location.origin)
    return;
  event.respondWith(
    caches.match(event.request).then(
      (cached) =>
        cached ||
        fetch(event.request).catch(async () => {
          if (event.request.mode === "navigate")
            return (
              (await caches.match(
                new URL("./index.html", self.location.href),
              )) || Response.error()
            );
          return Response.error();
        }),
    ),
  );
});
self.addEventListener("message", (event) => {
  if (event.data === "CHECK_CACHE")
    event.waitUntil(
      caches.open(CACHE).then(async (cache) => {
        const all = await Promise.all(
          CORE.map((path) => cache.match(new URL(path, self.location.href))),
        );
        if (all.every(Boolean)) event.ports[0]?.postMessage("CACHE_READY");
      }),
    );
});
