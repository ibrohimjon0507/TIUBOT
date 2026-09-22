"use client";

import { useCallback, useEffect, useState } from "react";

type WebApp = {
  initData: string;
  ready: () => void;
  expand: () => void;
  colorScheme?: string;
};

declare global {
  interface Window {
    Telegram?: { WebApp?: WebApp };
  }
}

const SDK_URL = "https://telegram.org/js/telegram-web-app.js";

/** Telegram SDK'sini yuklaydi (allaqachon yuklangan bo'lsa — darhol qaytaradi) */
function loadTelegramSdk(): Promise<WebApp | null> {
  return new Promise((resolve) => {
    if (window.Telegram?.WebApp) return resolve(window.Telegram.WebApp);

    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SDK_URL}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(window.Telegram?.WebApp ?? null));
      existing.addEventListener("error", () => resolve(null));
      return;
    }

    const script = document.createElement("script");
    script.src = SDK_URL;
    script.async = true;
    script.onload = () => resolve(window.Telegram?.WebApp ?? null);
    script.onerror = () => resolve(null);
    document.head.appendChild(script);
  });
}

export function TelegramAuth() {
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(true);

  const authenticate = useCallback(async () => {
    setBusy(true);
    setError(null);

    const webApp = await loadTelegramSdk();

    if (!webApp) {
      setError(
        "Telegram kutubxonasi yuklanmadi. Internet aloqasini tekshirib, qayta urinib ko'ring.",
      );
      setBusy(false);
      return;
    }

    webApp.ready();
    webApp.expand();

    if (!webApp.initData) {
      setError(
        "Bu sahifa faqat Telegram ichida ochiladi.\n\nBotda /admin buyrug'ini yuboring va «🖥 Admin panelni ochish» tugmasini bosing.",
      );
      setBusy(false);
      return;
    }

    try {
      const res = await fetch("/api/tg-auth", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ initData: webApp.initData }),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.ok) {
        window.location.replace("/");
        return;
      }
      setError(data.error ?? "Kirishda xatolik yuz berdi.");
    } catch {
      setError("Tarmoq xatosi. Qayta urinib ko'ring.");
    }
    setBusy(false);
  }, []);

  useEffect(() => {
    void authenticate();
  }, [authenticate]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-navy-900 px-6 text-center">
      <div className="max-w-sm">
        <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-400 text-2xl font-bold text-navy-950">
          T
        </span>

        {busy ? (
          <>
            <h1 className="text-[17px] font-semibold text-white">Tekshirilmoqda…</h1>
            <p className="mt-2 text-[14px] text-navy-300">
              Telegram ma'lumotlaringiz tasdiqlanmoqda.
            </p>
            <div className="mx-auto mt-5 h-1 w-32 overflow-hidden rounded-full bg-white/15">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-gold-400" />
            </div>
          </>
        ) : (
          <>
            <h1 className="text-[17px] font-semibold text-white">Kirib bo'lmadi</h1>
            <p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed text-navy-200">
              {error}
            </p>
            <button
              type="button"
              onClick={() => void authenticate()}
              className="mt-5 rounded-lg bg-gold-400 px-5 py-2.5 text-[14px] font-medium text-navy-950"
            >
              Qayta urinish
            </button>
          </>
        )}
      </div>
    </main>
  );
}
