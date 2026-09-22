import { Bot, Context, GrammyError, HttpError, InlineKeyboard } from "grammy";
import type { BotUser } from "@prisma/client";
import { prisma } from "@/lib/db";
import { getTranslator, type Translator } from "@/lib/i18n";
import {
  LANGS,
  isValidPassport,
  normalizePassport,
  type Lang,
  type StaffRole,
} from "@/lib/constants";
import {
  buttonContent,
  buttonLabel,
  loadMenuButtons,
  matchButton,
  type MenuButtonRow,
} from "@/lib/menu";
import {
  abroadKeyboard,
  backKeyboard,
  faqCategoriesKeyboard,
  faqQuestionsKeyboard,
  homeKeyboard,
  langKeyboard,
  mainReplyKeyboard,
  notFoundKeyboard,
  removeKeyboard,
  staffCardKeyboard,
  staffListKeyboard,
  staffRolesKeyboard,
} from "./keyboards";
import { escapeHtml, facultyName, renderFaq, renderProgram, renderStaff, renderStatus } from "./views";
import { recordOutgoing, sendMessageToStaff } from "./staff-chat";

export type TiuContext = Context & {
  botUser: BotUser;
  tr: Translator;
};

const MAX_FAILED_ATTEMPTS = 8;

// ─────────────────────────────────────────────────────────────
// Yordamchilar
// ─────────────────────────────────────────────────────────────

async function log(botUserId: string | null, action: string, payload?: string) {
  try {
    await prisma.activityLog.create({ data: { botUserId, action, payload } });
  } catch {
    /* log yozilmasa — jarayon to'xtamasin */
  }
}

/** Xabarni tahrirlaydi; imkoni bo'lmasa yangi xabar yuboradi. */
async function show(ctx: TiuContext, text: string, keyboard?: InlineKeyboard) {
  const options = {
    parse_mode: "HTML" as const,
    reply_markup: keyboard,
    link_preview_options: { is_disabled: true },
  };
  if (ctx.callbackQuery?.message) {
    try {
      await ctx.editMessageText(text, options);
      return;
    } catch (error) {
      const description = error instanceof GrammyError ? error.description : "";
      if (description.includes("message is not modified")) return;
    }
  }
  await ctx.reply(text, options);
}

async function loadStudent(botUser: BotUser) {
  if (!botUser.studentId) return null;
  return prisma.student.findFirst({
    where: { id: botUser.studentId, isActive: true },
    include: { faculty: true },
  });
}

/** Asosiy menyu + pastki klaviatura */
async function showMainMenu(ctx: TiuContext) {
  const student = await loadStudent(ctx.botUser);
  if (!student) {
    await prisma.botUser.update({
      where: { id: ctx.botUser.id },
      data: { step: "PASSPORT", isVerified: false, studentId: null },
    });
    await ctx.reply(ctx.tr.t("ask_passport"), {
      parse_mode: "HTML",
      reply_markup: removeKeyboard(),
    });
    return;
  }

  await ctx.reply(
    ctx.tr.t("main_menu", {
      name: escapeHtml(student.fullName),
      faculty: escapeHtml(facultyName(student, ctx.tr.lang)),
      course: student.course,
      group: escapeHtml(student.groupName),
    }),
    {
      parse_mode: "HTML",
      reply_markup: await mainReplyKeyboard(ctx.tr),
      link_preview_options: { is_disabled: true },
    },
  );
}

/** Tasdiqlanganligini tekshiradi; bo'lmasa pasport so'raydi. */
async function ensureVerified(ctx: TiuContext) {
  if (ctx.botUser.isVerified && ctx.botUser.studentId) return true;
  await prisma.botUser.update({
    where: { id: ctx.botUser.id },
    data: { step: "PASSPORT" },
  });
  await show(ctx, ctx.tr.t("ask_passport"));
  return false;
}

// ─────────────────────────────────────────────────────────────
// Menyu bo'limlari (pastki tugma ham, inline callback ham shularni chaqiradi)
// ─────────────────────────────────────────────────────────────

async function sectionStatus(ctx: TiuContext) {
  if (!(await ensureVerified(ctx))) return;
  const student = await loadStudent(ctx.botUser);
  if (!student) return showMainMenu(ctx);

  await log(ctx.botUser.id, "menu:status", student.passportSeries);
  await show(ctx, renderStatus(student, ctx.tr), homeKeyboard(ctx.tr));
}

