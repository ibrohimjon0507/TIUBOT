"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { Faq } from "@prisma/client";
import { saveFaqAction, type FormState } from "@/app/actions/faq";
import { LangTabs, SubmitButton } from "@/components/client";
import { Alert, Card, Field } from "@/components/ui";

type Category = { id: string; titleUz: string; emoji: string };

export function FaqForm({ faq, categories }: { faq?: Faq; categories: Category[] }) {
  const [state, formAction] = useActionState<FormState, FormData>(saveFaqAction, {});

  return (
    <form action={formAction} className="space-y-5">
      {faq && <input type="hidden" name="id" value={faq.id} />}
      {state.error && <Alert tone="danger">{state.error}</Alert>}
      {state.ok && <Alert tone="ok">{state.ok}</Alert>}

      <Card title="Savol" description="Tugmada ko'rinadigan matn — qisqa va aniq bo'lsin.">
        <LangTabs
          uz={
            <textarea
              name="questionUz"
              className="input min-h-[70px]"
              placeholder="Dars jadvalini qayerdan ko'rishim mumkin?"
              defaultValue={faq?.questionUz}
                          />
          }
          ru={
            <textarea
              name="questionRu"
              className="input min-h-[70px]"
              placeholder="Где посмотреть расписание занятий?"
              defaultValue={faq?.questionRu}
            />
          }
          en={
            <textarea
              name="questionEn"
              className="input min-h-[70px]"
              placeholder="Where can I see the class timetable?"
              defaultValue={faq?.questionEn}
            />
          }
        />
      </Card>

      <Card
        title="Javob"
        description="HTML formatlash qo'llab-quvvatlanadi: <b>qalin</b>, <i>kursiv</i>, <code>kod</code>, <a href=''>havola</a>."
      >
        <LangTabs
          uz={
            <textarea
              name="answerUz"
              className="input min-h-[220px] text-[13px] leading-relaxed"
              placeholder="Dars jadvali <b>HEMIS</b> tizimida joylashgan…"
              defaultValue={faq?.answerUz}
                          />
          }
          ru={
            <textarea
              name="answerRu"
              className="input min-h-[220px] text-[13px] leading-relaxed"
              placeholder="Расписание размещено в системе <b>HEMIS</b>…"
              defaultValue={faq?.answerRu}
            />
          }
          en={
            <textarea
              name="answerEn"
              className="input min-h-[220px] text-[13px] leading-relaxed"
              placeholder="The timetable is available in the <b>HEMIS</b> system…"
              defaultValue={faq?.answerEn}
            />
          }
        />
      </Card>

      <Card title="Sozlamalar">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Kategoriya" hint="Tanlanmasa — umumiy ro'yxatda ko'rinadi">
            <select name="categoryId" className="input" defaultValue={faq?.categoryId ?? ""}>
              <option value="">— Kategoriyasiz —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.titleUz}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tartib raqami" hint="Kichik raqam yuqorida turadi">
            <input name="sort" type="number" className="input" defaultValue={faq?.sort ?? 0} />
          </Field>
        </div>

        <label className="mt-4 flex items-center gap-2.5 text-sm text-slate-700">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={faq?.isActive ?? true}
            className="h-4 w-4 rounded border-slate-300 accent-navy-800"
          />
          Faol — botda ko'rsatilsin
        </label>
      </Card>

      <div className="flex items-center gap-3">
        <SubmitButton>{faq ? "O'zgarishlarni saqlash" : "Savolni qo'shish"}</SubmitButton>
        <Link href="/faq" className="btn-ghost">
          Bekor qilish
        </Link>
      </div>
    </form>
  );
}
