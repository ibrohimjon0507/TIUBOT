import { webhookCallback } from "grammy";
import { getBot } from "@/bot/instance";

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
    console.error("[webhook] xato:", error);
    return new Response("OK", { status: 200 }); // Telegram qayta yubormasligi uchun
  }
}

export async function GET() {
  return Response.json({ ok: true, service: "TIU bot webhook" });
}
