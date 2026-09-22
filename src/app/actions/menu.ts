"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { invalidateMenuCache, DEFAULT_BUTTONS, BUTTON_TYPES, type ButtonType } from "@/lib/menu";

export type FormState = { error?: string; ok?: string };

function str(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function int(form: FormData, key: string, fallback = 0) {
  const value = Number(str(form, key));
  return Number.isFinite(value) ? Math.round(value) : fallback;
}

export async function saveMenuButtonAction(
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  await requireSession();

  const id = str(form, "id");
  const labelUz = str(form, "labelUz");
  const type = (str(form, "type") || "BUILTIN") as ButtonType;

  if (!labelUz) return { error: "Tugma nomini (o'zbekcha) kiriting." };
  if (!BUTTON_TYPES.includes(type)) return { error: "Tugma turi noto'g'ri." };

  const url = str(form, "url");
  if ((type === "LINK" || type === "WEBAPP") && !url) {
    return { error: "Bu tur uchun havola majburiy." };
  }
  if (url && !/^https:\/\//i.test(url)) {
    return { error: "Havola https:// bilan boshlanishi kerak (Telegram talabi)." };
  }

  const contentUz = str(form, "contentUz");
  if ((type === "TEXT" || type === "LINK") && !contentUz) {
    return { error: "Tugma bosilganda chiqadigan matnni kiriting." };
  }

  const action = type === "BUILTIN" ? str(form, "action") || "status" : null;

  const data = {
    labelUz,
    labelRu: str(form, "labelRu") || labelUz,
    labelEn: str(form, "labelEn") || labelUz,
    type,
    action,
    contentUz: contentUz || null,
    contentRu: str(form, "contentRu") || contentUz || null,
    contentEn: str(form, "contentEn") || contentUz || null,
    url: url || null,
    row: Math.max(0, int(form, "row")),
    sort: Math.max(0, int(form, "sort")),
    isActive: form.get("isActive") === "on",
  };

  // Bir xil nomli tugma bo'lsa — bot qaysi biri ekanini ajrata olmaydi
  const duplicate = await prisma.menuButton.findFirst({
    where: { labelUz, ...(id ? { id: { not: id } } : {}) },
  });
  if (duplicate) return { error: `"${labelUz}" nomli tugma allaqachon mavjud.` };

  if (id) await prisma.menuButton.update({ where: { id }, data });
  else await prisma.menuButton.create({ data });

  invalidateMenuCache();
  revalidatePath("/menu");
  return { ok: "Tugma saqlandi. O'zgarish botda darhol kuchga kiradi." };
}

export async function deleteMenuButtonAction(form: FormData) {
  await requireSession();
  const id = String(form.get("id") ?? "");
  if (!id) return;

  await prisma.menuButton.delete({ where: { id } });
  invalidateMenuCache();
  revalidatePath("/menu");
  redirect("/menu?ok=deleted");
}

/** Tugmani yuqoriga/pastga ko'chirish (qator raqamini almashtirish) */
export async function moveMenuButtonAction(form: FormData) {
  await requireSession();
  const id = String(form.get("id") ?? "");
  const direction = String(form.get("direction") ?? "up");
  if (!id) return;

  const button = await prisma.menuButton.findUnique({ where: { id } });
  if (!button) return;

  await prisma.menuButton.update({
    where: { id },
    data: { row: Math.max(0, button.row + (direction === "up" ? -1 : 1)) },
  });

  invalidateMenuCache();
  revalidatePath("/menu");
}

export async function resetMenuButtonsAction() {
  await requireSession();

  await prisma.menuButton.deleteMany({});
  for (const button of DEFAULT_BUTTONS) {
    await prisma.menuButton.create({
      data: {
        labelUz: button.texts.uz,
        labelRu: button.texts.ru,
        labelEn: button.texts.en,
        type: "BUILTIN",
        action: button.action,
        row: button.row,
        sort: button.sort,
      },
    });
  }

  invalidateMenuCache();
  revalidatePath("/menu");
  redirect("/menu?ok=reset");
}
