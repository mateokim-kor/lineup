/* LINE UP 서비스워커 — 오프라인 지원(앱 셸 캐시) */
const CACHE = "lineup-v5";
const CORE = [
  "./", "./index.html", "./manifest.json",
  "./icons/icon-192.png", "./icons/icon-512.png", "./icons/apple-touch-icon-180.png"
];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  e.respondWith(
    caches.match(req).then(hit => hit || fetch(req).then(res => {
      // 폰트·라이브러리(CDN) 포함 런타임 캐시 → 다음부턴 오프라인 OK
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => {
      // 네트워크 실패 시: 페이지 요청이면 캐시된 앱으로
      if (req.mode === "navigate") return caches.match("./index.html");
    }))
  );
});
