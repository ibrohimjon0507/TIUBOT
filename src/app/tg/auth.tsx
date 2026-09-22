"use client";

import { useEffect, useState } from "react";

declare global {
  interface Window {
    Telegram?: {
      WebApp?: {
        initData: string;
        ready: () => void;
        expand: () => void;
        colorScheme?: string;
      };
    };
  }
}

export function TelegramAuth() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const webApp = window.Telegram?.WebApp;
    webApp?.ready();
    webApp?.expand();

    const initData = webApp?.initData;
    if (!initData) {
      setError(
        "Bu sahifa faqat Telegram ichida ochiladi. Botda /admin buyrug'ini yuboring va «Admin panelni ochish» tugmasini bosing.",
      );
      return;
    }

    fetch("/api/tg-auth", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ initData }),
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.ok) {
          window.location.replace("/");
        } else {
          setError(data.error ?? "Kirishda xatolik yuz berdi.");
        }
      })
      .catch(() => setError("Tarmoq xatosi. Qayta urinib ko'ring."));
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center bg-navy-900 px-6 text-center">
      <div className="max-w-sm">
        <span className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-400 text-2xl font-bold text-navy-950">
          T
        </span>

        {error ? (
          <>
            <h1 className="text-[17px] font-semibold text-white">Kirib bo'lmadi</h1>
            <p className="mt-2 text-[14px] leading-relaxed text-navy-200">{error}</p>
          </>
        ) : (
          <>
            <h1 className="text-[17px] font-semibold text-white">Tekshirilmoqda…</h1>
            <p className="mt-2 text-[14px] text-navy-300">
              Telegram ma'lumotlaringiz tasdiqlanmoqda.
            </p>
            <div className="mx-auto mt-5 h-1 w-32 overflow-hidden rounded-full bg-white/15">
              <div className="h-full w-1/2 animate-pulse rounded-full bg-gold-400" />
            </div>
          </>
        )}
      </div>
    </main>
  );
}
