"use client";

import { useActionState } from "react";
import {
  markMessagesReadAction,
  replyStaffMessageAction,
  type FormState,
} from "@/app/actions/users";
import { SubmitButton } from "@/components/client";
import { Alert, Badge, Card } from "@/components/ui";

export type ConversationMessage = {
  id: string;
  direction: string;
  text: string;
  replierName: string | null;
  createdAt: string;
};

function formatTime(value: string) {
  return new Date(value).toLocaleString("uz-UZ", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function Conversation({
  botUserId,
  staffId,
  staffName,
  staffRole,
  studentName,
  studentMeta,
  username,
  unread,
  messages,
}: {
  botUserId: string;
  staffId: string | null;
  staffName: string;
  staffRole: string | null;
  studentName: string;
  studentMeta: string;
  username: string | null;
  unread: number;
  messages: ConversationMessage[];
}) {
  const [state, formAction] = useActionState<FormState, FormData>(replyStaffMessageAction, {});

  return (
    <Card bodyClassName="p-0">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-2 text-[15px] font-semibold text-navy-900">
            {studentName}
            {unread > 0 && <Badge tone="warn">{unread} ta javobsiz</Badge>}
          </p>
          <p className="mt-0.5 text-[12.5px] text-slate-500">
            {studentMeta}
            {username ? ` · @${username}` : ""}
          </p>
          <p className="mt-1 text-[12.5px] text-slate-500">
            ➜ <b className="text-slate-700">{staffName}</b>
            {staffRole ? ` · ${staffRole}` : ""}
          </p>
        </div>

        {unread > 0 && (
          <form action={markMessagesReadAction}>
            <input type="hidden" name="botUserId" value={botUserId} />
            <SubmitButton className="btn-ghost btn-sm" pendingText="…">
              O'qilgan deb belgilash
            </SubmitButton>
          </form>
        )}
      </div>

      {/* Yozishma */}
      <div className="space-y-3 bg-[#f7f9fc] px-5 py-4">
        {messages.map((message) => {
          const incoming = message.direction === "IN";
          return (
            <div
              key={message.id}
              className={`flex ${incoming ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-[13.5px] leading-relaxed shadow-sm ${
                  incoming
                    ? "rounded-tl-sm bg-white text-slate-800 ring-1 ring-slate-200"
                    : "rounded-tr-sm bg-navy-800 text-white"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{message.text}</p>
                <p
                  className={`mt-1.5 text-[11px] ${incoming ? "text-slate-400" : "text-navy-200"}`}
                >
                  {incoming ? studentName : (message.replierName ?? staffName)} ·{" "}
                  {formatTime(message.createdAt)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Javob */}
      <form action={formAction} className="space-y-3 border-t border-[var(--border)] px-5 py-4">
        <input type="hidden" name="botUserId" value={botUserId} />
        <input type="hidden" name="staffId" value={staffId ?? ""} />

        {state.error && <Alert tone="danger">{state.error}</Alert>}
        {state.ok && <Alert tone="ok">{state.ok}</Alert>}

        <textarea
          name="text"
          className="input min-h-[80px] text-[13px]"
          placeholder={`${studentName}ga javob yozing — xabar botda "${staffName}" nomidan yetkaziladi…`}
        />
        <SubmitButton className="btn-primary btn-sm" pendingText="Yuborilmoqda…">
          Javobni yuborish
        </SubmitButton>
      </form>
    </Card>
  );
}
