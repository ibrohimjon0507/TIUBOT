import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Alert, Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { SubmitButton } from "@/components/client";
import { deleteStaffAction } from "@/app/actions/faculties";
import { STAFF_ROLES, STAFF_ROLE_ADMIN_LABELS, type StaffRole } from "@/lib/constants";
import { StaffForm } from "./staff-form";
import { FacultyForm } from "../form";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const faculty = await prisma.faculty.findUnique({ where: { id } });
  return { title: faculty?.nameUz ?? "Fakultet" };
}

export default async function FacultyDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { id } = await params;
  const query = await searchParams;

  const faculty = await prisma.faculty.findUnique({
    where: { id },
    include: {
      staff: { orderBy: [{ role: "asc" }, { sort: "asc" }] },
      _count: { select: { students: true } },
    },
  });
  if (!faculty) notFound();

  const editing = query.staff
    ? (faculty.staff.find((s) => s.id === query.staff) ?? undefined)
    : undefined;

  return (
    <>
      <PageHeader
        title={faculty.nameUz}
        description={`${faculty.code} · ${faculty._count.students} ta talaba · ${faculty.staff.length} ta mas'ul xodim`}
        actions={
          <Link href="/faculties" className="btn-ghost btn-sm">
            ← Fakultetlar
          </Link>
        }
      />

      {query.ok === "staff-deleted" && (
        <div className="mb-4">
          <Alert tone="ok">Mas'ul xodim o'chirildi.</Alert>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_400px]">
        <div className="space-y-4">
          {STAFF_ROLES.map((role) => {
            const members = faculty.staff.filter((s) => s.role === role);
            return (
              <Card
                key={role}
                title={STAFF_ROLE_ADMIN_LABELS[role as StaffRole]}
                description={roleHint(role)}
                bodyClassName="p-0"
              >
                {members.length === 0 ? (
                  <EmptyState
                    icon="👤"
                    title="Mas'ul biriktirilmagan"
                    description="Bu bo'lim botda «mas'ul hali biriktirilmagan» deb ko'rinadi."
                  />
                ) : (
                  <ul className="divide-y divide-[var(--border)]">
                    {members.map((staff) => (
                      <li key={staff.id} className="flex flex-wrap items-start gap-3 px-5 py-4">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-[14px] font-medium text-navy-900">
                              {staff.fullName}
                            </p>
                            {!staff.isActive && <Badge tone="muted">Nofaol</Badge>}
                            {staff.groupNames && <Badge tone="info">{staff.groupNames}</Badge>}
                            {staff.course && <Badge tone="info">{staff.course}-kurs</Badge>}
                          </div>
                          {staff.positionUz && (
                            <p className="mt-0.5 text-[13px] text-slate-500">{staff.positionUz}</p>
                          )}
                          <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-slate-500">
                            {staff.phone && <span>📞 {staff.phone}</span>}
                            {staff.telegram && <span>✈️ {staff.telegram}</span>}
                            {staff.email && <span>📧 {staff.email}</span>}
                            {staff.room && <span>🚪 {staff.room}</span>}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Link
                            href={`/faculties/${faculty.id}?staff=${staff.id}`}
                            className="btn-ghost btn-sm"
                          >
                            Tahrirlash
                          </Link>
                          <form action={deleteStaffAction}>
                            <input type="hidden" name="id" value={staff.id} />
                            <input type="hidden" name="facultyId" value={faculty.id} />
                            <SubmitButton
                              className="btn-danger btn-sm"
                              pendingText="…"
                              confirm={`"${staff.fullName}" o'chirilsinmi?`}
                            >
                              O'chirish
                            </SubmitButton>
                          </form>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            );
          })}
        </div>

        <aside className="space-y-5">
          <div className="lg:sticky lg:top-24 lg:space-y-5">
            <StaffForm key={editing?.id ?? "new"} facultyId={faculty.id} staff={editing} />
            {!editing && <FacultyForm faculty={faculty} />}
          </div>
        </aside>
      </div>
    </>
  );
}

function roleHint(role: string) {
  switch (role) {
    case "CURATOR":
      return "Talabaning guruhi bo'yicha avtomatik tanlanadi (Guruhlar maydoni).";
    case "VICE_DEAN":
      return "Talabaning kursi bo'yicha avtomatik tanlanadi (Kurs maydoni).";
    case "DEPARTMENT":
      return "Mutaxassislik kafedrasi mas'uli.";
    default:
      return "Fakultet dekani.";
  }
}
