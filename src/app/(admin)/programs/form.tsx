"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { StudyAbroadProgram } from "@prisma/client";
import { saveProgramAction, type FormState } from "@/app/actions/programs";
import { LangTabs, SubmitButton } from "@/components/client";
import { Alert, Card, Field } from "@/components/ui";

export function ProgramForm({ program }: { program?: StudyAbroadProgram }) {
  const [state, formAction] = useActionState<FormState, FormData>(saveProgramAction, {});

  return (
    <form action={formAction} className="space-y-5">
      {program && <input type="hidden" name="id" value={program.id} />}
      {state.error && <Alert tone="danger">{state.error}</Alert>}
      {state.ok && <Alert tone="ok">{state.ok}</Alert>}

      <Card title="Asosiy ma'lumot">
        <div className="grid gap-4 sm:grid-cols-[100px_1fr]">
          <Field label="Bayroq">
            <input
              name="flag"
              className="input text-center text-xl"
              placeholder="🇰🇷"
              maxLength={8}
              defaultValue={program?.flag ?? "🌍"}
            />
          </Field>
          <Field label="Mamlakat" required>
            <input
              name="country"
              className="input"
              placeholder="Janubiy Koreya"
              defaultValue={program?.country}
              required
            />
          </Field>
        </div>

        <div className="mt-4">
          <LangTabs
            label="Dastur nomi"
            uz={
              <input
                name="titleUz"
                className="input"
                placeholder="Double Degree — Woosong University"
                defaultValue={program?.titleUz}
                              />
            }
            ru={
              <input
                name="titleRu"
                className="input"
                placeholder="Двойной диплом — Woosong University"
                defaultValue={program?.titleRu}
              />
            }
            en={
              <input
                name="titleEn"
                className="input"
                placeholder="Double Degree — Woosong University"
                defaultValue={program?.titleEn}
              />
            }
          />
        </div>

        <Field label="Hamkor universitet" className="mt-4">
          <input
            name="universityName"
            className="input"
            placeholder="Woosong University, Daejeon"
            defaultValue={program?.universityName ?? ""}
          />
        </Field>
      </Card>

      <Card title="Tavsif" description="HTML formatlash: <b>qalin</b>, <i>kursiv</i>.">
        <LangTabs
          uz={
            <textarea
              name="descriptionUz"
              className="input min-h-[150px] text-[13px] leading-relaxed"
              placeholder="2+2 dasturi: dastlabki 2 yil TIU'da…"
              defaultValue={program?.descriptionUz}
                          />
          }
          ru={
            <textarea
              name="descriptionRu"
              className="input min-h-[150px] text-[13px] leading-relaxed"
              defaultValue={program?.descriptionRu}
            />
          }
          en={
            <textarea
              name="descriptionEn"
              className="input min-h-[150px] text-[13px] leading-relaxed"
              defaultValue={program?.descriptionEn}
            />
          }
        />
      </Card>

      <Card title="Davomiyligi">
        <LangTabs
          uz={
            <input
              name="durationUz"
              className="input"
              placeholder="2 yil (3–4 kurs)"
              defaultValue={program?.durationUz ?? ""}
            />
          }
          ru={
            <input
              name="durationRu"
              className="input"
              placeholder="2 года (3–4 курс)"
              defaultValue={program?.durationRu ?? ""}
            />
          }
          en={
            <input
              name="durationEn"
              className="input"
              placeholder="2 years (years 3–4)"
              defaultValue={program?.durationEn ?? ""}
            />
          }
        />
      </Card>

      <Card title="Talablar" description="Har bir talabni yangi qatordan «•» bilan yozing.">
        <LangTabs
          uz={
            <textarea
              name="requirementsUz"
              className="input min-h-[120px] text-[13px]"
              placeholder={"• GPA 3.0 va undan yuqori\n• IELTS 5.5"}
              defaultValue={program?.requirementsUz ?? ""}
            />
          }
          ru={
            <textarea
              name="requirementsRu"
              className="input min-h-[120px] text-[13px]"
              defaultValue={program?.requirementsRu ?? ""}
            />
          }
          en={
            <textarea
              name="requirementsEn"
              className="input min-h-[120px] text-[13px]"
              defaultValue={program?.requirementsEn ?? ""}
            />
          }
        />
      </Card>

      <Card title="Qo'shimcha">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Ariza muddati">
            <input
              name="deadline"
              className="input"
              placeholder="Har yili 15-mart"
              defaultValue={program?.deadline ?? ""}
            />
          </Field>
          <Field label="Bog'lanish">
            <input
              name="contactInfo"
              className="input"
              placeholder="Xalqaro aloqalar bo'limi: +998 71 200-00-20"
              defaultValue={program?.contactInfo ?? ""}
            />
          </Field>
          <Field label="Havola" hint="Botda «🔗 Batafsil» tugmasi sifatida chiqadi">
            <input
              name="link"
              type="url"
              className="input"
              placeholder="https://tiu.uz/international"
              defaultValue={program?.link ?? ""}
            />
          </Field>
          <Field label="Tartib raqami">
            <input name="sort" type="number" className="input" defaultValue={program?.sort ?? 0} />
          </Field>
        </div>

        <label className="mt-4 flex items-center gap-2.5 text-sm text-slate-700">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={program?.isActive ?? true}
            className="h-4 w-4 rounded border-slate-300 accent-navy-800"
          />
          Faol — botda ko'rsatilsin
        </label>
      </Card>

      <div className="flex items-center gap-3">
        <SubmitButton>{program ? "O'zgarishlarni saqlash" : "Dasturni qo'shish"}</SubmitButton>
        <Link href="/programs" className="btn-ghost">
          Bekor qilish
        </Link>
      </div>
    </form>
  );
}
