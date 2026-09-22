"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Student } from "@prisma/client";
import {
  createStudentAction,
  updateStudentAction,
  type FormState,
} from "@/app/actions/students";
import { SubmitButton } from "@/components/client";
import { Alert, Card, Field } from "@/components/ui";
import {
  EDU_FORMS,
  EDU_FORM_LABELS,
  EDU_TYPES,
  EDU_TYPE_LABELS,
  STATUS_ADMIN_LABELS,
  STUDENT_STATUSES,
  parseDebtSubjects,
} from "@/lib/constants";

type Faculty = { id: string; nameUz: string; code: string };

function debtsToText(raw: string | undefined) {
  return parseDebtSubjects(raw)
    .map((d) => [d.name, d.credit ?? "", d.semester ?? ""].join(" | ").replace(/\s*\|\s*$/g, ""))
    .join("\n");
}

export function StudentForm({
  student,
  faculties,
}: {
  student?: Student;
  faculties: Faculty[];
}) {
  const isEdit = Boolean(student);
  const [state, formAction] = useActionState<FormState, FormData>(
    isEdit ? updateStudentAction : createStudentAction,
    {},
  );

  return (
    <form action={formAction} className="space-y-5">
      {student && <input type="hidden" name="id" value={student.id} />}

      {state.error && <Alert tone="danger">{state.error}</Alert>}
      {state.ok && <Alert tone="ok">{state.ok}</Alert>}

      {/* Shaxsiy ma'lumotlar */}
      <Card title="Shaxsiy ma'lumotlar" description="Bot aynan shu maydonlar bo'yicha aniqlaydi.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="F.I.O" required className="md:col-span-2">
            <input
              name="fullName"
              className="input"
              placeholder="Rahimov Aziz Bahodirovich"
              defaultValue={student?.fullName}
              required
            />
          </Field>

          <Field
            label="Pasport seriya va raqami"
            required
            hint="Namuna: AA1234567 — bot shu qiymat bo'yicha qidiradi"
          >
            <input
              name="passportSeries"
              className="input font-mono uppercase"
              placeholder="AA1234567"
              defaultValue={student?.passportSeries}
              required
            />
          </Field>

          <Field label="JSHSHIR (ixtiyoriy)" hint="14 xonali raqam — muqobil kirish usuli">
            <input
              name="pinfl"
              className="input font-mono"
              placeholder="31234567890123"
              maxLength={14}
              defaultValue={student?.pinfl ?? ""}
            />
          </Field>

          <Field label="Telefon raqami">
            <input
              name="phone"
              className="input"
              placeholder="+998 90 123-45-67"
              defaultValue={student?.phone ?? ""}
            />
          </Field>

          <Field label="Tug'ilgan sana">
            <input
              name="birthDate"
              className="input"
              placeholder="01.01.2005"
              defaultValue={student?.birthDate ?? ""}
            />
          </Field>
        </div>
      </Card>

      {/* O'quv ma'lumotlari */}
      <Card title="O'quv ma'lumotlari">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Fakultet" hint="Fakultet mas'ullari shu bog'lanish orqali topiladi">
            <select name="facultyId" className="input" defaultValue={student?.facultyId ?? ""}>
              <option value="">— Tanlanmagan —</option>
              {faculties.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nameUz}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Fakultet nomi (ro'yxatda bo'lmasa)">
            <input
              name="facultyName"
              className="input"
              placeholder="Masalan: Tibbiyot fakulteti"
              defaultValue={student?.facultyName ?? ""}
            />
          </Field>

          <Field label="Ta'lim yo'nalishi" required className="md:col-span-2">
            <input
              name="program"
              className="input"
              placeholder="Dasturiy injiniring"
              defaultValue={student?.program}
              required
            />
          </Field>

          <Field label="Kursi" required>
            <select name="course" className="input" defaultValue={String(student?.course ?? 1)}>
              {[1, 2, 3, 4, 5, 6, 7].map((c) => (
                <option key={c} value={c}>
                  {c}-kurs
                </option>
              ))}
            </select>
          </Field>

          <Field label="Guruhi" required hint="Kurator shu guruh nomi bo'yicha biriktiriladi">
            <input
              name="groupName"
              className="input uppercase"
              placeholder="IF-101"
              defaultValue={student?.groupName}
              required
            />
          </Field>

          <Field label="Ta'lim shakli">
            <select name="eduForm" className="input" defaultValue={student?.eduForm ?? "KUNDUZGI"}>
              {EDU_FORMS.map((f) => (
                <option key={f} value={f}>
                  {EDU_FORM_LABELS[f].uz}
                </option>
              ))}
            </select>
          </Field>

          <Field label="To'lov shakli">
            <select name="eduType" className="input" defaultValue={student?.eduType ?? "KONTRAKT"}>
              {EDU_TYPES.map((t) => (
                <option key={t} value={t}>
                  {EDU_TYPE_LABELS[t].uz}
                </option>
              ))}
            </select>
          </Field>
        </div>
      </Card>

      {/* Holati */}
      <Card
        title="Holati va qarzdorliklar"
        description="Bu ma'lumotlar botdagi «📊 Status» bo'limida ko'rsatiladi."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Talaba holati" required>
            <select name="status" className="input" defaultValue={student?.status ?? "STUDYING"}>
              {STUDENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_ADMIN_LABELS[s]}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Holat izohi" hint="Botda holat ostida kursiv matn sifatida chiqadi">
            <input
              name="statusNote"
              className="input"
              placeholder="Qarzdorlikni 15-fevralgacha yopish talab etiladi."
              defaultValue={student?.statusNote ?? ""}
            />
          </Field>

          <Field
            label="Qarzdor fanlar"
            className="md:col-span-2"
            hint="Har bir fan alohida qatorda. Format: Fan nomi | kredit | semestr"
          >
            <textarea
              name="debtSubjects"
              className="input min-h-[120px] font-mono text-[13px]"
              placeholder={"Diskret matematika | 5 | 2\nAlgoritmlar | 6 | 3"}
              defaultValue={debtsToText(student?.debtSubjects)}
            />
          </Field>
        </div>
      </Card>

      {/* Kontrakt */}
      <Card title="Kontrakt to'lovi" description="Qarzdorlik avtomatik hisoblanadi: summa − to'langan.">
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Shartnoma summasi (so'm)">
            <input
              name="contractTotal"
              className="input tabular-nums"
              inputMode="numeric"
              placeholder="18000000"
              defaultValue={student?.contractTotal ?? 0}
            />
          </Field>
          <Field label="To'langan summa (so'm)">
            <input
              name="contractPaid"
              className="input tabular-nums"
              inputMode="numeric"
              placeholder="9000000"
              defaultValue={student?.contractPaid ?? 0}
            />
          </Field>
          <Field label="O'quv yili">
            <input
              name="contractYear"
              className="input"
              placeholder="2025/2026 o'quv yili"
              defaultValue={student?.contractYear ?? ""}
            />
          </Field>
        </div>

        <label className="mt-4 flex items-center gap-2.5 text-sm text-slate-700">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={student?.isActive ?? true}
            className="h-4 w-4 rounded border-slate-300 accent-navy-800"
          />
          Faol — botda qidirilsin
        </label>
      </Card>

      <div className="flex items-center gap-3">
        <SubmitButton>{isEdit ? "O'zgarishlarni saqlash" : "Talabani qo'shish"}</SubmitButton>
        <Link href="/students" className="btn-ghost">
          Bekor qilish
        </Link>
      </div>
    </form>
  );
}
