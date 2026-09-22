import { InlineKeyboard, Keyboard } from "grammy";
import { LANG_LABELS, LANGS, STAFF_ROLES, STAFF_ROLE_LABELS } from "@/lib/constants";
import type { Translator } from "@/lib/i18n";
import { buttonLabel, groupIntoRows, loadMenuButtons } from "@/lib/menu";

/** Til tanlash */
export function langKeyboard(withBack = false) {
  const kb = new InlineKeyboard();
  for (const lang of LANGS) kb.text(LANG_LABELS[lang], `lang:${lang}`).row();
  if (withBack) kb.text("◀️", "menu:home");
  return kb;
}

/**
 * Asosiy menyu — ekranning <b>pastida</b> turadigan doimiy klaviatura.
 * Tugmalar admin paneldagi «Menyu tugmalari» bo'limidan boshqariladi.
 */
export async function mainReplyKeyboard(tr: Translator) {
  const buttons = await loadMenuButtons();
  const keyboard = new Keyboard().resized().persistent();

  const rows = groupIntoRows(buttons);
  for (const [index, row] of rows.entries()) {
    for (const button of row) {
      const label = buttonLabel(button, tr.lang);
      if (button.type === "WEBAPP" && button.url) keyboard.webApp(label, button.url);
      else keyboard.text(label);
    }
    if (index < rows.length - 1) keyboard.row();
  }

  return keyboard;
}

/** Klaviaturani olib tashlash (til tanlash bosqichi uchun) */
export function removeKeyboard() {
  return { remove_keyboard: true as const };
}

/** Faqat "Asosiy menyu" tugmasi */
export function homeKeyboard(tr: Translator) {
  return new InlineKeyboard().text(tr.t("btn_home"), "menu:home");
}

/** Orqaga + Asosiy menyu */
export function backKeyboard(tr: Translator, backData: string) {
  return new InlineKeyboard()
    .text(tr.t("btn_back"), backData)
    .text(tr.t("btn_home"), "menu:home");
}

/** Pasport topilmaganda */
export function notFoundKeyboard(tr: Translator) {
  const kb = new InlineKeyboard()
    .text(tr.t("btn_retry"), "auth:retry")
    .row()
    .text(tr.t("btn_support"), "sup:new");
  return kb;
}

/** FAQ kategoriyalari */
export function faqCategoriesKeyboard(
  tr: Translator,
  categories: { id: string; emoji: string; titleUz: string; titleRu: string; titleEn: string }[],
) {
  const kb = new InlineKeyboard();
  const field = `title${tr.lang.charAt(0).toUpperCase()}${tr.lang.slice(1)}` as
    | "titleUz"
    | "titleRu"
    | "titleEn";
  for (const c of categories) {
    kb.text(`${c.emoji} ${c[field]}`, `faq:cat:${c.id}`).row();
  }
  kb.text(tr.t("btn_home"), "menu:home");
  return kb;
}

/** FAQ savollari */
export function faqQuestionsKeyboard(
  tr: Translator,
  items: { id: string; questionUz: string; questionRu: string; questionEn: string }[],
  backData = "menu:faq",
) {
  const kb = new InlineKeyboard();
  const field = `question${tr.lang.charAt(0).toUpperCase()}${tr.lang.slice(1)}` as
    | "questionUz"
    | "questionRu"
    | "questionEn";
  for (const q of items) {
    kb.text(truncate(q[field], 60), `faq:q:${q.id}`).row();
  }
  kb.text(tr.t("btn_back"), backData).text(tr.t("btn_home"), "menu:home");
  return kb;
}

/** Chet el dasturlari ro'yxati */
export function abroadKeyboard(
  tr: Translator,
  programs: { id: string; flag: string; titleUz: string; titleRu: string; titleEn: string }[],
) {
  const kb = new InlineKeyboard();
  const field = `title${tr.lang.charAt(0).toUpperCase()}${tr.lang.slice(1)}` as
    | "titleUz"
    | "titleRu"
    | "titleEn";
  for (const p of programs) {
    kb.text(`${p.flag} ${truncate(p[field], 55)}`, `ab:${p.id}`).row();
  }
  kb.text(tr.t("btn_home"), "menu:home");
  return kb;
}

/** Fakultet mas'ullari — 4 ta rol */
export function staffRolesKeyboard(tr: Translator) {
  const kb = new InlineKeyboard();
  for (const role of STAFF_ROLES) {
    kb.text(STAFF_ROLE_LABELS[role][tr.lang], `st:${role}`).row();
  }
  kb.text(tr.t("btn_home"), "menu:home");
  return kb;
}

/** Bir rolda bir nechta xodim bo'lsa */
export function staffListKeyboard(tr: Translator, staff: { id: string; fullName: string }[]) {
  const kb = new InlineKeyboard();
  for (const s of staff) kb.text(`👤 ${truncate(s.fullName, 55)}`, `st:one:${s.id}`).row();
  kb.text(tr.t("btn_back"), "menu:contacts").text(tr.t("btn_home"), "menu:home");
  return kb;
}

/** Xodim kartasi — shu yerning o'zidan xabar yozish mumkin */
export function staffCardKeyboard(tr: Translator, staffId: string, backData: string) {
  return new InlineKeyboard()
    .text(tr.t("btn_write_message"), `st:msg:${staffId}`)
    .row()
    .text(tr.t("btn_back"), backData)
    .text(tr.t("btn_home"), "menu:home");
}

export function truncate(value: string, max: number) {
  const clean = value.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}
