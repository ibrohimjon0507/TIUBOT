import type { Prisma } from "@prisma/client";
import { normalizePassport } from "./constants";

/**
 * Qidiruv so'rovini tozalab, so'zlarga ajratadi.
 * - ortiqcha bo'shliqlar olib tashlanadi
 * - o'zbek apostroflarining barcha ko'rinishlari bitta belgiga keltiriladi
 *   (oʻ / o‘ / o’ / o` → o')
 */
export function normalizeQuery(raw: string): string {
  return raw
    .replace(/[ʻʼ‘’`´]/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function splitTerms(raw: string, max = 5): string[] {
  return normalizeQuery(raw)
    .split(" ")
    .map((t) => t.trim())
    .filter((t) => t.length >= 2)
    .slice(0, max);
}

/**
 * Talabalar uchun qidiruv sharti.
 *
 * Algoritm: so'rov so'zlarga bo'linadi va <b>har bir so'z</b> maydonlardan
 * <b>kamida bittasida</b> uchrashi shart (AND-of-OR). Shu sababli
 * «aziz IF-101» yoki «IF-101 aziz» — ikkalasi ham topadi, tartib muhim emas.
 *
 * Katta-kichik harf farqlanmaydi (`insensitive`), tezlik uchun bazada
 * `pg_trgm` GIN indekslari mavjud.
 */
export function studentSearchWhere(query: string): Prisma.StudentWhereInput | undefined {
  const terms = splitTerms(query);
  if (terms.length === 0) return undefined;

  const insensitive = "insensitive" as const;

  return {
    AND: terms.map((term) => {
      const passport = normalizePassport(term);
      return {
        OR: [
          { fullName: { contains: term, mode: insensitive } },
          { groupName: { contains: term, mode: insensitive } },
          { program: { contains: term, mode: insensitive } },
          { facultyName: { contains: term, mode: insensitive } },
          { phone: { contains: term, mode: insensitive } },
          { passportSeries: { contains: passport, mode: insensitive } },
          { pinfl: { contains: passport, mode: insensitive } },
        ],
      };
    }),
  };
}

/** Bot foydalanuvchilari uchun qidiruv sharti */
export function botUserSearchWhere(query: string): Prisma.BotUserWhereInput | undefined {
  const terms = splitTerms(query);
  if (terms.length === 0) return undefined;

  const insensitive = "insensitive" as const;

  return {
    AND: terms.map((term) => ({
      OR: [
        { username: { contains: term, mode: insensitive } },
        { firstName: { contains: term, mode: insensitive } },
        { lastName: { contains: term, mode: insensitive } },
        { telegramId: { contains: term } },
        { phone: { contains: term, mode: insensitive } },
        { student: { fullName: { contains: term, mode: insensitive } } },
        { student: { groupName: { contains: term, mode: insensitive } } },
        { student: { passportSeries: { contains: normalizePassport(term), mode: insensitive } } },
      ],
    })),
  };
}
