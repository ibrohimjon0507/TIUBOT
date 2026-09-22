"use client";

import { useActionState } from "react";
import type { Faculty } from "@prisma/client";
import { saveFacultyAction, type FormState } from "@/app/actions/faculties";
import { LangTabs, SubmitButton } from "@/components/client";
import { Alert, Card, Field } from "@/components/ui";

export function FacultyForm({ faculty }: { faculty?: Faculty }) {
  const [state, formAction] = useActionState<FormState, FormData>(saveFacultyAction, {});

  return (
    <Card
      title={faculty ? "Fakultetni tahrirlash" : "Yangi fakultet"}
      description="Nomlar uchta tilda saqlanadi — bot foydalanuvchi tiliga mos ko'rsatadi."
    >
      <form action={formAction} className="space-y-4">
        {faculty && <input type="hidden" name="id" value={faculty.id} />}
        {state.error && <Alert tone="danger">{state.error}</Alert>}
        {state.ok && <Alert tone="ok">{state.ok}</Alert>}

        <LangTabs
          label="Fakultet nomi"
          uz={
            <input
              name="nameUz"
              className="input"
              placeholder="Axborot texnologiyalari fakulteti"
              defaultValue={faculty?.nameUz}
                          />
          }
          ru={
            <input
              name="nameRu"
              className="input"
              placeholder="Факультет информационных технологий"
              defaultValue={faculty?.nameRu}
            />
          }
          en={
            <input
              name="nameEn"
              className="input"
              placeholder="Faculty of Information Technologies"
              defaultValue={faculty?.nameEn}
            />
          }
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Kod" required hint="CSV importda ishlatiladi">
            <input
              name="code"
              className="input uppercase"
              placeholder="IT"
              defaultValue={faculty?.code}
              required
            />
          </Field>
          <Field label="Tartib raqami">
            <input
              name="sort"
              className="input"
              type="number"
              defaultValue={faculty?.sort ?? 0}
            />
          </Field>
        </div>

        <label className="flex items-center gap-2.5 text-sm text-slate-700">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={faculty?.isActive ?? true}
            className="h-4 w-4 rounded border-slate-300 accent-navy-800"
          />
          Faol
        </label>

        <SubmitButton className="btn-primary w-full">
          {faculty ? "Saqlash" : "Fakultet qo'shish"}
        </SubmitButton>
      </form>
    </Card>
  );
}