async function sectionFaq(ctx: TiuContext) {
  if (!(await ensureVerified(ctx))) return;
  await log(ctx.botUser.id, "menu:faq");

  const categories = await prisma.faqCategory.findMany({
    where: { isActive: true, items: { some: { isActive: true } } },
    orderBy: [{ sort: "asc" }, { createdAt: "asc" }],
  });

  if (categories.length === 0) {
    const items = await prisma.faq.findMany({
      where: { isActive: true },
      orderBy: [{ sort: "asc" }, { createdAt: "asc" }],
      take: 30,
    });
    if (items.length === 0) {
      return show(ctx, ctx.tr.t("faq_empty"), homeKeyboard(ctx.tr));
    }
    return show(ctx, ctx.tr.t("faq_title"), faqQuestionsKeyboard(ctx.tr, items, "menu:home"));
  }

  await show(ctx, ctx.tr.t("faq_title"), faqCategoriesKeyboard(ctx.tr, categories));
}

async function sectionAbroad(ctx: TiuContext) {
  if (!(await ensureVerified(ctx))) return;
  await log(ctx.botUser.id, "menu:abroad");

  const programs = await prisma.studyAbroadProgram.findMany({
    where: { isActive: true },
    orderBy: [{ sort: "asc" }, { createdAt: "desc" }],
    take: 30,
  });
  if (programs.length === 0) {
    return show(ctx, ctx.tr.t("abroad_empty"), homeKeyboard(ctx.tr));
  }
  await show(ctx, ctx.tr.t("abroad_title"), abroadKeyboard(ctx.tr, programs));
}

async function sectionContacts(ctx: TiuContext) {
  if (!(await ensureVerified(ctx))) return;
  const student = await loadStudent(ctx.botUser);
  if (!student) return showMainMenu(ctx);

  await log(ctx.botUser.id, "menu:contacts");
  await show(
    ctx,
    ctx.tr.t("contacts_title", { faculty: escapeHtml(facultyName(student, ctx.tr.lang)) }),
    staffRolesKeyboard(ctx.tr),
  );
}

async function sectionLang(ctx: TiuContext) {
  await show(ctx, ctx.tr.t("choose_lang"), langKeyboard(true));
}

async function sectionHelp(ctx: TiuContext) {
  await ctx.reply(ctx.tr.t("help"), {
    parse_mode: "HTML",
    link_preview_options: { is_disabled: true },
  });
}

/** Pastki klaviaturadagi tugma bosilganda */
async function runButton(ctx: TiuContext, button: MenuButtonRow) {
  if (button.type === "BUILTIN") {
    switch (button.action) {
      case "status":
        return sectionStatus(ctx);
      case "faq":
        return sectionFaq(ctx);
      case "abroad":
        return sectionAbroad(ctx);
      case "contacts":
        return sectionContacts(ctx);
      case "lang":
        return sectionLang(ctx);
      case "help":
        return sectionHelp(ctx);
      default:
        return showMainMenu(ctx);
    }
  }

  const content = buttonContent(button, ctx.tr.lang);
  const keyboard =
    button.type === "LINK" && button.url
      ? new InlineKeyboard().url(ctx.tr.t("btn_link"), button.url)
      : undefined;

  await log(ctx.botUser.id, "menu:custom", buttonLabel(button, "uz"));
  await ctx.reply(content || buttonLabel(button, ctx.tr.lang), {
    parse_mode: "HTML",
    reply_markup: keyboard,
    link_preview_options: { is_disabled: true },
  });
}

// ─────────────────────────────────────────────────────────────
// Bot
// ─────────────────────────────────────────────────────────────

