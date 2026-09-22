import Link from "next/link";
import { prisma } from "@/lib/db";
import { Badge, Card, EmptyState, PageHeader, StatCard } from "@/components/ui";
import {
  STATUS_ADMIN_LABELS,
  STATUS_COLORS,
  STUDENT_STATUSES,
  type StudentStatus,
} from "@/lib/constants";

export const metadata = { title: "Boshqaruv paneli" };
export const dynamic = "force-dynamic";

const ACTION_LABELS: Record<string, string> = {
  start: "Botni ishga tushirdi",
  lang_select: "Tilni tanladi",
  passport_ok: "Pasport tasdiqlandi",
  passport_fail: "Pasport topilmadi",
  passport_invalid: "Noto'g'ri pasport formati",
  "menu:status": "Status bo'limini ochdi",
  "menu:faq": "Savol-javoblarni ochdi",
  "menu:abroad": "Chet el dasturlarini ochdi",
  "menu:contacts": "Fakultet mas'ullarini ochdi",
  "faq:open": "Savolni o'qidi",
  "abroad:open": "Dasturni o'qidi",
  "support:new": "Murojaat qoldirdi",
};

function timeAgo(date: Date) {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "hozir";
  if (minutes < 60) return `${minutes} daqiqa oldin`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} soat oldin`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} kun oldin`;
  return date.toLocaleDateString("uz-UZ");
}

