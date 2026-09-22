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

function int(form: FormData, key: string, fallback = 0) {
  const value = Number(str(form, key));
  return Number.isFinite(value) ? Math.round(value) : fallback;
}

// ── Fakultet ──────────────────────────────────────────────

export async function saveFacultyAction(
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  await requireSession();

  const id = str(form, "id");
  const code = str(form, "code").toUpperCase();
  const data = {
    code,
    nameUz: str(form, "nameUz"),
    nameRu: str(form, "nameRu"),
    nameEn: str(form, "nameEn"),
    sort: int(form, "sort"),
    isActive: form.get("isActive") === "on",
  };

  if (!data.code) return { error: "Fakultet kodini kiriting (masalan: IT)." };
  if (!data.nameUz) return { error: "O'zbekcha nomini kiriting." };
  if (!data.nameRu) data.nameRu = data.nameUz;
  if (!data.nameEn) data.nameEn = data.nameUz;

  const conflict = await prisma.faculty.findFirst({
    where: { code, ...(id ? { id: { not: id } } : {}) },
  });
  if (conflict) return { error: `"${code}" kodi allaqachon band.` };

  if (id) {
    await prisma.faculty.update({ where: { id }, data });
  } else {
    await prisma.faculty.create({ data });
  }

  revalidatePath("/faculties");
  return { ok: "Fakultet saqlandi." };
}

export async function deleteFacultyAction(form: FormData) {
  await requireSession();
  const id = String(form.get("id") ?? "");
  if (!id) return;

  const students = await prisma.student.count({ where: { facultyId: id } });
  if (students > 0) {
    redirect(`/faculties?error=${encodeURIComponent(
      `Fakultetga ${students} ta talaba biriktirilgan — avval ularni boshqa fakultetga ko'chiring.`,
    )}`);
  }

  await prisma.faculty.delete({ where: { id } });
  revalidatePath("/faculties");
  redirect("/faculties?ok=deleted");
}

// ── Mas'ul xodim ──────────────────────────────────────────

export async function saveStaffAction(_prev: FormState, form: FormData): Promise<FormState> {
  await requireSession();

  const id = str(form, "id");
  const facultyId = str(form, "facultyId");
  const courseRaw = str(form, "course");

  const data = {
    facultyId,
    role: str(form, "role") || "CURATOR",
    fullName: str(form, "fullName"),
    positionUz: str(form, "positionUz"),
    positionRu: str(form, "positionRu"),
    positionEn: str(form, "positionEn"),
    phone: str(form, "phone") || null,
    email: str(form, "email") || null,
    telegram: str(form, "telegram") || null,
    room: str(form, "room") || null,
    workHours: str(form, "workHours") || null,
    groupNames: str(form, "groupNames") || null,
    course: courseRaw ? Number(courseRaw) : null,
    sort: int(form, "sort"),
    isActive: form.get("isActive") === "on",
  };

  if (!data.facultyId) return { error: "Fakultet tanlanmagan." };
  if (!data.fullName) return { error: "Xodimning F.I.O sini kiriting." };

  if (id) {
    await prisma.facultyStaff.update({ where: { id }, data });
  } else {
    await prisma.facultyStaff.create({ data });
  }

  revalidatePath(`/faculties/${facultyId}`);
  revalidatePath("/faculties");
  return { ok: "Mas'ul xodim saqlandi." };
}

export async function deleteStaffAction(form: FormData) {
  await requireSession();
  const id = String(form.get("id") ?? "");
  const facultyId = String(form.get("facultyId") ?? "");
  if (!id) return;

  await prisma.facultyStaff.delete({ where: { id } });
  revalidatePath(`/faculties/${facultyId}`);
  redirect(`/faculties/${facultyId}?ok=staff-deleted`);
}