export function createBot(token: string) {
  const bot = new Bot<TiuContext>(token);

  // 0. Guruh/kanal xabarlari — mas'ul xodimlarning javoblari
  bot.use(async (ctx, next) => {
    const type = ctx.chat?.type;
    if (type === "group" || type === "supergroup") {
      await handleGroupReply(ctx);
      return; // guruhda oddiy menyu mantig'i ishlamaydi
    }
    if (type && type !== "private") return;
    await next();
  });

  // 1. Foydalanuvchini yuklash / yaratish + tarjimon
  bot.use(async (ctx, next) => {
    const from = ctx.from;
    if (!from || from.is_bot) return;

    const telegramId = String(from.id);
    const profile = {
      username: from.username ?? null,
      firstName: from.first_name ?? null,
      lastName: from.last_name ?? null,
      lastSeenAt: new Date(),
    };

    const botUser = await prisma.botUser.upsert({
      where: { telegramId },
      update: profile,
      create: { telegramId, ...profile, lang: "uz", step: "START" },
    });

    if (botUser.isBlocked) {
      const tr = await getTranslator(botUser.lang as Lang);
      await ctx.reply(tr.t("blocked"), { parse_mode: "HTML" });
      return;
    }

    ctx.botUser = botUser;
    ctx.tr = await getTranslator(botUser.lang as Lang);
    await next();
  });

  // ── Buyruqlar ──
  bot.command("start", async (ctx) => {
    await prisma.botUser.update({
      where: { id: ctx.botUser.id },
      data: { step: "LANG", pendingStaffId: null },
    });
    await log(ctx.botUser.id, "start");
    await ctx.reply(ctx.tr.t("choose_lang"), {
      parse_mode: "HTML",
      reply_markup: langKeyboard(),
    });
  });

  bot.command("lang", async (ctx) => {
    await ctx.reply(ctx.tr.t("choose_lang"), {
      parse_mode: "HTML",
      reply_markup: langKeyboard(true),
    });
  });

  bot.command("menu", async (ctx) => {
    await prisma.botUser.update({
      where: { id: ctx.botUser.id },
      data: { step: ctx.botUser.isVerified ? "MENU" : "PASSPORT", pendingStaffId: null },
    });
    ctx.botUser = { ...ctx.botUser, step: "MENU", pendingStaffId: null };
    if (!ctx.botUser.isVerified || !ctx.botUser.studentId) {
      await ctx.reply(ctx.tr.t("ask_passport"), {
        parse_mode: "HTML",
        reply_markup: removeKeyboard(),
      });
      return;
    }
    await showMainMenu(ctx);
  });

  bot.command("help", (ctx) => sectionHelp(ctx));

  // ── Admin: Telegram Mini App ──
  bot.command("admin", async (ctx) => {
    const admin = await prisma.adminUser.findFirst({
      where: { telegramId: ctx.botUser.telegramId, isActive: true },
    });

    if (!admin) {
      await prisma.botUser.update({
        where: { id: ctx.botUser.id },
        data: { step: "ADMIN_LINK" },
      });
      await ctx.reply(ctx.tr.t("admin_link_ask"), { parse_mode: "HTML" });
      return;
    }

    await sendAdminPanelButton(ctx, admin.fullName);
  });

  // ── Til tanlash ──
  bot.callbackQuery(/^lang:(uz|ru|en)$/, async (ctx) => {
    const lang = ctx.match![1] as Lang;
    if (!LANGS.includes(lang)) return ctx.answerCallbackQuery();

    ctx.botUser = await prisma.botUser.update({
      where: { id: ctx.botUser.id },
      data: { lang, step: ctx.botUser.isVerified ? "MENU" : "PASSPORT" },
    });
    ctx.tr = await getTranslator(lang);
    await ctx.answerCallbackQuery(ctx.tr.t("lang_changed"));
    await log(ctx.botUser.id, "lang_select", lang);

    if (ctx.botUser.isVerified && ctx.botUser.studentId) {
      await showMainMenu(ctx);
    } else {
      await ctx.reply(ctx.tr.t("ask_passport"), {
        parse_mode: "HTML",
        reply_markup: removeKeyboard(),
      });
    }
  });

  bot.callbackQuery("auth:retry", async (ctx) => {
    await prisma.botUser.update({
      where: { id: ctx.botUser.id },
      data: { step: "PASSPORT" },
    });
    await ctx.answerCallbackQuery();
    await show(ctx, ctx.tr.t("ask_passport"));
  });

  // ── Inline menyu callback'lari ──
  bot.callbackQuery("menu:home", async (ctx) => {
    await ctx.answerCallbackQuery();
    await prisma.botUser.update({
      where: { id: ctx.botUser.id },
      data: { step: "MENU", pendingStaffId: null },
    });
    if (!ctx.botUser.isVerified) return ensureVerified(ctx);
    await showMainMenu(ctx);
  });

  bot.callbackQuery("menu:lang", async (ctx) => {
    await ctx.answerCallbackQuery();
    await sectionLang(ctx);
  });

  bot.callbackQuery("menu:status", async (ctx) => {
    await ctx.answerCallbackQuery();
    await sectionStatus(ctx);
  });

  bot.callbackQuery("menu:faq", async (ctx) => {
    await ctx.answerCallbackQuery();
    await sectionFaq(ctx);
  });

  bot.callbackQuery("menu:abroad", async (ctx) => {
    await ctx.answerCallbackQuery();
    await sectionAbroad(ctx);
  });

  bot.callbackQuery("menu:contacts", async (ctx) => {
    await ctx.answerCallbackQuery();
    await sectionContacts(ctx);
  });

  // ── Savol-javoblar ──
  bot.callbackQuery(/^faq:cat:(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const categoryId = ctx.match![1];
    const items = await prisma.faq.findMany({
      where: { isActive: true, categoryId },
      orderBy: [{ sort: "asc" }, { createdAt: "asc" }],
      take: 30,
    });
    if (items.length === 0) {
      return show(ctx, ctx.tr.t("faq_empty"), backKeyboard(ctx.tr, "menu:faq"));
    }
    await show(ctx, ctx.tr.t("faq_pick_question"), faqQuestionsKeyboard(ctx.tr, items));
  });

  bot.callbackQuery(/^faq:q:(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const id = ctx.match![1];
    const faq = await prisma.faq.findUnique({ where: { id } });
    if (!faq) return show(ctx, ctx.tr.t("faq_empty"), homeKeyboard(ctx.tr));

    await prisma.faq.update({ where: { id }, data: { views: { increment: 1 } } });
    await log(ctx.botUser.id, "faq:open", id);

    const back = faq.categoryId ? `faq:cat:${faq.categoryId}` : "menu:faq";
    await show(ctx, renderFaq(faq, ctx.tr), backKeyboard(ctx.tr, back));
  });

  // ── Chet elda o'qish ──
  bot.callbackQuery(/^ab:(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const id = ctx.match![1];
    const program = await prisma.studyAbroadProgram.findUnique({ where: { id } });
    if (!program) return show(ctx, ctx.tr.t("abroad_empty"), homeKeyboard(ctx.tr));

    await prisma.studyAbroadProgram.update({ where: { id }, data: { views: { increment: 1 } } });
    await log(ctx.botUser.id, "abroad:open", id);

    const kb = new InlineKeyboard();
    if (program.link) kb.url(ctx.tr.t("btn_link"), program.link).row();
    kb.text(ctx.tr.t("btn_back"), "menu:abroad").text(ctx.tr.t("btn_home"), "menu:home");

    await show(ctx, renderProgram(program, ctx.tr), kb);
  });

  // ── Fakultet mas'ullari ──
  bot.callbackQuery(/^st:(CURATOR|VICE_DEAN|DEPARTMENT|DEAN)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    if (!(await ensureVerified(ctx))) return;

    const role = ctx.match![1] as StaffRole;
    const student = await loadStudent(ctx.botUser);
    if (!student) return showMainMenu(ctx);

    const staff = await findStaffForStudent(student.facultyId, role, student.groupName, student.course);

    if (staff.length === 0) {
      return show(ctx, ctx.tr.t("contacts_empty"), backKeyboard(ctx.tr, "menu:contacts"));
    }
    if (staff.length === 1) {
      return show(
        ctx,
        renderStaff(staff[0], ctx.tr),
        staffCardKeyboard(ctx.tr, staff[0].id, "menu:contacts"),
      );
    }
    await show(ctx, ctx.tr.t("faq_pick_question"), staffListKeyboard(ctx.tr, staff));
  });

  bot.callbackQuery(/^st:one:(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const staff = await prisma.facultyStaff.findUnique({ where: { id: ctx.match![1] } });
    if (!staff) return show(ctx, ctx.tr.t("contacts_empty"), backKeyboard(ctx.tr, "menu:contacts"));
    await show(ctx, renderStaff(staff, ctx.tr), staffCardKeyboard(ctx.tr, staff.id, `st:${staff.role}`));
  });

  // ── Mas'ulga xabar yozish ──
  bot.callbackQuery(/^st:msg:(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    if (!(await ensureVerified(ctx))) return;

    const staffId = ctx.match![1];
    const staff = await prisma.facultyStaff.findUnique({ where: { id: staffId } });
    if (!staff) return show(ctx, ctx.tr.t("contacts_empty"), homeKeyboard(ctx.tr));

    ctx.botUser = await prisma.botUser.update({
      where: { id: ctx.botUser.id },
      data: { step: "STAFF_MSG", pendingStaffId: staffId },
    });

    await ctx.reply(ctx.tr.t("staff_msg_ask", { staff: escapeHtml(staff.fullName) }), {
      parse_mode: "HTML",
    });
  });

  // ── Mas'ul xodimga murojaat (pasport topilmaganda) ──
  bot.callbackQuery("sup:new", async (ctx) => {
    await ctx.answerCallbackQuery();
    await prisma.botUser.update({ where: { id: ctx.botUser.id }, data: { step: "SUPPORT" } });
    await show(ctx, ctx.tr.t("support_ask"));
  });

  // ── Matnli xabarlar ──
  bot.on("message:text", async (ctx) => {
    const text = ctx.message.text.trim();
    const step = ctx.botUser.step;

    // 1. Admin ulanish kodi
    if (step === "ADMIN_LINK") return handleAdminLink(ctx, text);

    // 2. Mas'ul xodimga xabar
    if (step === "STAFF_MSG" && ctx.botUser.pendingStaffId) {
      return handleStaffMessage(ctx, text);
    }

    // 3. Pasport topilmagach qoldirilgan murojaat
    if (step === "SUPPORT") return handleSupportTicket(ctx, text);

    // 4. Pastki klaviatura tugmasi bosilganmi?
    const buttons = await loadMenuButtons();
    const button = matchButton(buttons, text);
    if (button) return runButton(ctx, button);

    // 5. Pasport kiritish bosqichi
    if (step === "PASSPORT" || step === "LANG" || !ctx.botUser.isVerified) {
      return handlePassport(ctx, text);
    }

    // 6. Tushunarsiz matn
    await ctx.reply(ctx.tr.t("unknown_command"), {
      parse_mode: "HTML",
      reply_markup: await mainReplyKeyboard(ctx.tr),
    });
  });

  bot.on("message", async (ctx) => {
    if (!ctx.botUser.isVerified) {
      await ctx.reply(ctx.tr.t("ask_passport"), { parse_mode: "HTML" });
      return;
    }
    await showMainMenu(ctx);
  });

  // ── Xatolarni ushlash ──
  bot.catch(async (err) => {
    const ctx = err.ctx as TiuContext;
    const error = err.error;
    if (error instanceof GrammyError) {
      console.error("[bot] Telegram API xatosi:", error.description);
    } else if (error instanceof HttpError) {
      console.error("[bot] Tarmoq xatosi:", error);
    } else {
      console.error("[bot] Kutilmagan xato:", error);
    }
    try {
      const tr = ctx?.tr ?? (await getTranslator("uz"));
      await ctx?.reply?.(tr.t("error_generic"), { parse_mode: "HTML" });
    } catch {
      /* ignore */
    }
  });

  return bot;
}

