import { webhookCallback } from "grammy";
import { getBot } from "@/bot/instance";
import { isRetryableDbError } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Telegram webhook endpoint.
 * Webhook'ni o'rnatish: admin panel -> Sozlamalar -> "Webhook o'rnatish"
 * yoki: https://api.telegram.org/bot<TOKEN>/setWebhook?url=<PUBLIC_URL>/api/telegram&secret_token=<SECRET>
 */
export async function POST(request: Request) {
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (secret) {
    const header = request.headers.get("x-telegram-bot-api-secret-token");
    if (header !== secret) {
      return new Response("Unauthorized", { status: 401 });
    }
  }

  try {
    const handle = webhookCallback(getBot(), "std/http");
    return await handle(request);
  } catch (error) {
    // Vaqtinchalik baza xatosi (Neon uyqudan uyg'onmoqda) —
    // 500 qaytaramiz, Telegram yangilanishni qayta yuboradi va xabar yo'qolmaydi.
    if (isRetryableDbError(error)) {
      console.error("[webhook] baza vaqtincha ishlamadi, qayta yuborish so'raladi:", error);
      return new Response("Database temporarily unavailable", { status: 500 });
    }

    // Boshqa xatolarda 200 — aks holda Telegram cheksiz qayta urinadi
    console.error("[webhook] xato:", error);
    return new Response("OK", { status: 200 });
  }
}

export async function GET() {
  return Response.json({ ok: true, service: "TIU bot webhook" });
}
