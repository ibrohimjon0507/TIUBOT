import { prisma } from "@/lib/db";
import { Badge, Card, EmptyState, PageHeader, Pagination } from "@/components/ui";
import { FilterSelect } from "@/components/client";
import { TICKET_STATUS_LABELS } from "@/lib/constants";
import { TicketCard } from "./ticket-card";

export const metadata = { title: "Murojaatlar" };
export const dynamic = "force-dynamic";

const PER_PAGE = 15;

export default async function TicketsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const status = params.status ?? "";
  const page = Math.max(1, Number(params.page) || 1);

  const where = status ? { status } : {};

  const [tickets, total, newCount, failedLookups] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
      include: { botUser: true },
    }),
    prisma.supportTicket.count({ where }),
    prisma.supportTicket.count({ where: { status: "NEW" } }),
    prisma.activityLog.findMany({
      where: { action: "passport_fail" },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { botUser: true },
    }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <>
      <PageHeader
        title="Murojaatlar"
        description="Pasporti bazada topilmagan foydalanuvchilarning mas'ul xodimga murojaatlari."
        actions={
          newCount > 0 ? <Badge tone="warn">{newCount} ta yangi murojaat</Badge> : undefined
        }
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <Card bodyClassName="p-4">
            <FilterSelect
              paramName="status"
              placeholder="Barcha murojaatlar"
              className="w-auto min-w-[220px]"
              options={Object.entries(TICKET_STATUS_LABELS).map(([value, label]) => ({
                value,
                label,
              }))}
            />
          </Card>

          {tickets.length === 0 ? (
            <Card bodyClassName="p-0">
              <EmptyState
                icon="✉️"
                title="Murojaatlar yo'q"
                description="Pasporti topilmagan foydalanuvchi botda «Mas'ul xodimga murojaat» tugmasini bosganda bu yerda paydo bo'ladi."
              />
            </Card>
          ) : (
            <>
              {tickets.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} />
              ))}
              <Card bodyClassName="p-0">
                <Pagination
                  page={page}
                  totalPages={totalPages}
                  basePath="/tickets"
                  params={{ status }}
                />
              </Card>
            </>
          )}
        </div>

        <aside>
          <div className="lg:sticky lg:top-24">
            <Card
              title="Topilmagan pasportlar"
              description="Bazada yo'q bo'lgan so'nggi urinishlar"
              bodyClassName="p-0"
            >
              {failedLookups.length === 0 ? (
                <p className="px-5 py-6 text-center text-[13px] text-slate-500">
                  Barcha urinishlar muvaffaqiyatli.
                </p>
              ) : (
                <ul className="divide-y divide-[var(--border)]">
                  {failedLookups.map((log) => (
                    <li key={log.id} className="px-5 py-3">
                      <code className="text-[13px] font-medium text-navy-900">
                        {log.payload ?? "—"}
                      </code>
                      <p className="mt-0.5 text-[12px] text-slate-500">
                        {log.botUser?.username
                          ? `@${log.botUser.username}`
                          : (log.botUser?.firstName ?? "Noma'lum")}{" "}
                        ·{" "}
                        {log.createdAt.toLocaleString("uz-UZ", {
                          day: "2-digit",
                          month: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </aside>
      </div>
    </>
  );
}
