/*
 * 포천중앙침례교회 주일학교 PWA Service Worker
 *
 * 캐싱 전략 (Caching Strategy)
 *  - precache  : 앱 셸 / 매니페스트 / 아이콘 (install 시)
 *  - cache-first        : /_next/static/* (해시된 immutable 정적 자산)
 *  - network-first      : 페이지 HTML 문서 (오프라인 대비 캐시 fallback)
 *  - stale-while-revalidate : 기타 동일 출처 GET
 *  - network-only       : /api/*, supabase 통신, 진도/학생 데이터 (항상 최신)
 */

const CACHE_VERSION = "v1.0.0";
const PRECACHE = `precache-${CACHE_VERSION}`;
const RUNTIME_STATIC = `static-${CACHE_VERSION}`;
const RUNTIME_PAGES = `pages-${CACHE_VERSION}`;
const RUNTIME_OTHER = `other-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  "/",
  "/bible-reading",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
];

const OFFLINE_FALLBACK = "/bible-reading";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) =>
        Promise.all(
          PRECACHE_URLS.map((url) =>
            cache
              .add(new Request(url, { cache: "reload" }))
              .catch(() => undefined),
          ),
        ),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  const allowed = new Set([PRECACHE, RUNTIME_STATIC, RUNTIME_PAGES, RUNTIME_OTHER]);
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => !allowed.has(key)).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

// 페이지에서 강제 업데이트할 때 사용
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

function isApiOrDynamic(url) {
  if (url.pathname.startsWith("/api/")) return true;
  if (url.hostname.endsWith("supabase.co")) return true;
  if (url.hostname.endsWith("supabase.in")) return true;
  return false;
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".jpeg") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".webp") ||
    url.pathname.endsWith(".woff") ||
    url.pathname.endsWith(".woff2") ||
    url.pathname.endsWith(".css")
  );
}

function isHtmlNavigation(request, url) {
  if (request.mode === "navigate") return true;
  const accept = request.headers.get("accept") || "";
  return accept.includes("text/html") && url.origin === self.location.origin;
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.status === 200 && response.type !== "opaque") {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    if (cached) return cached;
    throw err;
  }
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response && response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    const fallback = await caches.match(OFFLINE_FALLBACK);
    if (fallback) return fallback;
    throw err;
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then((response) => {
      if (response && response.status === 200 && response.type !== "opaque") {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => undefined);
  return cached || (await networkPromise) || Response.error();
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  let url;
  try {
    url = new URL(request.url);
  } catch (e) {
    return;
  }

  // 진도/학생/Supabase 등 동적 데이터는 절대 캐싱하지 않음 - 항상 네트워크
  if (isApiOrDynamic(url)) {
    return; // SW 개입 없음 → 브라우저 기본 네트워크 동작
  }

  // 동일 출처가 아니면 (구글 폰트 등) stale-while-revalidate
  if (url.origin !== self.location.origin) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_OTHER));
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, RUNTIME_STATIC));
    return;
  }

  if (isHtmlNavigation(request, url)) {
    event.respondWith(networkFirst(request, RUNTIME_PAGES));
    return;
  }

  event.respondWith(staleWhileRevalidate(request, RUNTIME_OTHER));
});
