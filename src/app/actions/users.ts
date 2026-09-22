"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { createBot } from "@/bot/bot";
import { recordOutgoing } from "@/bot/staff-chat";
import { escapeHtml } from "@/bot/views";
import { getTranslator } from "@/lib/i18n";
import type { Lang } from "@/lib/constants";

export type FormState = { error?: string; ok?: string };

function str(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

// ── Bot foydalanuvchilari ─────────────────────────────────

export async function toggleBlockAction(form: FormData) {
  await requireSession();
  const id = String(form.get("id") ?? "");
  if (!id) return;

  const user = await prisma.botUser.findUnique({ where: { id } });
  if (!user) return;

  await prisma.botUser.update({
    where: { id },
    data: { isBlocked: !user.isBlocked, failedAttempts: 0 },
  });
  revalidatePath("/bot-users");
}

export async function resetVerificationAction(form: FormData) {
  await requireSession();
  const id = String(form.get("id") ?? "");
  if (!id) return;

  await prisma.botUser.update({
    where: { id },
    data: { isVerified: false, studentId: null, step: "PASSPORT", failedAttempts: 0 },
  });
  revalidatePath("/bot-users");
}

// ── Murojaatlar ───────────────────────────────────────────

export async function updateTicketAction(form: FormData) {
  await requireSession();
  const id = String(form.get("id") ?? "");
  const status = String(form.get("status") ?? "NEW");
  const adminNote = String(form.get("adminNote") ?? "").trim();
  if (!id) return;

  await prisma.supportTicket.update({
    where: { id },
    data: { status, adminNote: adminNote || null },
  });
  revalidatePath("/tickets");
  revalidatePath("/");
}

/** Murojaat egasiga botdan javob yuborish */
export async function replyTicketAction(
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  await requireSession();

  const id = str(form, "id");
  const message = str(form, "message");
  if (!id || !message) return { error: "Javob matnini kiriting." };

  const ticket = await prisma.supportTicket.findUnique({ where: { id } });
  if (!ticket) return { error: "Murojaat topilmadi." };

  const token = process.env.BOT_TOKEN;
  if (!token) return { error: "BOT_TOKEN sozlanmagan — javob yuborib bo'lmadi." };

  try {
    const bot = createBot(token);
    await bot.api.sendMessage(
      ticket.telegramId,
      `📩 <b>Universitet mas'ul xodimidan javob:</b>\n\n${message}`,
      { parse_mode: "HTML" },
    );
  } catch {
    return { error: "Xabar yuborilmadi. Foydalanuvchi botni bloklagan bo'lishi mumkin." };
  }

  await prisma.supportTicket.update({
    where: { id },
    data: { status: "RESOLVED", adminNote: message },
  });

  revalidatePath("/tickets");
  return { ok: "Javob yuborildi va murojaat yopildi." };
}

// ── Mas'ul xodim yozishmalari ─────────────────────────────

/** Admin paneldan talabaga javob yuborish */
export async function replyStaffMessageAction(
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  const session = await requireSession();

  const botUserId = str(form, "botUserId");
  const staffId = str(form, "staffId");
  const text = str(form, "text");

  if (!text) return { error: "Javob matnini kiriting." };

  const botUser = await prisma.botUser.findUnique({ where: { id: botUserId } });
  if (!botUser) return { error: "Foydalanuvchi topilmadi." };

  const token = process.env.BOT_TOKEN;
  if (!token) return { error: "BOT_TOKEN sozlanmagan." };

  const staff = staffId ? await prisma.facultyStaff.findUnique({ where: { id: staffId } }) : null;
  const tr = await getTranslator((botUser.lang as Lang) ?? "uz");

  try {
    const bot = createBot(token);
    await bot.api.sendMessage(
      botUser.telegramId,
      tr.t("staff_reply", {
        staff: escapeHtml(staff?.fullName ?? "Universitet mas'uli"),
        text: escapeHtml(text),
      }),
      { parse_mode: "HTML" },
    );
  } catch {
    return { error: "Xabar yuborilmadi. Foydalanuvchi botni bloklagan bo'lishi mumkin." };
  }

  await recordOutgoing({
    staffId: staff?.id ?? null,
    botUserId: botUser.id,
    studentId: botUser.studentId,
    text,
    replierName: session.fullName,
  });

  await prisma.staffMessage.updateMany({
    where: { botUserId: botUser.id, staffId: staff?.id ?? undefined, direction: "IN" },
    data: { isRead: true },
  });

  revalidatePath("/messages");
  revalidatePath("/");
  return { ok: "Javob yuborildi." };
}

export async function markMessagesReadAction(form: FormData) {
  await requireSession();
  const botUserId = String(form.get("botUserId") ?? "");
  if (!botUserId) return;

  await prisma.staffMessage.updateMany({
    where: { botUserId, direction: "IN" },
    data: { isRead: true },
  });
  revalidatePath("/messages");
}

// ── Ommaviy xabar ─────────────────────────────────────────

export async function sendBroadcastAction(
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  const session = await requireSession();

  const textUz = str(form, "textUz");
  if (!textUz) return { error: "Xabar matnini (o'zbekcha) kiriting." };

  const textRu = str(form, "textRu") || textUz;
  const textEn = str(form, "textEn") || textUz;
  const target = str(form, "target") || "ALL";
  const targetValue = str(form, "targetValue");

  const token = process.env.BOT_TOKEN;
  if (!token) return { error: "BOT_TOKEN sozlanmagan." };

  // Qabul qiluvchilarni aniqlash
  const where: Record<string, unknown> = { isBlocked: false };
  if (target === "VERIFIED") where.isVerified = true;
  if (target === "UNVERIFIED") where.isVerified = false;
  if (target === "FACULTY" && targetValue) where.student = { facultyId: targetValue };
  if (target === "COURSE" && targetValue) where.student = { course: Number(targetValue) };
  if (target === "GROUP" && targetValue) where.student = { groupName: targetValue };
  if (target === "STATUS" && targetValue) where.student = { status: targetValue };

  const recipients = await prisma.botUser.findMany({
    where,
    select: { telegramId: true, lang: true },
  });

  if (recipients.length === 0) {
    return { error: "Tanlangan shart bo'yicha qabul qiluvchi topilmadi." };
  }

  const broadcast = await prisma.broadcast.create({
    data: {
      textUz,
      textRu,
      textEn,
      target,
      targetValue: targetValue || null,
      status: "SENDING",
      totalCount: recipients.length,
      createdBy: session.email,
      startedAt: new Date(),
    },
  });

  const bot = createBot(token);
  const texts: Record<Lang, string> = { uz: textUz, ru: textRu, en: textEn };
  let sent = 0;
  let failed = 0;

  for (const user of recipients) {
    try {
      await bot.api.sendMessage(user.telegramId, texts[user.lang as Lang] ?? textUz, {
        parse_mode: "HTML",
      });
      sent += 1;
    } catch {
      failed += 1;
    }
    // Telegram cheklovi: sekundiga ~30 xabar
    await new Promise((resolve) => setTimeout(resolve, 40));
  }

  await prisma.broadcast.update({
    where: { id: broadcast.id },
    data: { status: "DONE", sentCount: sent, failCount: failed, finishedAt: new Date() },
  });

  revalidatePath("/broadcast");
  return {
    ok: `Xabar yuborildi: ${sent} ta muvaffaqiyatli${failed > 0 ? `, ${failed} ta xatolik` : ""}.`,
  };
}
