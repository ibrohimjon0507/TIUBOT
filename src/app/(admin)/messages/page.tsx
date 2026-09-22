import Link from "next/link";
import { prisma } from "@/lib/db";
import { Alert, Card, EmptyState, PageHeader, StatCard } from "@/components/ui";
import { FilterSelect } from "@/components/client";
import { STAFF_ROLE_ADMIN_LABELS, type StaffRole } from "@/lib/constants";
import { loadDictionary } from "@/lib/i18n";
import { Conversation, type ConversationMessage } from "./conversation";

export const metadata = { title: "Mas'ul xabarlari" };
export const dynamic = "force-dynamic";

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const staffFilter = params.staff ?? "";
  const onlyUnread = params.state === "unread";

  const [rows, staffList, stats, dictionary] = await Promise.all([
    prisma.staffMessage.findMany({
      where: staffFilter ? { staffId: staffFilter } : {},
      orderBy: { createdAt: "desc" },
      take: 300,
      include: {
        staff: true,
        botUser: true,
        student: { include: { faculty: true } },
      },
    }),
    prisma.facultyStaff.findMany({
      where: { isActive: true },
      orderBy: [{ role: "asc" }, { fullName: "asc" }],
      select: { id: true, fullName: true, role: true },
    }),
    Promise.all([
      prisma.staffMessage.count(),
      prisma.staffMessage.count({ where: { direction: "IN", isRead: false } }),
      prisma.staffMessage.count({ where: { direction: "OUT" } }),
    ]),
    loadDictionary(),
  ]);

  const [totalCount, unreadCount, answeredCount] = stats;
  const groupConfigured = Boolean((dictionary.settings.support_group_id ?? "").trim());

  // Suhbatlarga guruhlash: foydalanuvchi + xodim
  const threads = new Map<
    string,
    {
      key: string;
      botUserId: string;
      staffId: string | null;
      staffName: string;
      staffRole: string | null;
      studentName: string;
      studentMeta: string;
      username: string | null;
      unread: number;
      lastAt: Date;
      messages: ConversationMessage[];
    }
  >();

  for (const row of [...rows].reverse()) {
    if (!row.botUserId) continue;
    const key = `${row.botUserId}:${row.staffId ?? "-"}`;
    let thread = threads.get(key);

    if (!thread) {
      thread = {
        key,
        botUserId: row.botUserId,
        staffId: row.staffId,
        staffName: row.staff?.fullName ?? "Noma'lum xodim",
        staffRole: row.staff?.role ?? null,
        studentName:
          row.student?.fullName ||
          [row.botUser?.firstName, row.botUser?.lastName].filter(Boolean).join(" ") ||
          "Noma'lum foydalanuvchi",
        studentMeta: row.student
          ? `${row.student.faculty?.nameUz ?? row.student.facultyName ?? "—"} · ${row.student.course}-kurs · ${row.student.groupName}`
          : (row.botUser?.telegramId ?? ""),
        username: row.botUser?.username ?? null,
        unread: 0,
        lastAt: row.createdAt,
        messages: [],
      };
      threads.set(key, thread);
    }

    thread.messages.push({
      id: row.id,
      direction: row.direction,
      text: row.text,
      replierName: row.replierName,
      createdAt: row.createdAt.toISOString(),
    });
    thread.lastAt = row.createdAt;
    if (row.direction === "IN" && !row.isRead) thread.unread += 1;
  }

  let list = [...threads.values()].sort((a, b) => b.lastAt.getTime() - a.lastAt.getTime());
  if (onlyUnread) list = list.filter((t) => t.unread > 0);

  return (
    <>
      <PageHeader
        title="Mas'ul xabarlari"
        description="Talabalar fakultet mas'ullariga botdan yozgan xabarlar va javoblar."
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard label="Jami xabarlar" value={totalCount} icon="💬" />
        <StatCard
          label="Javobsiz"
          value={unreadCount}
          icon="🔔"
          tone={unreadCount > 0 ? "warn" : "ok"}
          hint={unreadCount > 0 ? "Javob kutilmoqda" : "Hammasiga javob berilgan"}
        />
        <StatCard label="Yuborilgan javoblar" value={answeredCount} icon="📤" tone="info" />
      </div>

      {!groupConfigured && (
        <div className="mb-5">
          <Alert tone="warn">
            <b>Topikli guruh ulanmagan.</b> Xabarlar hozircha faqat shu sahifada ko'rinadi.
            Mas'ullar Telegram'da javob bera olishi uchun{" "}
            <Link href="/settings" className="underline">
              Sozlamalar → Mas'ullar guruhi
            </Link>{" "}
            bo'limidan guruh ID'sini kiriting.
          </Alert>
        </div>
      )}

      <Card bodyClassName="p-4" className="mb-5">
        <div className="flex flex-wrap items-center gap-3">
          <FilterSelect
            paramName="staff"
            placeholder="Barcha mas'ullar"
            className="w-auto min-w-[260px]"
            options={staffList.map((s) => ({
              value: s.id,
              label: `${STAFF_ROLE_ADMIN_LABELS[s.role as StaffRole] ?? s.role} — ${s.fullName}`,
            }))}
          />
          <FilterSelect
            paramName="state"
            placeholder="Barcha suhbatlar"
            className="w-auto min-w-[190px]"
            options={[{ value: "unread", label: "Faqat javobsizlar" }]}
          />
        </div>
      </Card>

      {list.length === 0 ? (
        <Card bodyClassName="p-0">
          <EmptyState
            icon="💬"
            title="Xabarlar yo'q"
            description="Talaba botda «👥 Fakultet mas'ullari» → xodim → «✉️ Xabar yozish» tugmasini bosganda xabarlar shu yerda paydo bo'ladi."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {list.map((thread) => (
            <Conversation
              key={thread.key}
              botUserId={thread.botUserId}
              staffId={thread.staffId}
              staffName={thread.staffName}
              staffRole={
                thread.staffRole
                  ? (STAFF_ROLE_ADMIN_LABELS[thread.staffRole as StaffRole] ?? thread.staffRole)
                  : null
              }
              studentName={thread.studentName}
              studentMeta={thread.studentMeta}
              username={thread.username}
              unread={thread.unread}
              messages={thread.messages}
            />
          ))}
        </div>
      )}
    </>
  );
}