// ─────────────────────────────────────────────────────────────
// Pasport tekshiruvi
// ─────────────────────────────────────────────────────────────
async function handlePassport(ctx: TiuContext, raw: string) {
  const passport = normalizePassport(raw);

  if (!isValidPassport(passport)) {
    await log(ctx.botUser.id, "passport_invalid", passport.slice(0, 20));
    await ctx.reply(ctx.tr.t("passport_invalid"), { parse_mode: "HTML" });
    return;
  }

  const student = await prisma.student.findFirst({
    where: {
      isActive: true,
      OR: [{ passportSeries: passport }, { pinfl: passport }],
    },
    include: { faculty: true },
  });

  if (!student) {
    const attempts = ctx.botUser.failedAttempts + 1;
    await prisma.botUser.update({
      where: { id: ctx.botUser.id },
      data: { failedAttempts: attempts, isBlocked: attempts >= MAX_FAILED_ATTEMPTS },
    });
    await log(ctx.botUser.id, "passport_fail", passport);

    await ctx.reply(ctx.tr.t("passport_not_found", { passport: escapeHtml(passport) }), {
      parse_mode: "HTML",
      reply_markup: notFoundKeyboard(ctx.tr),
    });
    return;
  }

  ctx.botUser = await prisma.botUser.update({
    where: { id: ctx.botUser.id },
    data: {
      studentId: student.id,
      isVerified: true,
      step: "MENU",
      failedAttempts: 0,
      phone: ctx.botUser.phone ?? student.phone,
    },
  });
  await log(ctx.botUser.id, "passport_ok", student.passportSeries);

  await ctx.reply(ctx.tr.t("passport_found", { name: escapeHtml(student.fullName) }), {
    parse_mode: "HTML",
    reply_markup: await mainReplyKeyboard(ctx.tr),
  });
}

