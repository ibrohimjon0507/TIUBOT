import { prisma } from "./db";
import type { Lang } from "./constants";
import { DEFAULT_TEXTS, type TextKey } from "./texts";

export const DEFAULT_SETTINGS: Record<string, string> = {
  university_name: "Toshkent Xalqaro Universiteti (TIU)",
  support_phone: "+998 (71) 200-00-00",
  support_address: "Toshkent sh., Yangihayot tumani, Qo'yliq 4, 1-uy",
  support_telegram: "@tiu_support",
  support_working_hours: "Dush–Juma, 09:00–18:00",
  /** Topikli (forum) guruh ID'si — talaba xabarlari shu yerga tushadi. Masalan: -1001234567890 */
  support_group_id: "",
};

type Dict = Record<string, { uz: string; ru: string; en: string }>;

const CACHE_TTL_MS = 30_000;
let cache: { texts: Dict; settings: Record<string, string>; at: number } | null = null;

/** Matnlar + sozlamalarni DB'dan (keshlangan holda) yuklaydi. */
export async function loadDictionary(force = false) {
  if (!force && cache && Date.now() - cache.at < CACHE_TTL_MS) return cache;

  const texts: Dict = {};
  const settings: Record<string, string> = { ...DEFAULT_SETTINGS };

  try {
    const [rows, settingRows] = await Promise.all([
      prisma.botText.findMany(),
      prisma.setting.findMany(),
    ]);
    for (const r of rows) texts[r.key] = { uz: r.uz, ru: r.ru, en: r.en };
    for (const s of settingRows) settings[s.key] = s.value;
  } catch {
    // DB hali tayyor emas — standart matnlar bilan ishlaymiz
  }

  cache = { texts, settings, at: Date.now() };
  return cache;
}

export function invalidateDictionary() {
  cache = null;
}

function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in vars ? String(vars[key]) : match,
  );
}

export type Translator = {
  lang: Lang;
  t: (key: TextKey, vars?: Record<string, string | number>) => string;
  setting: (key: string) => string;
};

/** Bir update uchun tarjimon obyektini qaytaradi (sinxron `t`). */
export async function getTranslator(lang: Lang): Promise<Translator> {
  const { texts, settings } = await loadDictionary();

  const t = (key: TextKey, vars: Record<string, string | number> = {}) => {
    const entry = texts[key] ?? DEFAULT_TEXTS[key];
    const raw = (entry?.[lang] ?? DEFAULT_TEXTS[key]?.[lang] ?? key) as string;
    return interpolate(raw, { ...settings, ...vars });
  };

  return { lang, t, setting: (key: string) => settings[key] ?? "" };
}
