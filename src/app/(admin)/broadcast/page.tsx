import { prisma } from "@/lib/db";
import { Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { BroadcastForm } from "./form";

export const metadata = { title: "Xabar yuborish" };
export const dynamic = "force-dynamic";
/** Ommaviy yuborish uzoq davom etishi mumkin (Telegram cheklovi ~30 xabar/sekund) */
export const maxDuration = 300;

export default async function BroadcastPage() {
  const [faculties, history, counts] = await Promise.all([
    prisma.faculty.findMany({
      where: { isActive: true },
      orderBy: { sort: "asc" },
      select: { id: true, nameUz: true },
    }),
    prisma.broadcast.findMany({ orderBy: { createdAt: "desc" }, take: 10 }),
    Promise.all([
      prisma.botUser.count({ where: { isBlocked: false } }),
      prisma.botUser.count({ where: { isBlocked: false, isVerified: true } }),
    ]),
  ]);

  const [allCount, verifiedCount] = counts;

  return (
    <>
      <PageHeader
        title="Ommaviy xabar yuborish"
        description="Xabar har bir foydalanuvchiga o'zi tanlagan tilda yuboriladi."
      />

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <BroadcastForm
          faculties={faculties}
          allCount={allCount}
          verifiedCount={verifiedCount}
        />

        <aside>
          <div className="lg:sticky lg:top-24">
            <Card title="Yuborilgan xabarlar tarixi" bodyClassName="p-0">
              {history.length === 0 ? (
                <EmptyState icon="📢" title="Hali xabar yuborilmagan" />
              ) : (
                <ul className="divide-y divide-[var(--border)]">
                  {history.map((item) => (
                    <li key={item.id} className="px-5 py-3">
                      <div className="flex items-start justify-between gap-2">
                        <p className="line-clamp-2 flex-1 text-[13px] text-slate-700">
                          {item.textUz.replace(/<[^>]+>/g, "")}
                        </p>
                        <Badge tone={item.status === "DONE" ? "ok" : "warn"}>
                          {item.status === "DONE" ? "Yuborildi" : item.status}
                        </Badge>
                      </div>
                      <p className="mt-1 text-[12px] text-slate-500">
                        ✅ {item.sentCount}
                        {item.failCount > 0 ? ` · ❌ ${item.failCount}` : ""} ·{" "}
                        {item.createdAt.toLocaleString("uz-UZ", {
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