// ─────────────────────────────────────────────────────────────
// Mas'ul xodimga xabar
// ─────────────────────────────────────────────────────────────
async function handleStaffMessage(ctx: TiuContext, text: string) {
  const staff = await prisma.facultyStaff.findUnique({
    where: { id: ctx.botUser.pendingStaffId! },
    include: { faculty: true },
  });

  await prisma.botUser.update({
    where: { id: ctx.botUser.id },
    data: { step: "MENU", pendingStaffId: null },
  });
  ctx.botUser = { ...ctx.botUser, step: "MENU", pendingStaffId: null };

  if (!staff) {
    await ctx.reply(ctx.tr.t("staff_msg_failed"), { parse_mode: "HTML" });
    return;
  }

  const student = await loadStudent(ctx.botUser);
  const result = await sendMessageToStaff(ctx.api, {
    staff,
    botUser: ctx.botUser,
    student,
    text,
  });

  await log(ctx.botUser.id, "staff:message", staff.fullName);

  // Guruh sozlanmagan bo'lsa ham xabar bazaga yozildi — admin panelda ko'rinadi
  await ctx.reply(ctx.tr.t("staff_msg_sent", { staff: escapeHtml(staff.fullName) }), {
    parse_mode: "HTML",
    reply_markup: await mainReplyKeyboard(ctx.tr),
  });

  if (!result.delivered) {
    console.warn("[staff-chat] guruhga yetkazilmadi — admin panelda ko'rinadi");
  }
}

