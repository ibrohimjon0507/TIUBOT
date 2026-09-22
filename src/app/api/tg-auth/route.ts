import crypto from "node:crypto";
import { prisma } from "@/lib/db";
import { createSession } from "@/lib/auth";
import type { AdminRole } from "@/lib/constants";

export const dynamic = "force-dynamic";

/**
 * Telegram Mini App initData'ni tekshiradi.
 * https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
function verifyInitData(initData: string, botToken: string) {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;

  params.delete("hash");
  const dataCheckString = [...params.entries()]
    .map(([key, value]) => `${key}=${value}`)
    .sort()
    .join("\n");

  const secretKey = crypto.createHmac("sha256", "WebAppData").update(botToken).digest();
  const computed = crypto.createHmac("sha256", secretKey).update(dataCheckString).digest("hex");

  const a = Buffer.from(computed, "hex");
  const b = Buffer.from(hash, "hex");
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  // 24 soatdan eski ma'lumot qabul qilinmaydi
  const authDate = Number(params.get("auth_date") ?? 0);
  if (!authDate || Date.now() / 1000 - authDate > 86_400) return null;

  try {
    const user = JSON.parse(params.get("user") ?? "{}");
    return typeof user?.id === "number" ? String(user.id) : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const botToken = process.env.BOT_TOKEN;
  if (!botToken) {
    return Response.json({ ok: false, error: "BOT_TOKEN sozlanmagan." }, { status: 500 });
  }

  let initData = "";
  try {
    const body = await request.json();
    initData = typeof body?.initData === "string" ? body.initData : "";
  } catch {
    /* noop */
  }

  if (!initData) {
    return Response.json({ ok: false, error: "initData topilmadi." }, { status: 400 });
  }

  const telegramId = verifyInitData(initData, botToken);
  if (!telegramId) {
    return Response.json(
      { ok: false, error: "Telegram ma'lumotlari tasdiqlanmadi." },
      { status: 401 },
    );
  }

  const admin = await prisma.adminUser.findFirst({ where: { telegramId, isActive: true } });
  if (!admin) {
    return Response.json(
      {
        ok: false,
        error:
          "Bu Telegram akkaunt admin panelga ulanmagan. Botda /admin buyrug'i orqali ulaning.",
      },
      { status: 403 },
    );
  }

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
  });

  await createSession({
    id: admin.id,
    email: admin.email,
    fullName: admin.fullName,
    role: admin.role as AdminRole,
  });

  return Response.json({ ok: true });
}
