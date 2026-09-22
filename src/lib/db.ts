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

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasourceUrl: buildDatasourceUrl(),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