async function handleSupportTicket(ctx: TiuContext, text: string) {
  const lastAttempt = await prisma.activityLog.findFirst({
    where: { botUserId: ctx.botUser.id, action: "passport_fail" },
    orderBy: { createdAt: "desc" },
  });

  await prisma.supportTicket.create({
    data: {
      botUserId: ctx.botUser.id,
      telegramId: ctx.botUser.telegramId,
      username: ctx.botUser.username,
      fullName: [ctx.botUser.firstName, ctx.botUser.lastName].filter(Boolean).join(" ") || null,
      passport: lastAttempt?.payload ?? null,
      message: text.slice(0, 2000),
    },
  });

  await prisma.botUser.update({ where: { id: ctx.botUser.id }, data: { step: "PASSPORT" } });
  await log(ctx.botUser.id, "support:new");

  await ctx.reply(ctx.tr.t("support_done"), {
    parse_mode: "HTML",
    reply_markup: new InlineKeyboard().text(ctx.tr.t("btn_retry"), "auth:retry"),
  });
}

// ─────────────────────────────────────────────────────────────
// Guruhdagi javoblar — xodim reply qilganda talabaga yetkaziladi
// ─────────────────────────────────────────────────────────────
async function handleGroupReply(ctx: Context) {
  const message = ctx.message;
  const replyTo = message?.reply_to_message;
  const text = message?.text ?? message?.caption;
  if (!message || !replyTo || !text?.trim()) return;

  const original = await prisma.staffMessage.findFirst({
    where: { groupMessageId: replyTo.message_id, direction: "IN" },
    include: { botUser: true, staff: true },
  });
  if (!original?.botUser) return;

  const tr = await getTranslator((original.botUser.lang as Lang) ?? "uz");
  const staffName = original.staff?.fullName ?? "Universitet mas'uli";

  try {
    await ctx.api.sendMessage(
      original.botUser.telegramId,
      tr.t("staff_reply", { staff: escapeHtml(staffName), text: escapeHtml(text.trim()) }),
      { parse_mode: "HTML" },
    );
  } catch (error) {
    await ctx.reply("⚠️ Talabaga yetkazib bo'lmadi — u botni bloklagan bo'lishi mumkin.", {
      reply_parameters: { message_id: message.message_id },
    });
    console.error("[staff-chat] javob yetkazilmadi:", error);
    return;
  }

  await recordOutgoing({
    staffId: original.staffId,
    botUserId: original.botUserId,
    studentId: original.studentId,
    text: text.trim(),
    replierName:
      [ctx.from?.first_name, ctx.from?.last_name].filter(Boolean).join(" ") || undefined,
  });

  await prisma.staffMessage.update({ where: { id: original.id }, data: { isRead: true } });

  await ctx.reply("✅ Javob talabaga yuborildi.", {
    reply_parameters: { message_id: message.message_id },
  });
}

