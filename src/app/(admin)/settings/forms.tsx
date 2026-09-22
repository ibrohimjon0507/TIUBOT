"use client";

import { useActionState } from "react";
import {
  changePasswordAction,
  createAdminAction,
  deleteWebhookAction,
  generateLinkCodeAction,
  saveSettingsAction,
  setWebhookAction,
  unlinkTelegramAction,
  type FormState,
} from "@/app/actions/content";
import { SubmitButton } from "@/components/client";
import { Alert, Badge, Card, Field } from "@/components/ui";
import { ADMIN_ROLES, ADMIN_ROLE_LABELS } from "@/lib/constants";

export function SettingsForm({ settings }: { settings: Record<string, string> }) {
  const [state, formAction] = useActionState<FormState, FormData>(saveSettingsAction, {});

  return (
    <Card
      title="Universitet ma'lumotlari"
      description="Bu qiymatlar bot matnlaridagi {support_phone} kabi o'rin egallovchilarga qo'yiladi."
    >
      <form action={formAction} className="space-y-4">
        {state.error && <Alert tone="danger">{state.error}</Alert>}
        {state.ok && <Alert tone="ok">{state.ok}</Alert>}

        <Field label="Universitet nomi">
          <input
            name="university_name"
            className="input"
            defaultValue={settings.university_name}
          />
        </Field>

        <Field label="Qabul bo'limi telefoni" hint="{support_phone}">
          <input name="support_phone" className="input" defaultValue={settings.support_phone} />
        </Field>

        <Field label="Manzil" hint="{support_address}">
          <input
            name="support_address"
            className="input"
            defaultValue={settings.support_address}
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Qo'llab-quvvatlash Telegram" hint="{support_telegram}">
            <input
              name="support_telegram"
              className="input"
              defaultValue={settings.support_telegram}
            />
          </Field>
          <Field label="Ish vaqti" hint="{support_working_hours}">
            <input
              name="support_working_hours"
              className="input"
              defaultValue={settings.support_working_hours}
            />
          </Field>
        </div>

        <Field
          label="Mas'ullar guruhi ID"
          hint="Topikli (Topics yoqilgan) supergruppa ID'si. Talabalarning mas'ullarga yozgan xabarlari shu guruhga tushadi."
        >
          <input
            name="support_group_id"
            className="input font-mono"
            placeholder="-1001234567890"
            defaultValue={settings.support_group_id}
          />
        </Field>

        <div className="rounded-lg bg-slate-50 px-4 py-3 text-[12.5px] leading-relaxed text-slate-600">
          <b>Guruhni qanday sozlash kerak:</b>
          <ol className="mt-1.5 list-decimal space-y-0.5 pl-4">
            <li>Telegram'da supergruppa yarating va sozlamalardan <b>Topics</b> ni yoqing.</li>
            <li>Botni guruhga qo'shib, <b>administrator</b> qiling («Manage topics» huquqi bilan).</li>
            <li>Guruhda <code>@userinfobot</code> yoki shunga o'xshash bot orqali guruh ID'sini oling.</li>
            <li>ID'ni yuqoridagi maydonga kiriting va saqlang.</li>
          </ol>
          Har bir mas'ul xodim uchun alohida mavzu (topic) avtomatik ochiladi. Xodim xabarga{" "}
          <b>reply</b> qilsa — javob to'g'ridan-to'g'ri talabaga boradi.
        </div>

        <SubmitButton>Sozlamalarni saqlash</SubmitButton>
      </form>
    </Card>
  );
}

