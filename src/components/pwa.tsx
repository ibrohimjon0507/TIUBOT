"use client";

import { useEffect } from "react";

/**
 * Service Worker'ni ro'yxatdan o'tkazadi va yangilanishlarni kuzatadi.
 *
 * Foydalanuvchi hech narsa qilmaydi: sayt birinchi ochilishda qurilmaga
 * yuklab olinadi, biz yangi versiya chiqarsak — u sezdirmasdan almashadi.
 */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    // Telegram Mini App ichida keshlash shart emas — sessiya qisqa
    if (window.location.pathname.startsWith("/tg")) return;

    let registration: ServiceWorkerRegistration | undefined;
    let refreshing = false;

    const register = async () => {
      try {
        registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
          // Brauzer sw.js ni keshdan emas, har safar serverdan tekshirsin
          updateViaCache: "none",
        });

        // Yangi versiya topilsa — darhol o'rnatishni so'raymiz
        registration.addEventListener("updatefound", () => {
          const installing = registration?.installing;
          installing?.addEventListener("statechange", () => {
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              installing.postMessage("SKIP_WAITING");
            }
          });
        });
      } catch {
        /* SW ishlamasa sayt odatdagidek ishlayveradi */
      }
    };

    // Yangi Service Worker boshqaruvni olsa — sahifani jimgina yangilaymiz
    const onControllerChange = () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    // Sahifaga qaytganda va har soatda yangilanishni tekshiramiz
    const checkForUpdate = () => {
      if (document.visibilityState === "visible") void registration?.update();
    };
    document.addEventListener("visibilitychange", checkForUpdate);
    const timer = window.setInterval(checkForUpdate, 60 * 60 * 1000);

    void register();

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
      document.removeEventListener("visibilitychange", checkForUpdate);
      window.clearInterval(timer);
    };
  }, []);

  return null;
}
