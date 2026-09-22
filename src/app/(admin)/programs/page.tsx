import Link from "next/link";
import { prisma } from "@/lib/db";
import { Alert, Badge, Card, EmptyState, PageHeader } from "@/components/ui";

export const metadata = { title: "Chet elda o'qish" };
export const dynamic = "force-dynamic";

export default async function ProgramsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const query = await searchParams;
  const programs = await prisma.studyAbroadProgram.findMany({
    orderBy: [{ sort: "asc" }, { createdAt: "desc" }],
  });

  return (
    <>
      <PageHeader
        title="Chet mamlakatlarda o'qish"
        description="Botdagi «🌍 Chet mamlakatlarda o'qish» bo'limi dasturlari."
        actions={
          <Link href="/programs/new" className="btn-primary btn-sm">
            + Dastur qo'shish
          </Link>
        }
      />

      {query.ok === "deleted" && (
        <div className="mb-4">
          <Alert tone="ok">Dastur o'chirildi.</Alert>
        </div>
      )}

      {programs.length === 0 ? (
        <Card bodyClassName="p-0">
          <EmptyState
            icon="🌍"
            title="Dasturlar qo'shilmagan"
            description="Xalqaro almashinuv, double degree va yozgi maktab dasturlarini qo'shing."
            action={
              <Link href="/programs/new" className="btn-primary btn-sm">
                + Dastur qo'shish
              </Link>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {programs.map((program) => (
            <Card key={program.id} bodyClassName="flex h-full flex-col p-5">
              <div className="flex items-start justify-between gap-2">
                <span className="text-2xl">{program.flag}</span>
                <div className="flex items-center gap-1.5">
                  {!program.isActive && <Badge tone="muted">Yashirilgan</Badge>}
                  <Badge tone="info">👁 {program.views}</Badge>
                </div>
              </div>

              <h3 className="mt-3 text-[15px] font-semibold leading-snug text-navy-900">
                {program.titleUz}
              </h3>
              <p className="mt-1 text-[13px] text-slate-500">{program.country}</p>

              {program.universityName && (
                <p className="mt-2 text-[12.5px] text-slate-500">🏫 {program.universityName}</p>
              )}
              {program.deadline && (
                <p className="mt-1 text-[12.5px] text-amber-600">📅 {program.deadline}</p>
              )}

              <p className="mt-3 line-clamp-3 flex-1 text-[13px] leading-relaxed text-slate-600">
                {program.descriptionUz.replace(/<[^>]+>/g, "")}
              </p>

              <Link
                href={`/programs/${program.id}`}
                className="btn-ghost btn-sm mt-4 w-full justify-center"
              >
                Tahrirlash
              </Link>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
