"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";

export type FormState = { error?: string; ok?: string };

function str(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

// ── Kategoriya ────────────────────────────────────────────

export async function saveFaqCategoryAction(
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  await requireSession();

  const id = str(form, "id");
  const titleUz = str(form, "titleUz");
  if (!titleUz) return { error: "Kategoriya nomini kiriting." };

  const data = {
    titleUz,
    titleRu: str(form, "titleRu") || titleUz,
    titleEn: str(form, "titleEn") || titleUz,
    emoji: str(form, "emoji") || "📌",
    sort: Number(str(form, "sort")) || 0,
    isActive: form.get("isActive") === "on",
  };

  if (id) await prisma.faqCategory.update({ where: { id }, data });
  else await prisma.faqCategory.create({ data });

  revalidatePath("/faq");
  return { ok: "Kategoriya saqlandi." };
}

export async function deleteFaqCategoryAction(form: FormData) {
  await requireSession();
  const id = String(form.get("id") ?? "");
  if (!id) return;

  // Savollar o'chmaydi — kategoriyasiz qoladi
  await prisma.faq.updateMany({ where: { categoryId: id }, data: { categoryId: null } });
  await prisma.faqCategory.delete({ where: { id } });

  revalidatePath("/faq");
  redirect("/faq?ok=category-deleted");
}

// ── Savol ─────────────────────────────────────────────────

export async function saveFaqAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireSession();

  const id = str(form, "id");
  const questionUz = str(form, "questionUz");
  const answerUz = str(form, "answerUz");

  if (!questionUz) return { error: "O'zbekcha savolni kiriting." };
  if (!answerUz) return { error: "O'zbekcha javobni kiriting." };

  const data = {
    categoryId: str(form, "categoryId") || null,
    questionUz,
    questionRu: str(form, "questionRu") || questionUz,
    questionEn: str(form, "questionEn") || questionUz,
    answerUz,
    answerRu: str(form, "answerRu") || answerUz,
    answerEn: str(form, "answerEn") || answerUz,
    sort: Number(str(form, "sort")) || 0,
    isActive: form.get("isActive") === "on",
  };

  if (id) {
    await prisma.faq.update({ where: { id }, data });
    revalidatePath("/faq");
    revalidatePath(`/faq/${id}`);
    return { ok: "Savol saqlandi." };
  }

  const created = await prisma.faq.create({ data });
  revalidatePath("/faq");
  redirect(`/faq/${created.id}?ok=created`);
}

export async function deleteFaqAction(form: FormData) {
  await requireSession();
  const id = String(form.get("id") ?? "");
  if (!id) return;
  await prisma.faq.delete({ where: { id } });
  revalidatePath("/faq");
  redirect("/faq?ok=deleted");
}