// ─────────────────────────────────────────────────────────────
// Admin — Telegram Mini App
// ─────────────────────────────────────────────────────────────
function adminPanelUrl() {
  const base = (process.env.PUBLIC_URL ?? "").replace(/\/$/, "");
  if (!/^https:\/\//i.test(base)) return null;
  return `${base}/tg`;
}

async function sendAdminPanelButton(ctx: TiuContext, fullName: string) {
  const url = adminPanelUrl();
  if (!url) {
    await ctx.reply(
      "⚠️ Mini ilova uchun <b>PUBLIC_URL</b> (https) sozlanmagan.\n\n" +
        ".env faylida <code>PUBLIC_URL=\"https://...\"</code> ni belgilang.",
      { parse_mode: "HTML" },
    );
    return;
  }

  await ctx.reply(ctx.tr.t("admin_welcome", { name: escapeHtml(fullName) }), {
    parse_mode: "HTML",
    reply_markup: new InlineKeyboard().webApp(ctx.tr.t("admin_open_btn"), url),
  });

  // Chat menyusiga ham joylashtiramiz
  try {
    await ctx.api.setChatMenuButton({
      chat_id: Number(ctx.botUser.telegramId),
      menu_button: { type: "web_app", text: "Admin", web_app: { url } },
    });
  } catch {
    /* ixtiyoriy */
  }
}

async function handleAdminLink(ctx: TiuContext, code: string) {
  const clean = code.replace(/\D/g, "");
  const admin = clean
    ? await prisma.adminUser.findFirst({
        where: { linkCode: clean, isActive: true, linkCodeExp: { gt: new Date() } },
      })
    : null;

  if (!admin) {
    await ctx.reply(ctx.tr.t("admin_link_invalid"), { parse_mode: "HTML" });
    return;
  }

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { telegramId: ctx.botUser.telegramId, linkCode: null, linkCodeExp: null },
  });
  await prisma.botUser.update({
    where: { id: ctx.botUser.id },
    data: { step: ctx.botUser.isVerified ? "MENU" : "PASSPORT" },
  });

  await ctx.reply(ctx.tr.t("admin_linked", { name: escapeHtml(admin.fullName) }), {
    parse_mode: "HTML",
  });
  await sendAdminPanelButton(ctx, admin.fullName);
}

// ─────────────────────────────────────────────────────────────
// Talabaga mos mas'ul xodimni topish
// ─────────────────────────────────────────────────────────────
export async function findStaffForStudent(
  facultyId: string | null,
  role: StaffRole,
  groupName: string,
  course: number,
) {
  if (!facultyId) return [];

  const all = await prisma.facultyStaff.findMany({
    where: { facultyId, role, isActive: true },
    orderBy: [{ sort: "asc" }, { fullName: "asc" }],
  });
  if (all.length === 0) return [];

  if (role === "CURATOR") {
    const exact = all.filter((s) =>
      (s.groupNames ?? "")
        .split(/[,;]/)
        .map((g) => g.trim().toUpperCase())
        .filter(Boolean)
        .includes(groupName.trim().toUpperCase()),
    );
    if (exact.length > 0) return exact;
  }

  if (role === "VICE_DEAN") {
    const exact = all.filter((s) => s.course === course);
    if (exact.length > 0) return exact;
    const general = all.filter((s) => s.course === null);
    if (general.length > 0) return general;
  }

  return all;
}
