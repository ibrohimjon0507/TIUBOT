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

export async function saveProgramAction(
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  await requireSession();

  const id = str(form, "id");
  const titleUz = str(form, "titleUz");
  const descriptionUz = str(form, "descriptionUz");
  const country = str(form, "country");

  if (!country) return { error: "Mamlakatni kiriting." };
  if (!titleUz) return { error: "O'zbekcha sarlavhani kiriting." };
  if (!descriptionUz) return { error: "O'zbekcha tavsifni kiriting." };

  const link = str(form, "link");
  if (link && !/^https?:\/\//i.test(link)) {
    return { error: "Havola http:// yoki https:// bilan boshlanishi kerak." };
  }

  const data = {
    country,
    flag: str(form, "flag") || "🌍",
    titleUz,
    titleRu: str(form, "titleRu") || titleUz,
    titleEn: str(form, "titleEn") || titleUz,
    descriptionUz,
    descriptionRu: str(form, "descriptionRu") || descriptionUz,
    descriptionEn: str(form, "descriptionEn") || descriptionUz,
    universityName: str(form, "universityName") || null,
    durationUz: str(form, "durationUz") || null,
    durationRu: str(form, "durationRu") || null,
    durationEn: str(form, "durationEn") || null,
    requirementsUz: str(form, "requirementsUz") || null,
    requirementsRu: str(form, "requirementsRu") || null,
    requirementsEn: str(form, "requirementsEn") || null,
    deadline: str(form, "deadline") || null,
    contactInfo: str(form, "contactInfo") || null,
    link: link || null,
    sort: Number(str(form, "sort")) || 0,
    isActive: form.get("isActive") === "on",
  };

  if (id) {
    await prisma.studyAbroadProgram.update({ where: { id }, data });
    revalidatePath("/programs");
    revalidatePath(`/programs/${id}`);
    return { ok: "Dastur saqlandi." };
  }

  const created = await prisma.studyAbroadProgram.create({ data });
  revalidatePath("/programs");
  redirect(`/programs/${created.id}?ok=created`);
}

export async function deleteProgramAction(form: FormData) {
  await requireSession();
  const id = String(form.get("id") ?? "");
  if (!id) return;
  await prisma.studyAbroadProgram.delete({ where: { id } });
  revalidatePath("/programs");
  redirect("/programs?ok=deleted");
}
