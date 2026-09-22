"use client";

import { useActionState, useState } from "react";
import { resetBotTextAction, saveBotTextAction, type FormState } from "@/app/actions/content";
import { SubmitButton } from "@/components/client";
import { Alert, Badge, Card } from "@/components/ui";

type Values = { uz: string; ru: string; en: string };

const LANGS = [
  { key: "uz" as const, flag: "🇺🇿", label: "O'zbekcha" },
  { key: "ru" as const, flag: "🇷🇺", label: "Русский" },
  { key: "en" as const, flag: "🇬🇧", label: "English" },
];

/** Telegram HTML'ini oldindan ko'rish uchun xavfsiz HTML'ga aylantiradi */
function renderPreview(raw: string) {
  const escaped = raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped
    .replace(/&lt;b&gt;(.*?)&lt;\/b&gt;/gs, "<strong>$1</strong>")
    .replace(/&lt;i&gt;(.*?)&lt;\/i&gt;/gs, "<em>$1</em>")
    .replace(/&lt;u&gt;(.*?)&lt;\/u&gt;/gs, "<u>$1</u>")
    .replace(
      /&lt;code&gt;(.*?)&lt;\/code&gt;/gs,
      '<code class="rounded bg-slate-100 px-1 py-0.5 text-[12px]">$1</code>',
    )
    .replace(
      /\{(\w+)\}/g,
      '<span class="rounded bg-amber-100 px-1 text-[12px] text-amber-800">{$1}</span>',
    );
}

export function TextEditor({
  textKey,
  note,
  current,
  defaults,
  backHref,
}: {
  textKey: string;
  note?: string;
  current: Values;
  defaults: Values;
  backHref: string;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(saveBotTextAction, {});
  const [values, setValues] = useState<Values>(current);
  const [tab, setTab] = useState<"uz" | "ru" | "en">("uz");

  const modified =
    current.uz !== defaults.uz || current.ru !== defaults.ru || current.en !== defaults.en;

  const placeholders = [...new Set(defaults.uz.match(/\{(\w+)\}/g) ?? [])];

  return (
    <div className="space-y-5">
      <Card
        title={textKey}
        description={note || "Bu matn botda foydalanuvchiga ko'rsatiladi."}
        actions={modified ? <Badge tone="info">O'zgartirilgan</Badge> : undefined}
      >
        <form action={formAction} className="space-y-4">
          <input type="hidden" name="key" value={textKey} />

          {state.error && <Alert tone="danger">{state.error}</Alert>}
          {state.ok && <Alert tone="ok">{state.ok}</Alert>}

          {/* Til tanlash */}
          <div className="inline-flex rounded-lg border border-[var(--border)] bg-slate-50 p-1">
            {LANGS.map((lang) => (
              <button
                key={lang.key}
                type="button"
                onClick={() => setTab(lang.key)}
                className={`rounded-md px-3.5 py-1.5 text-[13px] font-medium transition ${
                  tab === lang.key
                    ? "bg-white text-navy-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {lang.flag} {lang.label}
              </button>
            ))}
          </div>

          {/* Matn maydonlari — faqat tanlangani ko'rinadi, qolgani yuboriladi */}
          {LANGS.map((lang) => (
            <div key={lang.key} className={tab === lang.key ? "" : "hidden"}>
              <textarea
                name={lang.key}
                value={values[lang.key]}
                onChange={(e) => setValues((v) => ({ ...v, [lang.key]: e.target.value }))}
                className="input min-h-[190px] text-[13.5px] leading-relaxed"
              />
              <p className="mt-1.5 text-[12px] text-slate-400">
                {values[lang.key].length} belgi
                {lang.key !== "uz" && " · bo'sh qoldirilsa o'zbekcha matn ishlatiladi"}
              </p>
            </div>
          ))}

          <div className="flex flex-wrap items-center gap-2">
            <SubmitButton className="btn-primary">Saqlash</SubmitButton>
            <button
              type="submit"
              formAction={resetBotTextAction}
              className="btn-ghost"
              onClick={(event) => {
                if (!window.confirm("Standart matnga qaytarilsinmi?")) event.preventDefault();
              }}
            >
              Standart holatga qaytarish
            </button>
          </div>
        </form>
      </Card>

      <div className="grid gap-5 xl:grid-cols-2">
        {/* Jonli ko'rinish */}
        <Card title="Botda qanday ko'rinadi" bodyClassName="p-4">
          <div className="rounded-xl bg-[#e7edf3] p-3">
            <div
              className="whitespace-pre-wrap break-words rounded-xl rounded-tl-sm bg-white p-3 text-[13.5px] leading-relaxed text-slate-800 shadow-sm"
              dangerouslySetInnerHTML={{ __html: renderPreview(values[tab] || "—") }}
            />
          </div>
        </Card>

        {/* Yordam */}
        <Card title="Qo'llanma" bodyClassName="p-5 text-[13px] leading-relaxed text-slate-600">
          {placeholders.length > 0 ? (
            <>
              <p className="font-medium text-slate-700">O'rin egallovchilar</p>
              <p className="mt-1">
                Quyidagilar yuborilishdan oldin haqiqiy qiymat bilan almashtiriladi — ularni
                o'chirmang:
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {placeholders.map((p) => (
                  <code
                    key={p}
                    className="rounded bg-amber-100 px-1.5 py-0.5 text-[12px] text-amber-800"
                  >
                    {p}
                  </code>
                ))}
              </div>
            </>
          ) : (
            <p>Bu matnda o'rin egallovchilar yo'q.</p>
          )}

          <p className="mt-4 font-medium text-slate-700">Formatlash</p>
          <ul className="mt-1 space-y-1">
            <li>
              <code className="rounded bg-slate-100 px-1">&lt;b&gt;matn&lt;/b&gt;</code> — qalin
            </li>
            <li>
              <code className="rounded bg-slate-100 px-1">&lt;i&gt;matn&lt;/i&gt;</code> — kursiv
            </li>
            <li>
              <code className="rounded bg-slate-100 px-1">&lt;code&gt;matn&lt;/code&gt;</code> —
              nusxalanadigan matn
            </li>
            <li>
              <code className="rounded bg-slate-100 px-1">
                &lt;a href=&quot;…&quot;&gt;matn&lt;/a&gt;
              </code>{" "}
              — havola
            </li>
          </ul>
          <p className="mt-3 text-[12px] text-slate-400">
            Saqlangach o'zgarish botda 30 soniya ichida kuchga kiradi.
          </p>
        </Card>
      </div>
    </div>
  );
}
