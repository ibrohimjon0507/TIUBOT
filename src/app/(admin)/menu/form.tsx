"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import type { MenuButton } from "@prisma/client";
import { saveMenuButtonAction, type FormState } from "@/app/actions/menu";
import { LangTabs, SubmitButton } from "@/components/client";
import { Alert, Card, Field } from "@/components/ui";
import {
  BUILTIN_ACTIONS,
  BUILTIN_ACTION_LABELS,
  BUTTON_TYPES,
  BUTTON_TYPE_LABELS,
} from "@/lib/menu";

const TYPE_HINTS: Record<string, string> = {
  BUILTIN: "Botning tayyor bo'limlaridan birini ochadi (Status, Savol-javoblar va h.k.).",
  TEXT: "Bosilganda siz yozgan matnni yuboradi — e'lon, manzil, ish vaqti va hokazo.",
  LINK: "Matn yuboradi va ostida «Batafsil» havola tugmasi chiqadi.",
  WEBAPP: "Telegram ichida veb sahifani ochadi (faqat https manzil).",
};

export function MenuButtonForm({ button }: { button?: MenuButton }) {
  const [state, formAction] = useActionState<FormState, FormData>(saveMenuButtonAction, {});
  const [type, setType] = useState(button?.type ?? "BUILTIN");

  const needsContent = type === "TEXT" || type === "LINK";
  const needsUrl = type === "LINK" || type === "WEBAPP";

  return (
    <Card
      title={button ? "Tugmani tahrirlash" : "Yangi tugma"}
      description="Tugma nomi foydalanuvchi tanlagan tilda ko'rsatiladi."
      actions={
        button ? (
          <Link href="/menu" className="text-[13px] text-slate-500 hover:underline">
            Bekor qilish
          </Link>
        ) : undefined
      }
    >
      <form action={formAction} className="space-y-4">
        {button && <input type="hidden" name="id" value={button.id} />}
        {state.error && <Alert tone="danger">{state.error}</Alert>}
        {state.ok && <Alert tone="ok">{state.ok}</Alert>}

        <LangTabs
          label="Tugma nomi"
          uz={
            <input
              name="labelUz"
              className="input"
              placeholder="📊 Status"
              defaultValue={button?.labelUz}
                          />
          }
          ru={
            <input
              name="labelRu"
              className="input"
              placeholder="📊 Статус"
              defaultValue={button?.labelRu}
            />
          }
          en={
            <input
              name="labelEn"
              className="input"
              placeholder="📊 Status"
              defaultValue={button?.labelEn}
            />
          }
        />

        <Field label="Tugma turi" required hint={TYPE_HINTS[type]}>
          <select
            name="type"
            className="input"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {BUTTON_TYPES.map((t) => (
              <option key={t} value={t}>
                {BUTTON_TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </Field>

        {type === "BUILTIN" && (
          <Field label="Qaysi bo'lim ochilsin" required>
            <select name="action" className="input" defaultValue={button?.action ?? "status"}>
              {BUILTIN_ACTIONS.map((a) => (
                <option key={a} value={a}>
                  {BUILTIN_ACTION_LABELS[a]}
                </option>
              ))}
            </select>
          </Field>
        )}

        {needsContent && (
          <LangTabs
            label="Bosilganda chiqadigan matn"
            uz={
              <textarea
                name="contentUz"
                className="input min-h-[140px] text-[13px] leading-relaxed"
                placeholder="📍 <b>Manzil:</b> Toshkent sh., ..."
                defaultValue={button?.contentUz ?? ""}
              />
            }
            ru={
              <textarea
                name="contentRu"
                className="input min-h-[140px] text-[13px] leading-relaxed"
                defaultValue={button?.contentRu ?? ""}
              />
            }
            en={
              <textarea
                name="contentEn"
                className="input min-h-[140px] text-[13px] leading-relaxed"
                defaultValue={button?.contentEn ?? ""}
              />
            }
          />
        )}

        {needsUrl && (
          <Field
            label="Havola"
            required
            hint="Telegram faqat https manzillarni qabul qiladi."
          >
            <input
              name="url"
              type="url"
              className="input"
              placeholder="https://tiu.uz"
              defaultValue={button?.url ?? ""}
            />
          </Field>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Field label="Qator" hint="0, 1, 2… — kichik raqam yuqorida">
            <input name="row" type="number" min={0} className="input" defaultValue={button?.row ?? 0} />
          </Field>
          <Field label="Qatordagi o'rni" hint="Bir xil qatorda chapdan o'ngga">
            <input name="sort" type="number" min={0} className="input" defaultValue={button?.sort ?? 0} />
          </Field>
        </div>

        <label className="flex items-center gap-2.5 text-sm text-slate-700">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={button?.isActive ?? true}
            className="h-4 w-4 rounded border-slate-300 accent-navy-800"
          />
          Faol — botda ko'rsatilsin
        </label>

        <SubmitButton className="btn-primary w-full">
          {button ? "O'zgarishlarni saqlash" : "Tugma qo'shish"}
        </SubmitButton>
      </form>
    </Card>
  );
}
