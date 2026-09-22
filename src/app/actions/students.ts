"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { isValidPassport, normalizePassport, type DebtSubject } from "@/lib/constants";

export type FormState = { error?: string; ok?: string };

function str(form: FormData, key: string) {
  const value = form.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function num(form: FormData, key: string, fallback = 0) {
  const raw = str(form, key).replace(/\s/g, "").replace(/,/g, ".");
  const value = Number(raw);
  return Number.isFinite(value) ? value : fallback;
}

/**
 * Har bir qator bitta fan:
 *   "Diskret matematika | 5 | 2"  ->  { name, credit, semester }
 */
function parseDebtLines(raw: string): DebtSubject[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [name, credit, semester] = line.split("|").map((p) => p.trim());
      const item: DebtSubject = { name };
      if (credit && Number.isFinite(Number(credit))) item.credit = Number(credit);
      if (semester && Number.isFinite(Number(semester))) item.semester = Number(semester);
      return item;
    })
    .filter((item) => item.name.length > 0);
}

function buildData(form: FormData) {
  const passportSeries = normalizePassport(str(form, "passportSeries"));
  const pinflRaw = normalizePassport(str(form, "pinfl"));

  return {
    passportSeries,
    pinfl: pinflRaw || null,
    fullName: str(form, "fullName"),
    phone: str(form, "phone") || null,
    birthDate: str(form, "birthDate") || null,
    facultyId: str(form, "facultyId") || null,
    facultyName: str(form, "facultyName") || null,
    program: str(form, "program"),
    course: Math.min(Math.max(Math.round(num(form, "course", 1)), 1), 7),
    groupName: str(form, "groupName"),
    eduForm: str(form, "eduForm") || "KUNDUZGI",
    eduType: str(form, "eduType") || "KONTRAKT",
    status: str(form, "status") || "STUDYING",
    statusNote: str(form, "statusNote") || null,
    debtSubjects: JSON.stringify(parseDebtLines(str(form, "debtSubjects"))),
    contractTotal: Math.max(0, num(form, "contractTotal")),
    contractPaid: Math.max(0, num(form, "contractPaid")),
    contractYear: str(form, "contractYear") || null,
    isActive: form.get("isActive") === "on",
  };
}

function validate(data: ReturnType<typeof buildData>): string | null {
  if (!data.fullName) return "F.I.O maydonini to'ldiring.";
  if (!data.passportSeries) return "Pasport seriyasini kiriting.";
  if (!isValidPassport(data.passportSeries))
    return "Pasport seriyasi noto'g'ri. Namuna: AA1234567 yoki 14 xonali JSHSHIR.";
  if (data.pinfl && !/^\d{14}$/.test(data.pinfl)) return "JSHSHIR 14 ta raqamdan iborat bo'lishi kerak.";
  if (!data.program) return "Ta'lim yo'nalishini kiriting.";
  if (!data.groupName) return "Guruh nomini kiriting.";
  if (data.contractPaid > data.contractTotal && data.contractTotal > 0)
    return "To'langan summa shartnoma summasidan katta bo'lishi mumkin emas.";
  return null;
}

export async function createStudentAction(
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  await requireSession();
  const data = buildData(form);
  const error = validate(data);
  if (error) return { error };

  const exists = await prisma.student.findFirst({
    where: {
      OR: [
        { passportSeries: data.passportSeries },
        ...(data.pinfl ? [{ pinfl: data.pinfl }] : []),
      ],
    },
  });
  if (exists) return { error: "Bu pasport seriyasi yoki JSHSHIR bazada mavjud." };

  const student = await prisma.student.create({ data });
  revalidatePath("/students");
  revalidatePath("/");
  redirect(`/students/${student.id}?ok=created`);
}

export async function updateStudentAction(
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  await requireSession();
  const id = str(form, "id");
  if (!id) return { error: "Talaba topilmadi." };

  const data = buildData(form);
  const error = validate(data);
  if (error) return { error };

  const conflict = await prisma.student.findFirst({
    where: {
      id: { not: id },
      OR: [
        { passportSeries: data.passportSeries },
        ...(data.pinfl ? [{ pinfl: data.pinfl }] : []),
      ],
    },
  });
  if (conflict) return { error: "Bu pasport seriyasi yoki JSHSHIR boshqa talabaga tegishli." };

  await prisma.student.update({ where: { id }, data });
  revalidatePath("/students");
  revalidatePath(`/students/${id}`);
  revalidatePath("/");
  return { ok: "Talaba ma'lumotlari saqlandi." };
}

export async function deleteStudentAction(form: FormData) {
  await requireSession();
  const id = String(form.get("id") ?? "");
  if (!id) return;

  await prisma.botUser.updateMany({
    where: { studentId: id },
    data: { studentId: null, isVerified: false, step: "PASSPORT" },
  });
  await prisma.student.delete({ where: { id } });

  revalidatePath("/students");
  revalidatePath("/");
  redirect("/students?ok=deleted");
}

/** CSV import: passport;fio;fakultet_kodi;yo'nalish;kurs;guruh;holat;shartnoma;to'langan */
export async function importStudentsAction(
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  await requireSession();
  const raw = str(form, "csv");
  if (!raw) return { error: "Import uchun ma'lumot kiritilmagan." };

  const faculties = await prisma.faculty.findMany();
  const byCode = new Map(faculties.map((f) => [f.code.toUpperCase(), f.id]));

  const lines = raw.split("\n").map((l) => l.trim()).filter(Boolean);
  let created = 0;
  let updated = 0;
  const errors: string[] = [];

  for (const [index, line] of lines.entries()) {
    if (index === 0 && /pasport|passport/i.test(line)) continue; // sarlavha qatori
    const cols = line.split(/[;\t]/).map((c) => c.trim());
    const [passport, fullName, facultyCode, program, course, groupName, status, total, paid] = cols;

    const normalized = normalizePassport(passport ?? "");
    if (!isValidPassport(normalized) || !fullName || !program || !groupName) {
      errors.push(`${index + 1}-qator: ma'lumot to'liq emas yoki pasport noto'g'ri`);
      continue;
    }

    const data = {
      passportSeries: normalized,
      fullName,
      facultyId: byCode.get((facultyCode ?? "").toUpperCase()) ?? null,
      facultyName: byCode.has((facultyCode ?? "").toUpperCase()) ? null : facultyCode || null,
      program,
      course: Math.min(Math.max(Number(course) || 1, 1), 7),
      groupName,
      status: status || "STUDYING",
      contractTotal: Number((total ?? "0").replace(/\s/g, "")) || 0,
      contractPaid: Number((paid ?? "0").replace(/\s/g, "")) || 0,
    };

    const existing = await prisma.student.findUnique({
      where: { passportSeries: normalized },
    });
    if (existing) {
      await prisma.student.update({ where: { id: existing.id }, data });
      updated += 1;
    } else {
      await prisma.student.create({ data });
      created += 1;
    }
  }

  revalidatePath("/students");
  revalidatePath("/");

  const summary = `${created} ta qo'shildi, ${updated} ta yangilandi.`;
  if (errors.length > 0) {
    return { ok: summary, error: `${errors.length} ta qatorda xato: ${errors.slice(0, 5).join("; ")}` };
  }
  return { ok: summary };
}
