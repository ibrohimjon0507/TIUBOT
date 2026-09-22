"use server";

import { redirect } from "next/navigation";
import { authenticate, createSession, destroySession } from "@/lib/auth";

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "E-mail va parolni kiriting." };
  }

  const user = await authenticate(email, password);
  if (!user) {
    return { error: "E-mail yoki parol noto'g'ri. Qayta urinib ko'ring." };
  }

  await createSession(user);
  redirect("/");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}
