import Link from "next/link";
import { prisma } from "@/lib/db";
import { Alert, Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { FacultyForm } from "./form";
import { STAFF_ROLES, STAFF_ROLE_ADMIN_LABELS } from "@/lib/constants";

export const metadata = { title: "Fakultet va mas'ullar" };
export const dynamic = "force-dynamic";

export default async function FacultiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;

  const faculties = await prisma.faculty.findMany({
    orderBy: [{ sort: "asc" }, { nameUz: "asc" }],
    include: {
      staff: { where: { isActive: true }, select: { role: true } },
      _count: { select: { students: true } },
    },
  });

  return (
    <>
      <PageHeader
        title="Fakultet va mas'ullar"
        description="Botdagi «👥 Fakultet mas'ullari bilan bog'lanish» bo'limi shu ma'lumotlardan to'ldiriladi."
      />

      {params.ok === "deleted" && (
        <div className="mb-4">
          <Alert tone="ok">Fakultet o'chirildi.</Alert>
        </div>
      )}
      {params.error && (
        <div className="mb-4">
          <Alert tone="danger">{params.error}</Alert>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {faculties.length === 0 ? (
            <Card bodyClassName="p-0">
              <EmptyState
                icon="🏛"
                title="Fakultetlar qo'shilmagan"
                description="O'ng tomondagi forma orqali birinchi fakultetni qo'shing."
              />
            </Card>
          ) : (
            faculties.map((faculty) => {
              const counts = new Map<string, number>();
              for (const s of faculty.staff) {
                counts.set(s.role, (counts.get(s.role) ?? 0) + 1);
              }
              const missing = STAFF_ROLES.filter((role) => !counts.has(role));

              return (
                <Card key={faculty.id} bodyClassName="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-[15px] font-semibold text-navy-900">
                          {faculty.nameUz}
                        </h3>
                        <Badge tone="navy">{faculty.code}</Badge>
                        {!faculty.isActive && <Badge tone="muted">Nofaol</Badge>}
                      </div>
                      <p className="mt-1 text-[13px] text-slate-500">
                        {faculty.nameRu} · {faculty.nameEn}
                      </p>
                      <p className="mt-2 text-[13px] text-slate-500">
                        🎓 {faculty._count.students} ta talaba · 👤 {faculty.staff.length} ta mas'ul
                      </p>
                    </div>
                    <Link href={`/faculties/${faculty.id}`} className="btn-ghost btn-sm">
                      Mas'ullarni boshqarish →
                    </Link>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {STAFF_ROLES.map((role) => (
                      <Badge key={role} tone={counts.has(role) ? "ok" : "warn"}>
                        {counts.has(role) ? "✓" : "!"} {STAFF_ROLE_ADMIN_LABELS[role]}
                        {counts.has(role) ? ` (${counts.get(role)})` : ""}
                      </Badge>
                    ))}
                  </div>

                  {missing.length > 0 && (
                    <p className="mt-3 text-[12px] text-amber-600">
                      ⚠️ Botda {missing.length} ta bo'lim bo'sh ko'rinadi — mas'ul biriktiring.
                    </p>
                  )}
                </Card>
              );
            })
          )}
        </div>

        <aside>
          <div className="lg:sticky lg:top-24">
            <FacultyForm />
          </div>
        </aside>
      </div>
    </>
  );
}
