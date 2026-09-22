"use client";

import { useActionState, useState } from "react";
import { sendBroadcastAction, type FormState } from "@/app/actions/users";
import { LangTabs, SubmitButton } from "@/components/client";
import { Alert, Card, Field } from "@/components/ui";
import { STATUS_ADMIN_LABELS, STUDENT_STATUSES } from "@/lib/constants";

const TARGETS = [
  { value: "ALL", label: "Barcha foydalanuvchilar" },
  { value: "VERIFIED", label: "Faqat tasdiqlangan talabalar" },
  { value: "UNVERIFIED", label: "Tasdiqlanmagan foydalanuvchilar" },
  { value: "FACULTY", label: "Fakultet bo'yicha" },
  { value: "COURSE", label: "Kurs bo'yicha" },
  { value: "GROUP", label: "Guruh bo'yicha" },
  { value: "STATUS", label: "Talaba holati bo'yicha" },
];

export function BroadcastForm({
  faculties,
  allCount,
  verifiedCount,
}: {
  faculties: { id: string; nameUz: string }[];
  allCount: number;
  verifiedCount: number;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(sendBroadcastAction, {});
  const [target, setTarget] = useState("ALL");

  const estimate =
    target === "ALL" ? allCount : target === "VERIFIED" ? verifiedCount : null;

  return (
    <form action={formAction} className="space-y-5">
      {state.error && <Alert tone="danger">{state.error}</Alert>}
      {state.ok && <Alert tone="ok">{state.ok}</Alert>}

      <Card
        title="Xabar matni"
        description="HTML formatlash: <b>qalin</b>, <i>kursiv</i>, <a href=''>havola</a>."
      >
        <LangTabs
          uz={
            <textarea
              name="textUz"
              className="input min-h-[180px] text-[13px] leading-relaxed"
              placeholder="📢 Hurmatli talabalar! 15-fevral kuni…"
            />
          }
          ru={
            <textarea
              name="textRu"
              className="input min-h-[180px] text-[13px] leading-relaxed"
              placeholder="📢 Уважаемые студенты! 15 февраля…"
            />
          }
          en={
            <textarea
              name="textEn"
              className="input min-h-[180px] text-[13px] leading-relaxed"
              placeholder="📢 Dear students! On 15 February…"
            />
          }
        />
        <p className="mt-3 text-[12px] text-slate-400">
          Rus va ingliz tili bo'sh qoldirilsa — o'zbekcha matn yuboriladi.
        </p>
      </Card>

      <Card title="Kimga yuborilsin">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Qabul qiluvchilar">
            <select
              name="target"
              className="input"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            >
              {TARGETS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </Field>

          {target === "FACULTY" && (
            <Field label="Fakultet" required>
              <select name="targetValue" className="input" required>
                {faculties.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.nameUz}
                  </option>
                ))}
              </select>
            </Field>
          )}

          {target === "COURSE" && (
            <Field label="Kurs" required>
              <select name="targetValue" className="input" required>
                {[1, 2, 3, 4, 5, 6].map((c) => (
                  <option key={c} value={c}>
                    {c}-kurs
                  </option>
                ))}
              </select>
            </Field>
          )}

          {target === "GROUP" && (
            <Field label="Guruh nomi" required>
              <input
                name="targetValue"
                className="input uppercase"
                placeholder="IF-101"
                required
              />
            </Field>
          )}

          {target === "STATUS" && (
            <Field label="Talaba holati" required>
              <select name="targetValue" className="input" required>
                {STUDENT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_ADMIN_LABELS[s]}
                  </option>
                ))}
              </select>
            </Field>
          )}
        </div>

        {estimate !== null && (
          <p className="mt-4 rounded-lg bg-navy-50 px-4 py-3 text-[13px] text-navy-800">
            Taxminan <b>{estimate}</b> ta foydalanuvchiga yuboriladi. Telegram cheklovi sababli
            yuborish biroz vaqt oladi — sahifani yopmang.
          </p>
        )}
      </Card>

      <SubmitButton
        pendingText="Yuborilmoqda… sahifani yopmang"
        confirm="Xabar tanlangan barcha foydalanuvchilarga yuborilsinmi?"
      >
        📢 Xabarni yuborish
      </SubmitButton>
    </form>
  );
}
