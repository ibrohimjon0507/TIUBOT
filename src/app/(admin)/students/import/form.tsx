"use client";

import { useActionState, useRef } from "react";
import { importStudentsAction, type FormState } from "@/app/actions/students";
import { SubmitButton } from "@/components/client";
import { Alert, Card, Field } from "@/components/ui";

const SAMPLE = `pasport;fio;fakultet_kodi;yonalish;kurs;guruh;holat;shartnoma;tolangan
AA1234567;Rahimov Aziz Bahodirovich;IT;Dasturiy injiniring;1;IF-101;STUDYING;18000000;18000000
AB7654321;Yusupova Zilola Akmalovna;IT;Kompyuter injiniringi;2;IF-201;DEBT_SUBJECTS;18000000;9000000`;

export function ImportForm() {
  const [state, formAction] = useActionState<FormState, FormData>(importStudentsAction, {});
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !textareaRef.current) return;
    textareaRef.current.value = await file.text();
  }

  return (
    <form action={formAction} className="space-y-5">
      {state.ok && <Alert tone="ok">{state.ok}</Alert>}
      {state.error && <Alert tone="danger">{state.error}</Alert>}

      <Card
        title="Ma'lumotlarni joylashtiring"
        description="Ustunlar `;` yoki tab bilan ajratiladi. Birinchi sarlavha qatori avtomatik o'tkazib yuboriladi."
      >
        <Field label="CSV fayl tanlash (ixtiyoriy)">
          <input
            type="file"
            accept=".csv,.txt,text/csv,text/plain"
            onChange={handleFile}
            className="input file:mr-3 file:rounded-md file:border-0 file:bg-navy-50 file:px-3 file:py-1.5 file:text-[13px] file:font-medium file:text-navy-800"
          />
        </Field>

        <Field
          label="Ma'lumotlar"
          className="mt-4"
          required
          hint="Mavjud pasport seriyasi topilsa — ma'lumot yangilanadi, aks holda yangi talaba yaratiladi."
        >
          <textarea
            ref={textareaRef}
            name="csv"
            className="input min-h-[260px] font-mono text-[12.5px]"
            placeholder={SAMPLE}
            required
          />
        </Field>
      </Card>

      <Card title="Ustunlar tartibi">
        <ol className="grid gap-2 text-[13px] text-slate-600 sm:grid-cols-3">
          {[
            "pasport — AA1234567",
            "fio — to'liq ism",
            "fakultet_kodi — IT, ECON, PHIL, LAW",
            "yonalish — ta'lim yo'nalishi",
            "kurs — 1…7",
            "guruh — IF-101",
            "holat — STUDYING, DEBT_SUBJECTS, THREE_DEBTS, REPEAT_YEAR, EXPELLED",
            "shartnoma — summa (so'm)",
            "tolangan — summa (so'm)",
          ].map((item, i) => (
            <li key={item} className="flex gap-2">
              <span className="text-slate-400">{i + 1}.</span>
              <span>{item}</span>
            </li>
          ))}
        </ol>
      </Card>

      <SubmitButton pendingText="Import qilinmoqda…">Import qilish</SubmitButton>
    </form>
  );
}
