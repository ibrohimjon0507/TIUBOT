import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/auth";
import { Alert, Badge, Card, PageHeader } from "@/components/ui";
import { SubmitButton } from "@/components/client";
import { deleteAdminAction, toggleAdminAction } from "@/app/actions/content";
import { ADMIN_ROLE_LABELS, type AdminRole } from "@/lib/constants";
import { DEFAULT_SETTINGS } from "@/lib/i18n";
import { AdminForm, PasswordForm, SettingsForm, TelegramLinkCard, WebhookPanel } from "./forms";

export const metadata = { title: "Sozlamalar" };
export const dynamic = "force-dynamic";

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const query = await searchParams;
  const session = await requireSession();

  const [settingRows, admins, me] = await Promise.all([
    prisma.setting.findMany(),
    prisma.adminUser.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.adminUser.findUnique({ where: { id: session.id } }),
  ]);

  const settings: Record<string, string> = { ...DEFAULT_SETTINGS };
  for (const row of settingRows) settings[row.key] = row.value;

  const isSuperAdmin = session.role === "SUPERADMIN";
  const botConfigured = Boolean(process.env.BOT_TOKEN && !process.env.BOT_TOKEN.includes("your-bot"));

  return (
    <>
      <PageHeader
        title="Sozlamalar"
        description="Universitet ma'lumotlari, bot ulanishi va administrator akkauntlari."
      />

      {query.ok === "admin-deleted" && (
        <div className="mb-4">
          <Alert tone="ok">Administrator o'chirildi.</Alert>
        </div>
      )}
      {query.error && (
        <div className="mb-4">
          <Alert tone="danger">{query.error}</Alert>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="space-y-5">
          <SettingsForm settings={settings} />
          <PasswordForm />
        </div>

        <div className="space-y-5">
          <TelegramLinkCard
            linked={Boolean(me?.telegramId)}
            botUsername={process.env.BOT_USERNAME ?? null}
          />

          <WebhookPanel
            configured={botConfigured}
            publicUrl={process.env.PUBLIC_URL ?? ""}
            hasSecret={Boolean(process.env.TELEGRAM_WEBHOOK_SECRET)}
          />

          <Card
            title="Administratorlar"
            description="Panelga kirish huquqiga ega xodimlar"
            bodyClassName="p-0"
          >
            <ul className="divide-y divide-[var(--border)]">
              {admins.map((admin) => (
                <li key={admin.id} className="flex flex-wrap items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-[14px] font-medium text-navy-900">
                      {admin.fullName}
                      {admin.id === session.id && <Badge tone="info">Siz</Badge>}
                      {!admin.isActive && <Badge tone="muted">Nofaol</Badge>}
                    </p>
                    <p className="text-[12.5px] text-slate-500">
                      {admin.email} · {ADMIN_ROLE_LABELS[admin.role as AdminRole] ?? admin.role}
                      {admin.lastLoginAt
                        ? ` · oxirgi kirish: ${admin.lastLoginAt.toLocaleDateString("uz-UZ")}`
                        : ""}
                    </p>
                  </div>

                  {isSuperAdmin && admin.id !== session.id && (
                    <div className="flex gap-2">
                      <form action={toggleAdminAction}>
                        <input type="hidden" name="id" value={admin.id} />
                        <SubmitButton className="btn-ghost btn-sm" pendingText="…">
                          {admin.isActive ? "Nofaol qilish" : "Faollashtirish"}
                        </SubmitButton>
                      </form>
                      <form action={deleteAdminAction}>
                        <input type="hidden" name="id" value={admin.id} />
                        <SubmitButton
                          className="btn-danger btn-sm"
                          pendingText="…"
                          confirm={`"${admin.fullName}" o'chirilsinmi?`}
                        >
                          O'chirish
                        </SubmitButton>
                      </form>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </Card>

          {isSuperAdmin ? (
            <AdminForm />
          ) : (
            <Card title="Yangi administrator">
              <p className="text-[13px] text-slate-500">
                Yangi administrator qo'shish uchun <b>Super admin</b> huquqi talab etiladi.
              </p>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
