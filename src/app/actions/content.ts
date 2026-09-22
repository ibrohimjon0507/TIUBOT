"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { hashPassword, requireSession, requireSuperAdmin } from "@/lib/auth";
import { invalidateDictionary } from "@/lib/i18n";
import { DEFAULT_TEXTS } from "@/lib/texts";
import { createBot } from "@/bot/bot";
import { BOT_COMMANDS } from "@/bot/instance";

export type FormState = { error?: string; ok?: string };

function str(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

// ── Bot matnlari ──────────────────────────────────────────

export async function saveBotTextAction(
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  await requireSession();

  const key = str(form, "key");
  if (!key) return { error: "Matn kaliti topilmadi." };

  const uz = str(form, "uz");
  if (!uz) return { error: "O'zbekcha matn bo'sh bo'lmasligi kerak." };

  const data = {
    uz,
    ru: str(form, "ru") || uz,
    en: str(form, "en") || uz,
  };

  await prisma.botText.upsert({
    where: { key },
    update: data,
    create: { key, ...data, note: (DEFAULT_TEXTS as Record<string, { note?: string }>)[key]?.note },
  });

  invalidateDictionary();
  revalidatePath("/texts");
  return { ok: "Matn saqlandi. O'zgarish botda 30 soniya ichida kuchga kiradi." };
}

export async function resetBotTextAction(form: FormData) {
  await requireSession();
  const key = String(form.get("key") ?? "");
  const entry = (DEFAULT_TEXTS as Record<string, { uz: string; ru: string; en: string; note: string }>)[key];
  if (!key || !entry) return;

  await prisma.botText.upsert({
    where: { key },
    update: { uz: entry.uz, ru: entry.ru, en: entry.en },
    create: { key, uz: entry.uz, ru: entry.ru, en: entry.en, note: entry.note },
  });

  invalidateDictionary();
  revalidatePath("/texts");
}

// ── Umumiy sozlamalar ─────────────────────────────────────

export async function saveSettingsAction(
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  await requireSession();

  const keys = [
    "university_name",
    "support_phone",
    "support_address",
    "support_telegram",
    "support_working_hours",
    "support_group_id",
  ];

  for (const key of keys) {
    const value = str(form, key);
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }

  invalidateDictionary();
  revalidatePath("/settings");
  return { ok: "Sozlamalar saqlandi." };
}

// ── Admin foydalanuvchilar ────────────────────────────────

export async function createAdminAction(
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  await requireSuperAdmin();

  const email = str(form, "email").toLowerCase();
  const password = str(form, "password");
  const fullName = str(form, "fullName");
  const role = str(form, "role") || "ADMIN";

  if (!email || !password || !fullName) return { error: "Barcha maydonlarni to'ldiring." };
  if (password.length < 8) return { error: "Parol kamida 8 ta belgidan iborat bo'lsin." };

  const exists = await prisma.adminUser.findUnique({ where: { email } });
  if (exists) return { error: "Bu e-mail allaqachon ro'yxatdan o'tgan." };

  await prisma.adminUser.create({
    data: { email, fullName, role, passwordHash: await hashPassword(password) },
  });

  revalidatePath("/settings");
  return { ok: `${fullName} administrator sifatida qo'shildi.` };
}

export async function changePasswordAction(
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  const session = await requireSession();

  const password = str(form, "password");
  const confirm = str(form, "confirm");

  if (password.length < 8) return { error: "Parol kamida 8 ta belgidan iborat bo'lsin." };
  if (password !== confirm) return { error: "Parollar mos kelmadi." };

  await prisma.adminUser.update({
    where: { id: session.id },
    data: { passwordHash: await hashPassword(password) },
  });

  return { ok: "Parolingiz yangilandi." };
}

export async function toggleAdminAction(form: FormData) {
  await requireSuperAdmin();
  const id = String(form.get("id") ?? "");
  if (!id) return;

  const admin = await prisma.adminUser.findUnique({ where: { id } });
  if (!admin) return;

  await prisma.adminUser.update({ where: { id }, data: { isActive: !admin.isActive } });
  revalidatePath("/settings");
}

export async function deleteAdminAction(form: FormData) {
  const session = await requireSuperAdmin();
  const id = String(form.get("id") ?? "");
  if (!id || id === session.id) {
    redirect("/settings?error=" + encodeURIComponent("O'z akkauntingizni o'chira olmaysiz."));
  }

  await prisma.adminUser.delete({ where: { id } });
  revalidatePath("/settings");
  redirect("/settings?ok=admin-deleted");
}

// ── Telegram Mini App ulanishi ────────────────────────────

/** Joriy admin uchun 6 xonali bir martalik ulanish kodi */
export async function generateLinkCodeAction(
  _prev: FormState,
  _form: FormData,
): Promise<FormState> {
  const session = await requireSession();

  const code = String(Math.floor(100_000 + Math.random() * 900_000));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.adminUser.update({
    where: { id: session.id },
    data: { linkCode: code, linkCodeExp: expiresAt },
  });

  revalidatePath("/settings");
  return { ok: `Kod: ${code} — botda /admin yuboring va shu kodni kiriting (10 daqiqa amal qiladi).` };
}

export async function unlinkTelegramAction() {
  const session = await requireSession();
  await prisma.adminUser.update({
    where: { id: session.id },
    data: { telegramId: null, linkCode: null, linkCodeExp: null },
  });
  revalidatePath("/settings");
}

// ── Telegram webhook ──────────────────────────────────────

export async function setWebhookAction(
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  await requireSession();

  const token = process.env.BOT_TOKEN;
  if (!token) return { error: "BOT_TOKEN .env faylida belgilanmagan." };

  const baseUrl = (str(form, "publicUrl") || process.env.PUBLIC_URL || "").replace(/\/$/, "");
  if (!/^https:\/\//i.test(baseUrl)) {
    return { error: "Webhook manzili https:// bilan boshlanishi kerak." };
  }

  try {
    const bot = createBot(token);
    await bot.api.setWebhook(`${baseUrl}/api/telegram`, {
      secret_token: process.env.TELEGRAM_WEBHOOK_SECRET || undefined,
      allowed_updates: ["message", "callback_query"],
    });
    await bot.api.setMyCommands(BOT_COMMANDS);
    const me = await bot.api.getMe();
    return { ok: `Webhook o'rnatildi: @${me.username} → ${baseUrl}/api/telegram` };
  } catch (error) {
    return { error: `Xatolik: ${error instanceof Error ? error.message : "noma'lum"}` };
  }
}

export async function deleteWebhookAction(_prev: FormState): Promise<FormState> {
  await requireSession();
  const token = process.env.BOT_TOKEN;
  if (!token) return { error: "BOT_TOKEN belgilanmagan." };

  try {
    const bot = createBot(token);
    await bot.api.deleteWebhook();
    return { ok: "Webhook o'chirildi. Endi `npm run bot` (polling) orqali ishlatish mumkin." };
  } catch (error) {
    return { error: `Xatolik: ${error instanceof Error ? error.message : "noma'lum"}` };
  }
}
