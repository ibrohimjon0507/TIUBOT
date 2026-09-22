import Link from "next/link";
import { prisma } from "@/lib/db";
import { Alert, Badge, Card, EmptyState, PageHeader, Pagination } from "@/components/ui";
import { FilterSelect, SearchInput } from "@/components/client";
import type { Prisma } from "@prisma/client";
import {
  STATUS_ADMIN_LABELS,
  STATUS_COLORS,
  STUDENT_STATUSES,
  formatMoney,
  parseDebtSubjects,
  type StudentStatus,
} from "@/lib/constants";
import { studentSearchWhere } from "@/lib/search";

export const metadata = { title: "Talabalar" };
export const dynamic = "force-dynamic";

const PER_PAGE = 20;

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const q = params.q?.trim() ?? "";
  const status = params.status ?? "";
  const facultyId = params.faculty ?? "";
  const course = params.course ?? "";
  const page = Math.max(1, Number(params.page) || 1);

  const where: Prisma.StudentWhereInput = {
    ...(status ? { status } : {}),
    ...(facultyId ? { facultyId } : {}),
    ...(course ? { course: Number(course) } : {}),
    ...(studentSearchWhere(q) ?? {}),
  };

  const [students, total, faculties] = await Promise.all([
    prisma.student.findMany({
      where,
      include: { faculty: true },
      orderBy: [{ createdAt: "desc" }],
      skip: (page - 1) * PER_PAGE,
      take: PER_PAGE,
    }),
    prisma.student.count({ where }),
    prisma.faculty.findMany({ orderBy: { sort: "asc" } }),
  ]);

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <>
      <PageHeader
        title="Talabalar"
        description="Bot pasport seriyasi bo'yicha aynan shu bazadan qidiradi."
        actions={
          <>
            <Link href="/students/import" className="btn-ghost btn-sm">
              ⬆ CSV import
            </Link>
            <Link href="/students/new" className="btn-primary btn-sm">
              + Talaba qo'shish
            </Link>
          </>
        }
      />

      {params.ok === "deleted" && (
        <div className="mb-4">
          <Alert tone="ok">Talaba bazadan o'chirildi.</Alert>
        </div>
      )}

      <Card bodyClassName="p-0">
        <div className="flex flex-wrap items-center gap-3 border-b border-[var(--border)] p-4">
          <SearchInput
            placeholder="F.I.O, pasport, guruh yoki yo'nalish…"
            className="min-w-[260px] flex-1"
          />
          <FilterSelect
            paramName="status"
            placeholder="Barcha holatlar"
            className="w-auto min-w-[190px]"
            options={STUDENT_STATUSES.map((s) => ({ value: s, label: STATUS_ADMIN_LABELS[s] }))}
          />
          <FilterSelect
            paramName="faculty"
            placeholder="Barcha fakultetlar"
            className="w-auto min-w-[190px]"
            options={faculties.map((f) => ({ value: f.id, label: f.nameUz }))}
          />
          <FilterSelect
            paramName="course"
            placeholder="Barcha kurslar"
            className="w-auto min-w-[140px]"
            options={[1, 2, 3, 4, 5, 6].map((c) => ({ value: String(c), label: `${c}-kurs` }))}
          />
        </div>

        {students.length === 0 ? (
          <EmptyState
            icon="🎓"
            title="Talaba topilmadi"
            description={
              q || status || facultyId || course
                ? "Filtrlarni o'zgartirib ko'ring yoki qidiruvni tozalang."
                : "Bazaga birinchi talabani qo'shing yoki CSV fayl orqali import qiling."
            }
            action={
              <Link href="/students/new" className="btn-primary btn-sm">
                + Talaba qo'shish
              </Link>
            }
          />
        ) : (
          <>
            <div className="table-wrap">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Talaba</th>
                    <th>Pasport</th>
                    <th>Fakultet / yo'nalish</th>
                    <th>Kurs · guruh</th>
                    <th>Holati</th>
                    <th className="text-right">Kontrakt qarzi</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    const debts = parseDebtSubjects(student.debtSubjects);
                    const debt = Math.max(0, student.contractTotal - student.contractPaid);
                    const statusKey = student.status as StudentStatus;
                    return (
                      <tr key={student.id}>
                        <td>
                          <Link
                            href={`/students/${student.id}`}
                            className="font-medium text-navy-900 hover:underline"
                          >
                            {student.fullName}
                          </Link>
                          {!student.isActive && (
                            <span className="ml-2 text-[11px] text-slate-400">(nofaol)</span>
                          )}
                          {debts.length > 0 && (
                            <p className="mt-0.5 text-[12px] text-amber-600">
                              {debts.length} ta qarzdor fan
                            </p>
                          )}
                        </td>
                        <td>
                          <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[12px] text-slate-700">
                            {student.passportSeries}
                          </code>
                        </td>
                        <td>
                          <p className="text-[13px]">
                            {student.faculty?.nameUz ?? student.facultyName ?? "—"}
                          </p>
                          <p className="text-[12px] text-slate-500">{student.program}</p>
                        </td>
                        <td className="whitespace-nowrap text-[13px]">
                          {student.course}-kurs · {student.groupName}
                        </td>
                        <td>
                          <Badge tone={STATUS_COLORS[statusKey]}>
                            {STATUS_ADMIN_LABELS[statusKey] ?? student.status}
                          </Badge>
                        </td>
                        <td className="whitespace-nowrap text-right tabular-nums">
                          {student.eduType === "GRANT" ? (
                            <span className="text-[13px] text-slate-400">Grant</span>
                          ) : debt > 0 ? (
                            <span className="font-medium text-red-600">{formatMoney(debt)}</span>
                          ) : (
                            <span className="text-emerald-600">0</span>
                          )}
                        </td>
                        <td className="text-right">
                          <Link
                            href={`/students/${student.id}`}
                            className="btn-ghost btn-sm whitespace-nowrap"
                          >
                            Tahrirlash
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-[var(--border)] px-5 py-3 text-[13px] text-slate-500">
              <span>Jami: {total} ta talaba</span>
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              basePath="/students"
              params={{ q, status, faculty: facultyId, course }}
            />
          </>
        )}
      </Card>
    </>
  );
}
