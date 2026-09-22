import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "./db";
import type { AdminRole } from "./constants";

const COOKIE_NAME = "tiu_admin_session";
const MAX_AGE_SEC = 60 * 60 * 12; // 12 soat

function secret() {
  const value = process.env.AUTH_SECRET;
  if (!value || value.length < 16) {
    throw new Error("AUTH_SECRET .env faylida belgilanmagan (kamida 16 belgi).");
  }
  return new TextEncoder().encode(value);
}

export type SessionUser = {
  id: string;
  email: string;
  fullName: string;
  role: AdminRole;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(user: SessionUser) {
  const token = await new SignJWT({ ...user })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SEC}s`)
    .sign(secret());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionUser | null> {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      id: String(payload.id),
      email: String(payload.email),
      fullName: String(payload.fullName),
      role: payload.role as AdminRole,
    };
  } catch {
    return null;
  }
}

/** Sahifa/action uchun — sessiya bo'lmasa /login ga yo'naltiradi. */
export async function requireSession(): Promise<SessionUser> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}

/** Faqat SUPERADMIN bajara oladigan amallar uchun. */
export async function requireSuperAdmin(): Promise<SessionUser> {
  const session = await requireSession();
  if (session.role !== "SUPERADMIN") {
    throw new Error("Bu amal uchun Super admin huquqi talab etiladi.");
  }
  return session;
}

export async function authenticate(email: string, password: string) {
  const admin = await prisma.adminUser.findUnique({
    where: { email: email.trim().toLowerCase() },
  });
  if (!admin || !admin.isActive) return null;
  const ok = await verifyPassword(password, admin.passwordHash);
  if (!ok) return null;

  await prisma.adminUser.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() },
  });

  return {
    id: admin.id,
    email: admin.email,
    fullName: admin.fullName,
    role: admin.role as AdminRole,
  } satisfies SessionUser;
}