export default async function DashboardPage() {
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [
    studentCount,
    botUserCount,
    verifiedCount,
    activeToday,
    newTickets,
    faqCount,
    programCount,
    staffCount,
    statusGroups,
    recentLogs,
    topFaq,
    recentUsers,
    failedLookups,
  ] = await Promise.all([
    prisma.student.count({ where: { isActive: true } }),
    prisma.botUser.count(),
    prisma.botUser.count({ where: { isVerified: true } }),
    prisma.botUser.count({ where: { lastSeenAt: { gte: dayAgo } } }),
    prisma.supportTicket.count({ where: { status: "NEW" } }),
    prisma.faq.count({ where: { isActive: true } }),
    prisma.studyAbroadProgram.count({ where: { isActive: true } }),
    prisma.facultyStaff.count({ where: { isActive: true } }),
    prisma.student.groupBy({
      by: ["status"],
      _count: { _all: true },
      where: { isActive: true },
    }),
    prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 12,
      include: { botUser: true },
    }),
    prisma.faq.findMany({
      orderBy: { views: "desc" },
      take: 5,
      where: { isActive: true },
    }),
    prisma.botUser.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { student: true },
    }),
    prisma.activityLog.count({
      where: { action: "passport_fail", createdAt: { gte: dayAgo } },
    }),
  ]);

  const unreadMessages = await prisma.staffMessage.count({
    where: { direction: "IN", isRead: false },
  });

  const statusMap = new Map(statusGroups.map((g) => [g.status, g._count._all]));
  const verifyRate = botUserCount > 0 ? Math.round((verifiedCount / botUserCount) * 100) : 0;

  return (
    <>
      <PageHeader
        title="Boshqaruv paneli"
        description="Bot va talabalar bazasi bo'yicha umumiy ko'rsatkichlar."
        actions={
          <Link href="/students/new" className="btn-primary btn-sm">
            + Talaba qo'shish
          </Link>
        }
      />

      {/* Asosiy ko'rsatkichlar */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Bazadagi talabalar"
          value={studentCount}
          hint="Faol talabalar soni"
          icon="🎓"
        />
        <StatCard
          label="Bot foydalanuvchilari"
          value={botUserCount}
          hint={`${activeToday} ta so'nggi 24 soatda faol`}
          icon="👥"
          tone="info"
        />
        <StatCard
          label="Tasdiqlangan"
          value={`${verifiedCount}`}
          hint={`Umumiy foydalanuvchilarning ${verifyRate}%`}
          icon="✅"
          tone="ok"
        />
        <StatCard
          label="Javob kutayotgan xabarlar"
          value={unreadMessages + newTickets}
          hint={
            unreadMessages + newTickets > 0
              ? `${unreadMessages} ta mas'ulga, ${newTickets} ta murojaat`
              : "Hammasiga javob berilgan"
          }
          icon="✉️"
          tone={unreadMessages + newTickets > 0 ? "warn" : "muted"}
        />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        {/* Talabalar holati */}
        <Card
          title="Talabalar holati"
          description="Bot «Status» bo'limida ko'rsatiladigan taqsimot"
          className="xl:col-span-2"
        >
          <div className="space-y-3">
            {STUDENT_STATUSES.map((status) => {
              const count = statusMap.get(status) ?? 0;
              const percent = studentCount > 0 ? (count / studentCount) * 100 : 0;
              const tone = STATUS_COLORS[status as StudentStatus];
              const barColor =
                tone === "ok"
                  ? "bg-emerald-500"
                  : tone === "warn"
                    ? "bg-amber-500"
                    : tone === "danger"
                      ? "bg-red-500"
                      : tone === "info"
                        ? "bg-sky-500"
                        : "bg-slate-400";
              return (
                <div key={status}>
                  <div className="mb-1 flex items-center justify-between text-[13px]">
                    <Link
                      href={`/students?status=${status}`}
                      className="text-slate-600 hover:text-navy-800 hover:underline"
                    >
                      {STATUS_ADMIN_LABELS[status]}
                    </Link>
                    <span className="font-medium tabular-nums text-navy-900">{count}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${barColor} transition-all`}
                      style={{ width: `${Math.max(percent, count > 0 ? 3 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Mazmun holati */}
        <Card title="Bot mazmuni" description="Foydalanuvchilarga ko'rinadigan bo'limlar">
          <ul className="divide-y divide-[var(--border)] text-sm">
            <ContentRow href="/faq" icon="❓" label="Faol savol-javoblar" value={faqCount} />
            <ContentRow
              href="/programs"
              icon="🌍"
              label="Chet el dasturlari"
              value={programCount}
            />
            <ContentRow
              href="/faculties"
              icon="🏛"
              label="Fakultet mas'ullari"
              value={staffCount}
            />
            <ContentRow
              href="/tickets"
              icon="⚠️"
              label="24 soatda topilmagan pasport"
              value={failedLookups}
              tone={failedLookups > 0 ? "warn" : "muted"}
            />
          </ul>

          {topFaq.length > 0 && (
            <>
              <p className="mt-5 mb-2 text-[12px] font-semibold uppercase tracking-wide text-slate-400">
                Eng ko'p o'qilgan savollar
              </p>
              <ol className="space-y-2 text-[13px]">
                {topFaq.map((faq, i) => (
                  <li key={faq.id} className="flex gap-2">
                    <span className="text-slate-400">{i + 1}.</span>
                    <Link
                      href={`/faq/${faq.id}`}
                      className="flex-1 text-slate-600 hover:text-navy-800 hover:underline"
                    >
                      {faq.questionUz}
                    </Link>
                    <span className="tabular-nums text-slate-400">{faq.views}</span>
                  </li>
                ))}
              </ol>
            </>
          )}
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-3">
        {/* Faoliyat */}
        <Card
          title="So'nggi faoliyat"
          description="Foydalanuvchilarning bot bilan oxirgi amallari"
          className="xl:col-span-2"
          bodyClassName="p-0"
        >
          {recentLogs.length === 0 ? (
            <EmptyState
              title="Hozircha faoliyat yo'q"
              description="Foydalanuvchilar botdan foydalana boshlaganda bu yerda ko'rinadi."
            />
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {recentLogs.map((log) => (
                <li key={log.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[13px]">
                    {log.action.startsWith("passport_ok")
                      ? "✅"
                      : log.action.startsWith("passport_fail")
                        ? "⚠️"
                        : "•"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-navy-900">
                      {ACTION_LABELS[log.action] ?? log.action}
                    </p>
                    <p className="truncate text-[12px] text-slate-500">
                      {log.botUser?.firstName ?? "Noma'lum"}
                      {log.botUser?.username ? ` · @${log.botUser.username}` : ""}
                      {log.payload ? ` · ${log.payload}` : ""}
                    </p>
                  </div>
                  <span className="shrink-0 text-[12px] text-slate-400">
                    {timeAgo(log.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        {/* Yangi foydalanuvchilar */}
        <Card
          title="Yangi foydalanuvchilar"
          actions={
            <Link href="/bot-users" className="text-[13px] text-navy-700 hover:underline">
              Barchasi →
            </Link>
          }
          bodyClassName="p-0"
        >
          {recentUsers.length === 0 ? (
            <EmptyState title="Foydalanuvchilar yo'q" />
          ) : (
            <ul className="divide-y divide-[var(--border)]">
              {recentUsers.map((user) => (
                <li key={user.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-navy-50 text-[12px] font-semibold text-navy-700">
                    {(user.firstName ?? "?").charAt(0).toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[13px] font-medium text-navy-900">
                      {user.student?.fullName ||
                        [user.firstName, user.lastName].filter(Boolean).join(" ") ||
                        "Noma'lum"}
                    </p>
                    <p className="truncate text-[12px] text-slate-500">
                      {user.username ? `@${user.username}` : user.telegramId} ·{" "}
                      {user.lang.toUpperCase()}
                    </p>
                  </div>
                  <Badge tone={user.isVerified ? "ok" : "muted"}>
                    {user.isVerified ? "Tasdiqlangan" : "Kutilmoqda"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}

function ContentRow({
  href,
  icon,
  label,
  value,
  tone = "navy",
}: {
  href: string;
  icon: string;
  label: string;
  value: number;
  tone?: string;
}) {
  return (
    <li className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
      <Link href={href} className="flex items-center gap-2.5 text-slate-600 hover:text-navy-800">
        <span>{icon}</span>
        <span className="text-[13px]">{label}</span>
      </Link>
      <Badge tone={tone}>{value}</Badge>
    </li>
  );
}
