"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import type { FacultyStaff } from "@prisma/client";
import { saveStaffAction, type FormState } from "@/app/actions/faculties";
import { LangTabs, SubmitButton } from "@/components/client";
import { Alert, Card, Field } from "@/components/ui";
import { STAFF_ROLES, STAFF_ROLE_ADMIN_LABELS } from "@/lib/constants";

export function StaffForm({
  facultyId,
  staff,
}: {
  facultyId: string;
  staff?: FacultyStaff;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(saveStaffAction, {});
  const [role, setRole] = useState(staff?.role ?? "CURATOR");

  return (
    <Card
      title={staff ? "Mas'ul xodimni tahrirlash" : "Yangi mas'ul xodim"}
      description="Ma'lumotlar botda vizitka ko'rinishida chiqadi."
      actions={
        staff ? (
          <Link href={`/faculties/${facultyId}`} className="text-[13px] text-slate-500 hover:underline">
            Bekor qilish
          </Link>
        ) : undefined
      }
    >
      <form action={formAction} className="space-y-4">
        <input type="hidden" name="facultyId" value={facultyId} />
        {staff && <input type="hidden" name="id" value={staff.id} />}

        {state.error && <Alert tone="danger">{state.error}</Alert>}
        {state.ok && <Alert tone="ok">{state.ok}</Alert>}

        <Field label="Bo'lim (rol)" required>
          <select
            name="role"
            className="input"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            {STAFF_ROLES.map((r) => (
              <option key={r} value={r}>
                {STAFF_ROLE_ADMIN_LABELS[r]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="F.I.O" required>
          <input
            name="fullName"
            className="input"
            placeholder="Aliyev Sardor Baxtiyorovich"
            defaultValue={staff?.fullName}
            required
          />
        </Field>

        <LangTabs
          label="Lavozimi"
          uz={
            <input
              name="positionUz"
              className="input"
              placeholder="Katta o'qituvchi, guruh murabbiysi"
              defaultValue={staff?.positionUz}
            />
          }
          ru={
            <input
              name="positionRu"
              className="input"
              placeholder="Старший преподаватель, куратор"
              defaultValue={staff?.positionRu}
            />
          }
          en={
            <input
              name="positionEn"
              className="input"
              placeholder="Senior lecturer, group curator"
              defaultValue={staff?.positionEn}
            />
          }
        />

        {role === "CURATOR" && (
          <Field
            label="Biriktirilgan guruhlar"
            hint="Vergul bilan ajrating: IF-101, IF-102. Talabaning guruhiga mos keladigani ko'rsatiladi."
          >
            <input
              name="groupNames"
              className="input uppercase"
              placeholder="IF-101, IF-102"
              defaultValue={staff?.groupNames ?? ""}
            />
          </Field>
        )}

        {role === "VICE_DEAN" && (
          <Field label="Mas'ul kurs" hint="Bo'sh qoldirilsa — barcha kurslar uchun ko'rsatiladi">
            <select name="course" className="input" defaultValue={staff?.course ?? ""}>
              <option value="">Barcha kurslar</option>
              {[1, 2, 3, 4, 5, 6].map((c) => (
                <option key={c} value={c}>
                  {c}-kurs
                </option>
              ))}
            </select>
          </Field>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Telefon">
            <input
              name="phone"
              className="input"
              placeholder="+998 90 123-45-67"
              defaultValue={staff?.phone ?? ""}
            />
          </Field>
          <Field label="Telegram">
            <input
              name="telegram"
              className="input"
              placeholder="@username"
              defaultValue={staff?.telegram ?? ""}
            />
          </Field>
          <Field label="E-mail">
            <input
              name="email"
              type="email"
              className="input"
              placeholder="dean.it@tiu.uz"
              defaultValue={staff?.email ?? ""}
            />
          </Field>
          <Field label="Xona / bino">
            <input
              name="room"
              className="input"
              placeholder="A binosi, 301-xona"
              defaultValue={staff?.room ?? ""}
            />
          </Field>
          <Field label="Qabul vaqti" className="sm:col-span-2">
            <input
              name="workHours"
              className="input"
              placeholder="Dush–Juma, 09:00–17:00"
              defaultValue={staff?.workHours ?? ""}
            />
          </Field>
          <Field label="Tartib raqami">
            <input name="sort" type="number" className="input" defaultValue={staff?.sort ?? 0} />
          </Field>
        </div>

        <label className="flex items-center gap-2.5 text-sm text-slate-700">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={staff?.isActive ?? true}
            className="h-4 w-4 rounded border-slate-300 accent-navy-800"
          />
          Faol — botda ko'rsatilsin
        </label>

        <SubmitButton className="btn-primary w-full">
          {staff ? "O'zgarishlarni saqlash" : "Mas'ul xodim qo'shish"}
        </SubmitButton>
      </form>
    </Card>
  );
}