export function TelegramLinkCard({
  linked,
  botUsername,
}: {
  linked: boolean;
  botUsername: string | null;
}) {
  const [state, formAction] = useActionState<FormState, FormData>(generateLinkCodeAction, {});

  return (
    <Card
      title="Telegram ulanishi (Mini App)"
      description="Admin panelni Telegram ichida ochish uchun akkauntingizni ulang."
    >
      <div className="mb-4">
        <Badge tone={linked ? "ok" : "muted"}>
          {linked ? "Telegram ulangan" : "Ulanmagan"}
        </Badge>
      </div>

      {linked ? (
        <>
          <p className="text-[13px] leading-relaxed text-slate-600">
            Botda <code className="rounded bg-slate-100 px-1">/admin</code> buyrug'ini yuboring —
            «Admin panelni ochish» tugmasi chiqadi.
            {botUsername && (
              <>
                {" "}
                Bot:{" "}
                <a
                  href={`https://t.me/${botUsername}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-navy-700 underline"
                >
                  @{botUsername}
                </a>
              </>
            )}
          </p>
          <form action={unlinkTelegramAction} className="mt-4">
            <SubmitButton
              className="btn-ghost btn-sm"
              pendingText="…"
              confirm="Telegram ulanishi uzilsinmi?"
            >
              Ulanishni uzish
            </SubmitButton>
          </form>
        </>
      ) : (
        <form action={formAction} className="space-y-3">
          {state.error && <Alert tone="danger">{state.error}</Alert>}
          {state.ok && <Alert tone="ok">{state.ok}</Alert>}

          <p className="text-[13px] leading-relaxed text-slate-600">
            Kod oling, so'ng botda <code className="rounded bg-slate-100 px-1">/admin</code>{" "}
            buyrug'ini yuborib kodni kiriting.
          </p>
          <SubmitButton className="btn-primary btn-sm" pendingText="…">
            Ulanish kodini olish
          </SubmitButton>
        </form>
      )}
    </Card>
  );
}

export function PasswordForm() {
  const [state, formAction] = useActionState<FormState, FormData>(changePasswordAction, {});

  return (
    <Card title="Parolni o'zgartirish" description="Kamida 8 ta belgi.">
      <form action={formAction} className="space-y-4">
        {state.error && <Alert tone="danger">{state.error}</Alert>}
        {state.ok && <Alert tone="ok">{state.ok}</Alert>}

        <Field label="Yangi parol" required>
          <input
            name="password"
            type="password"
            className="input"
            autoComplete="new-password"
            required
          />
        </Field>
        <Field label="Parolni tasdiqlang" required>
          <input
            name="confirm"
            type="password"
            className="input"
            autoComplete="new-password"
            required
          />
        </Field>

        <SubmitButton>Parolni yangilash</SubmitButton>
      </form>
    </Card>
  );
}

export function AdminForm() {
  const [state, formAction] = useActionState<FormState, FormData>(createAdminAction, {});

  return (
    <Card title="Yangi administrator qo'shish">
      <form action={formAction} className="space-y-4">
        {state.error && <Alert tone="danger">{state.error}</Alert>}
        {state.ok && <Alert tone="ok">{state.ok}</Alert>}

        <Field label="F.I.O" required>
          <input name="fullName" className="input" placeholder="Karimov Anvar" required />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="E-mail" required>
            <input
              name="email"
              type="email"
              className="input"
              placeholder="anvar@tiu.uz"
              required
            />
          </Field>
          <Field label="Rol">
            <select name="role" className="input" defaultValue="ADMIN">
              {ADMIN_ROLES.map((role) => (
                <option key={role} value={role}>
                  {ADMIN_ROLE_LABELS[role]}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Boshlang'ich parol" required hint="Kamida 8 ta belgi">
          <input name="password" type="text" className="input font-mono" required />
        </Field>

        <SubmitButton>Administrator qo'shish</SubmitButton>
      </form>
    </Card>
  );
}

export function WebhookPanel({
  configured,
  publicUrl,
  hasSecret,
}: {
  configured: boolean;
  publicUrl: string;
  hasSecret: boolean;
}) {
  const [setState, setAction] = useActionState<FormState, FormData>(setWebhookAction, {});
  const [delState, delAction] = useActionState<FormState, FormData>(
    async (prev: FormState) => deleteWebhookAction(prev),
    {},
  );

  return (
    <Card
      title="Telegram ulanishi"
      description="Ishlab chiqish uchun polling (`npm run bot`), serverda webhook ishlatiladi."
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge tone={configured ? "ok" : "danger"}>
          {configured ? "BOT_TOKEN sozlangan" : "BOT_TOKEN yo'q"}
        </Badge>
        <Badge tone={hasSecret ? "ok" : "warn"}>
          {hasSecret ? "Webhook maxfiy kaliti bor" : "Maxfiy kalit belgilanmagan"}
        </Badge>
      </div>

      {!configured && (
        <Alert tone="warn">
          <b>.env</b> faylida <code>BOT_TOKEN</code> ni belgilang (@BotFather dan oling), so'ng
          serverni qayta ishga tushiring.
        </Alert>
      )}

      <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[12.5px] leading-relaxed text-amber-800">
        ⚠️ <b>Diqqat:</b> webhook o'rnatilsa, <code>npm run bot</code> (polling) rejimi uziladi —
        Telegram ikkalasini bir vaqtda qo'llab-quvvatlamaydi. Lokal ishlab chiqishda webhook
        o'rnatmang; serverda esa aksincha — webhook ishlatiladi, polling kerak emas.
      </div>

      <form action={setAction} className="mt-4 space-y-3">
        {setState.error && <Alert tone="danger">{setState.error}</Alert>}
        {setState.ok && <Alert tone="ok">{setState.ok}</Alert>}

        <Field label="Sayt manzili (https)" hint="Webhook: <manzil>/api/telegram">
          <input
            name="publicUrl"
            className="input"
            placeholder="https://bot.tiu.uz"
            defaultValue={publicUrl}
          />
        </Field>

        <div className="flex flex-wrap gap-2">
          <SubmitButton className="btn-primary btn-sm" pendingText="O'rnatilmoqda…">
            Webhook o'rnatish
          </SubmitButton>
        </div>
      </form>

      <form action={delAction} className="mt-3">
        {delState.error && <Alert tone="danger">{delState.error}</Alert>}
        {delState.ok && <Alert tone="ok">{delState.ok}</Alert>}
        <SubmitButton
          className="btn-ghost btn-sm"
          pendingText="…"
          confirm="Webhook o'chirilsinmi? Bot polling rejimiga o'tadi."
        >
          Webhook'ni o'chirish
        </SubmitButton>
      </form>
    </Card>
  );
}
