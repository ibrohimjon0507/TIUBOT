import { PrismaClient } from "@prisma/client";

/**
 * Neon'ning pool'langan (PgBouncer) ulanishi tranzaksiya rejimida ishlaydi.
 * Prisma bunda `pgbouncer=true` bo'lmasa, yuklama ostida
 * `prepared statement "s0" already exists` xatosini beradi.
 *
 * Shu sababli ulanish satriga kerakli parametrlarni o'zimiz qo'shamiz —
 * muhit o'zgaruvchisi qanday berilganidan qat'i nazar ishlaydi.
 */
function buildDatasourceUrl(): string | undefined {
  const raw = process.env.DATABASE_URL;
  if (!raw) return undefined;

  try {
    const url = new URL(raw);
    const pooled = url.hostname.includes("-pooler");

    if (pooled) {
      url.searchParams.set("pgbouncer", "true");
      // Har bir funksiya nusxasi uchun ulanishlar soni.
      // PgBouncer orqasida kichik bo'lishi kerak — aks holda pool tez tugaydi.
      if (!url.searchParams.has("connection_limit")) {
        url.searchParams.set("connection_limit", "5");
      }
    }
    // Neon «scale-to-zero» dan uyg'onishi 5–20 soniya olishi mumkin.
    // Qisqa timeout bo'lsa — uyquda turgan bazaga birinchi so'rov yiqiladi.
    url.searchParams.set("connect_timeout", "30");
    url.searchParams.set("pool_timeout", "20");

    return url.toString();
  } catch {
    return raw;
  }
}

/**
 * Vaqtinchalik ulanish xatolari — so'rov bajarilmagan, qayta urinish xavfsiz.
 *   P1001 — serverga yetib bo'lmadi (Neon uyqudan uyg'onmoqda)
 *   P1017 — server ulanishni yopdi
 *   P2024 — pool'dan ulanish olish vaqti tugadi
 */
const RETRYABLE = new Set(["P1001", "P1017", "P2024"]);

function isRetryable(error: unknown): boolean {
  const code = (error as { code?: string })?.code;
  if (code && RETRYABLE.has(code)) return true;
  const message = (error as Error)?.message ?? "";
  return message.includes("Can't reach database server");
}

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function createPrisma() {
  const base = new PrismaClient({
    datasourceUrl: buildDatasourceUrl(),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

  /**
   * Neon bepul rejada 5 daqiqa bo'sh tursa uxlaydi va uyg'onishi 5–20 soniya oladi.
   * Shu paytga to'g'ri kelgan birinchi so'rov yiqilmasligi uchun avtomatik
   * qayta urinamiz — foydalanuvchi faqat biroz kutadi, xato ko'rmaydi.
   */
  return base.$extends({
    query: {
      async $allOperations({ args, query }) {
        let lastError: unknown;
        for (let attempt = 0; attempt < 3; attempt += 1) {
          try {
            return await query(args);
          } catch (error) {
            if (!isRetryable(error)) throw error;
            lastError = error;
            if (attempt < 2) await sleep(1000 * (attempt + 1));
          }
        }
        throw lastError;
      },
    },
  });
}

type ExtendedPrisma = ReturnType<typeof createPrisma>;

const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrisma | undefined;
};

export const prisma: ExtendedPrisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
