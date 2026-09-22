import Link from "next/link";
import { prisma } from "@/lib/db";
import { Badge, Card, EmptyState, PageHeader, Pagination, StatCard } from "@/components/ui";
import { FilterSelect, SearchInput, SubmitButton } from "@/components/client";
import { resetVerificationAction, toggleBlockAction } from "@/app/actions/users";
import type { Prisma } from "@prisma/client";
import { botUserSearchWhere } from "@/lib/search";

export const metadata = { title: "Bot foydalanuvchilari" };
export const dynamic = "force-dynamic";

const PER_PAGE = 25;

export default async function BotUsersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const state = params.state ?? "";
  const lang = params.lang ?? "";
  const page = Math.max(1, Number(params.page) || 1);

  const where: Prisma.BotUserWhereInput = {
    ...(state === "verified" ? { isVerified: true } : {}),
    ...(state === "unverified" ? { isVerified: false } : {}),
    ...(state === "blocked" ? { isBlocked: true } : {}),
    ...(lang ? { lang } : {}),
    ...(botUserSearchWhere(q) ?? {}),
  };

  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [users, total, stats] = await Promise.all([
    prisma.botUser.findMany({
      where,
      include: { student: { include: { faculty: true } } },
      orderBy: { lastSeenAt: "desc" },
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.botUser.count({ where }),
    Promise.all([
      prisma.botUser.count(),
      prisma.botUser.count({ where: { isVerified: true } }),
      prisma.botUser.count({ where: { lastSeenAt: { gte: dayAgo } } }),
      prisma.botUser.count({ where: { isBlocked: true } }),
    ]),
  ]);

  const [allCount, verifiedCount, activeCount, blockedCount] = stats;
  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <>
      <PageHeader
        title="Bot foydalanuvchilari"
        description="Botga kirgan barcha Telegram akkauntlar."
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Jami foydalanuvchi" value={allCount} icon="👥" />
        <StatCard label="Tasdiqlangan" value={verifiedCount} icon="✅" tone="ok" />
        <StatCard label="24 soatda faol" value={activeCount} icon="⚡" tone="info" />
        <StatCard
          label="Bloklangan"
          value={blockedCount}
          icon="⛔️"
          tone={blockedCount > 0 ? "danger" : "muted"}
        />
      </div>

      <Card bodyClassName="p-0">
        <div className="flex flex-wrap items-center gap-3 border-b border-[var(--border)] p-4">
          <SearchInput
            placeholder="Ism, username, Telegram ID yoki talaba F.I.O…"
            className="min-w-[260px] flex-1"
          />
          <FilterSelect
            paramName="state"
            placeholder="Barcha holatlar"
            className="w-auto min-w-[170px]"
            options={[
              { value: "verified", label: "Tasdiqlangan" },
              { value: "unverified", label: "Tasdiqlanmagan" },
              { value: "blocked", label: "Bloklangan" },
            ]}
          />
          <FilterSelect
            paramName="lang"
            placeholder="Barcha tillar"
            className="w-auto min-w-[140px]"
            options={[
              { value: "uz", label: "🇺🇿 O'zbekcha" },
              { value: "ru", label: "🇷🇺 Русский" },
              { value: "en", label: "🇬🇧 English" },
            ]}
          />
        </div>

        {users.length === 0 ? (
          <EmptyState
            icon="👥"
            title="Foydalanuvchi topilmadi"
            description="Bot ishga tushgach, foydalanuvchilar shu yerda ko'rinadi."
          />
        ) : (
          <>
            <div className="table-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Telegram</th>
                    <th>Bog'langan talaba</th>
                    <th>Til</th>
                    <th>Holat</th>
                    <th>Oxirgi faollik</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <p className="font-medium text-navy-900">
                          {[user.firstName, user.lastName].filter(Boolean).join(" ") || "—"}
                        </p>
                        <p className="text-[12px] text-slate-500">
                          {user.username ? `@${user.username}` : `ID: ${user.telegramId}`}
                        </p>
                      </td>
                      <td>
                        {user.student ? (
                          <Link
                            href={`/students/${user.student.id}`}
                            className="text-[13px] text-navy-800 hover:underline"
                          >
                            {user.student.fullName}
                            <span className="block text-[12px] text-slate-500">
                              {user.student.groupName} · {user.student.course}-kurs
                            </span>
                          </Link>
                        ) : (
                          <span className="text-[13px] text-slate-400">—</span>
                        )}
                      </td>
                      <td>
                        <Badge tone="navy">{user.lang.toUpperCase()}</Badge>
                      </td>
                      <td>
                        {user.isBlocked ? (
                          <Badge tone="danger">Bloklangan</Badge>
                        ) : user.isVerified ? (
                          <Badge tone="ok">Tasdiqlangan</Badge>
                        ) : (
                          <Badge tone="muted">
                            Kutilmoqda
                            {user.failedAttempts > 0 ? ` (${user.failedAttempts} urinish)` : ""}
                          </Badge>
                        )}
                      </td>
                      <td className="whitespace-nowrap text-[13px] text-slate-500">
                        {user.lastSeenAt.toLocaleString("uz-UZ", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="text-right">
                        <div className="flex justify-end gap-2">
                          {user.isVerified && (
                            <form action={resetVerificationAction}>
                              <input type="hidden" name="id" value={user.id} />
                              <SubmitButton
                                className="btn-ghost btn-sm whitespace-nowrap"
                                pendingText="…"
                                confirm="Tasdiqlash bekor qilinsinmi? Foydalanuvchi qayta pasport kiritishi kerak bo'ladi."
                              >
                                Tasdiqni bekor qilish
                              </SubmitButton>
                            </form>
                          )}
                          <form action={toggleBlockAction}>
                            <input type="hidden" name="id" value={user.id} />
                            <SubmitButton
                              className={user.isBlocked ? "btn-ghost btn-sm" : "btn-danger btn-sm"}
                              pendingText="…"
                            >
                              {user.isBlocked ? "Blokdan chiqarish" : "Bloklash"}
                            </SubmitButton>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              basePath="/bot-users"
              params={{ q, state, lang }}
            />
          </>
        )}
      </Card>
    </>
  );
}
