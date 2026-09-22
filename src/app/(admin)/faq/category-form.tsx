"use client";

import { useActionState } from "react";
import Link from "next/link";
import type { FaqCategory } from "@prisma/client";
import { saveFaqCategoryAction, type FormState } from "@/app/actions/faq";
import { LangTabs, SubmitButton } from "@/components/client";
import { Alert, Card, Field } from "@/components/ui";

export function FaqCategoryForm({ category }: { category?: FaqCategory }) {
  const [state, formAction] = useActionState<FormState, FormData>(saveFaqCategoryAction, {});

  return (
    <Card
      title={category ? "Kategoriyani tahrirlash" : "Yangi kategoriya"}
      description="Botda savollar shu kategoriyalar ostida guruhlanadi."
      actions={
        category ? (
          <Link href="/faq" className="text-[13px] text-slate-500 hover:underline">
            Bekor qilish
          </Link>
        ) : undefined
      }
    >
      <form action={formAction} className="space-y-4">
        {category && <input type="hidden" name="id" value={category.id} />}
        {state.error && <Alert tone="danger">{state.error}</Alert>}
        {state.ok && <Alert tone="ok">{state.ok}</Alert>}

        <LangTabs
          label="Kategoriya nomi"
          uz={
            <input
              name="titleUz"
              className="input"
              placeholder="O'quv jarayoni"
              defaultValue={category?.titleUz}
              required
            />
          }
          ru={
            <input
              name="titleRu"
              className="input"
              placeholder="Учебный процесс"
              defaultValue={category?.titleRu}
            />
          }
          en={
            <input
              name="titleEn"
              className="input"
              placeholder="Academic process"
              defaultValue={category?.titleEn}
            />
          }
        />

        <div className="grid grid-cols-2 gap-4">
          <Field label="Emoji" hint="Tugmada nom oldidan chiqadi">
            <input
              name="emoji"
              className="input text-center text-lg"
              placeholder="📚"
              maxLength={4}
              defaultValue={category?.emoji ?? "📌"}
            />
          </Field>
          <Field label="Tartib raqami">
            <input
              name="sort"
              type="number"
              className="input"
              defaultValue={category?.sort ?? 0}
            />
          </Field>
        </div>

        <label className="flex items-center gap-2.5 text-sm text-slate-700">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={category?.isActive ?? true}
            className="h-4 w-4 rounded border-slate-300 accent-navy-800"
          />
          Faol — botda ko'rsatilsin
        </label>

        <SubmitButton className="btn-primary w-full">
          {category ? "Saqlash" : "Kategoriya qo'shish"}
        </SubmitButton>
      </form>
    </Card>
  );
}
