/**
 * TIU admin paneli — Service Worker
 *
 * Maqsad: sayt qobig'i (statik fayllar) qurilmaga yuklab olinadi va keyingi
 * ochilishlarda tarmoqni kutmasdan darhol ishlaydi. Ma'lumotlar esa har doim
 * serverdan olinadi — shuning uchun biz funksiya qo'shsak yoki olib tashlasak,
 * foydalanuvchida ham darhol o'zgaradi.
 *
 * Strategiyalar:
 *   /_next/static/*  → cache-first (fayl nomida hash bor, hech qachon eskirmaydi)
 *   shriftlar, ikonka → stale-while-revalidate
 *   sahifalar (HTML)  → network-first, tarmoq yo'q bo'lsa offline sahifa
 *   /api/*            → hech qachon keshlanmaydi
 *
 * Maxfiylik: admin sahifalarining HTML javoblari keshga yozilmaydi —
 * umumiy qurilmada boshqa odam ko'rib qolmasligi uchun.
 */

const VERSION = "v2";
const STATIC_CACHE = `tiu-static-${VERSION}`;
const ASSET_CACHE = `tiu-assets-${VERSION}`;
const OFFLINE_URL = "/offline";

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(STATIC_CACHE);
      await cache.addAll([OFFLINE_URL, "/icon.svg", "/manifest.webmanifest"]).catch(() => {});
      // Yangi versiya kutib turmasin — darhol ishga tushsin
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      // Eski versiyalarning keshini tozalaymiz
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key.startsWith("tiu-") && !key.endsWith(VERSION))
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

/** Sahifa "yangilan" desa — kutmasdan almashamiz */
self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname === "/icon.svg" ||
    url.pathname === "/manifest.webmanifest"
  );
}

function isFontOrImage(url) {
  return (
    url.hostname === "fonts.gstatic.com" ||
    url.hostname === "fonts.googleapis.com" ||
    /\.(woff2?|png|jpe?g|svg|webp|ico)$/i.test(url.pathname)
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Faqat GET keshlanadi; POST/server action'lar tegilmaydi
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // API, webhook va Telegram autentifikatsiyasi — hech qachon keshdan emas
  if (url.pathname.startsWith("/api/")) return;

  // Statik fayllar: hash'langan, xavfsiz — cache-first
  if (url.origin === self.location.origin && isStaticAsset(url)) {
    event.respondWith(cacheFirst(request, ASSET_CACHE));
    return;
  }

  // Shriftlar va rasmlar — keshdan darhol, fonda yangilanadi
  if (isFontOrImage(url)) {
    event.respondWith(staleWhileRevalidate(request, ASSET_CACHE));
    return;
  }

  // Sahifalar — avval tarmoq (ma'lumot doim yangi), bo'lmasa offline sahifa
  if (request.mode === "navigate") {
    event.respondWith(networkFirstPage(request));
  }
});

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) return hit;

  const response = await fetch(request);
  if (response.ok) cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);

  const network = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => hit);

  return hit ?? network;
}

async function networkFirstPage(request) {
  try {
    return await fetch(request);
  } catch {
    const cache = await caches.open(STATIC_CACHE);
    return (await cache.match(OFFLINE_URL)) ?? Response.error();
  }
}
