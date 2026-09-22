import { prisma } from "./db";
import type { Lang } from "./constants";
import { DEFAULT_TEXTS } from "./texts";

export const BUTTON_TYPES = ["BUILTIN", "TEXT", "LINK", "WEBAPP"] as const;
export type ButtonType = (typeof BUTTON_TYPES)[number];

export const BUTTON_TYPE_LABELS: Record<ButtonType, string> = {
  BUILTIN: "Tizim bo'limi",
  TEXT: "Matn chiqaradi",
  LINK: "Matn + havola tugmasi",
  WEBAPP: "Mini ilova (Web App)",
};

export const BUILTIN_ACTIONS = ["status", "faq", "abroad", "contacts", "lang", "help"] as const;
export type BuiltinAction = (typeof BUILTIN_ACTIONS)[number];

export const BUILTIN_ACTION_LABELS: Record<BuiltinAction, string> = {
  status: "📊 Status — talaba ma'lumotlari",
  faq: "❓ Savol-javoblar",
  abroad: "🌍 Chet mamlakatlarda o'qish",
  contacts: "👥 Fakultet mas'ullari bilan bog'lanish",
  lang: "🌐 Tilni o'zgartirish",
  help: "ℹ️ Yordam",
};

/** Boshlang'ich tugmalar to'plami — seed va «standart holatga qaytarish» uchun */
export const DEFAULT_BUTTONS = [
  { action: "status", texts: DEFAULT_TEXTS.btn_status, row: 0, sort: 0 },
  { action: "faq", texts: DEFAULT_TEXTS.btn_faq, row: 1, sort: 0 },
  { action: "abroad", texts: DEFAULT_TEXTS.btn_abroad, row: 2, sort: 0 },
  { action: "contacts", texts: DEFAULT_TEXTS.btn_contacts, row: 3, sort: 0 },
  { action: "lang", texts: DEFAULT_TEXTS.btn_lang, row: 4, sort: 0 },
  {
    action: "help",
    texts: { uz: "ℹ️ Yordam", ru: "ℹ️ Помощь", en: "ℹ️ Help" },
    row: 4,
    sort: 1,
  },
] as const;

export type MenuButtonRow = {
  id: string;
  labelUz: string;
  labelRu: string;
  labelEn: string;
  type: string;
  action: string | null;
  contentUz: string | null;
  contentRu: string | null;
  contentEn: string | null;
  url: string | null;
  row: number;
  sort: number;
};

const CACHE_TTL_MS = 120_000;
let cache: { buttons: MenuButtonRow[]; at: number } | null = null;

export async function loadMenuButtons(force = false): Promise<MenuButtonRow[]> {
  if (!force && cache && Date.now() - cache.at < CACHE_TTL_MS) return cache.buttons;

  let buttons: MenuButtonRow[] = [];
  try {
    buttons = await prisma.menuButton.findMany({
      where: { isActive: true },
      orderBy: [{ row: "asc" }, { sort: "asc" }],
      select: {
        id: true,
        labelUz: true,
        labelRu: true,
        labelEn: true,
        type: true,
        action: true,
        contentUz: true,
        contentRu: true,
        contentEn: true,
        url: true,
        row: true,
        sort: true,
      },
    });
  } catch {
    buttons = [];
  }

  cache = { buttons, at: Date.now() };
  return buttons;
}

export function invalidateMenuCache() {
  cache = null;
}

export function buttonLabel(button: MenuButtonRow, lang: Lang): string {
  const value =
    lang === "ru" ? button.labelRu : lang === "en" ? button.labelEn : button.labelUz;
  return value?.trim() || button.labelUz;
}

export function buttonContent(button: MenuButtonRow, lang: Lang): string {
  const value =
    lang === "ru" ? button.contentRu : lang === "en" ? button.contentEn : button.contentUz;
  return value?.trim() || button.contentUz?.trim() || "";
}

function normalize(value: string) {
  return value.replace(/\s+/g, " ").trim().toLowerCase();
}

/** Foydalanuvchi yozgan matn qaysi tugmaga tegishli ekanini aniqlaydi (istalgan tilda). */
export function matchButton(
  buttons: MenuButtonRow[],
  text: string,
): MenuButtonRow | undefined {
  const needle = normalize(text);
  return buttons.find(
    (b) =>
      normalize(b.labelUz) === needle ||
      normalize(b.labelRu) === needle ||
      normalize(b.labelEn) === needle,
  );
}

/** Tugmalarni qatorlarga guruhlaydi */
export function groupIntoRows(buttons: MenuButtonRow[]): MenuButtonRow[][] {
  const rows = new Map<number, MenuButtonRow[]>();
  for (const button of buttons) {
    const list = rows.get(button.row) ?? [];
    list.push(button);
    rows.set(button.row, list);
  }
  return [...rows.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([, list]) => list.sort((a, b) => a.sort - b.sort));
}
