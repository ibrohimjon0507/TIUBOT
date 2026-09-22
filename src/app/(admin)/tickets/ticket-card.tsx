"use client";

import { useActionState } from "react";
import type { BotUser, SupportTicket } from "@prisma/client";
import { replyTicketAction, updateTicketAction, type FormState } from "@/app/actions/users";
import { SubmitButton } from "@/components/client";
import { Alert, Badge, Card, Field } from "@/components/ui";
import { TICKET_STATUSES, TICKET_STATUS_LABELS } from "@/lib/constants";

const TONES: Record<string, string> = {
  NEW: "warn",
  IN_PROGRESS: "info",
  RESOLVED: "ok",
};

export function TicketCard({
  ticket,
}: {
  ticket: SupportTicket & { botUser: BotUser | null };
}) {
  const [state, replyAction] = useActionState<FormState, FormData>(replyTicketAction, {});

  const name =
    ticket.fullName ||
    [ticket.botUser?.firstName, ticket.botUser?.lastName].filter(Boolean).join(" ") ||
    "Noma'lum foydalanuvchi";

  return (
    <Card bodyClassName="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[15px] font-semibold text-navy-900">{name}</p>
            <Badge tone={TONES[ticket.status] ?? "muted"}>
              {TICKET_STATUS_LABELS[ticket.status] ?? ticket.status}
            </Badge>
          </div>
          <p className="mt-1 text-[12.5px] text-slate-500">
            {ticket.username ? `@${ticket.username}` : `ID: ${ticket.telegramId}`}
            {ticket.passport ? ` · Pasport: ${ticket.passport}` : ""} ·{" "}
            {ticket.createdAt.toLocaleString("uz-UZ", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>

        <form action={updateTicketAction} className="flex items-center gap-2">
          <input type="hidden" name="id" value={ticket.id} />
          <input type="hidden" name="adminNote" value={ticket.adminNote ?? ""} />
          <select name="status" defaultValue={ticket.status} className="input w-auto py-1.5 text-[13px]">
            {TICKET_STATUSES.map((s) => (
              <option key={s} value={s}>
                {TICKET_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <SubmitButton className="btn-ghost btn-sm" pendingText="…">
            Yangilash
          </SubmitButton>
        </form>
      </div>

      <div className="mt-4 rounded-lg bg-slate-50 p-4 text-[13.5px] leading-relaxed whitespace-pre-wrap text-slate-700">
        {ticket.message || "— matn kiritilmagan —"}
      </div>

      {ticket.adminNote && ticket.status === "RESOLVED" && (
        <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-[13px] text-emerald-800">
          <p className="mb-1 font-medium">Yuborilgan javob:</p>
          <p className="whitespace-pre-wrap">{ticket.adminNote}</p>
        </div>
      )}

      {ticket.status !== "RESOLVED" && (
        <form action={replyAction} className="mt-4 space-y-3">
          <input type="hidden" name="id" value={ticket.id} />
          {state.error && <Alert tone="danger">{state.error}</Alert>}
          {state.ok && <Alert tone="ok">{state.ok}</Alert>}

          <Field label="Botdan javob yuborish" hint="Javob yuborilgach murojaat «Hal qilindi» holatiga o'tadi">
            <textarea
              name="message"
              className="input min-h-[90px] text-[13px]"
              placeholder="Hurmatli talaba, ma'lumotlaringiz bazaga kiritildi. Botga qayta kiring…"
            />
          </Field>
          <SubmitButton className="btn-primary btn-sm" pendingText="Yuborilmoqda…">
            Javobni yuborish
          </SubmitButton>
        </form>
      )}
    </Card>
  );
}
