import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Alert, Badge, Card, PageHeader } from "@/components/ui";
import { SubmitButton } from "@/components/client";
import { deleteStudentAction } from "@/app/actions/students";
import { StudentForm } from "../form";
import { getTranslator } from "@/lib/i18n";
import { renderStatus } from "@/bot/views";

export const metadata = { title: "Talabani tahrirlash" };
export const dynamic = "force-dynamic";

export default async function StudentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { id } = await params;
  const query = await searchParams;

  const student = await prisma.student.findUnique({
    where: { id },
    include: { faculty: true, botUsers: true },
  });
  if (!student) notFound();

  const faculties = await prisma.faculty.findMany({
    where: { isActive: true },
    orderBy: { sort: "asc" },
    select: { id: true, nameUz: true, code: true },
  });

  const tr = await getTranslator("uz");
  const preview = renderStatus(student, tr);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={student.fullName}
        description={`${student.passportSeries} · ${student.groupName} · ${student.course}-kurs`}
        actions={
          <Link href="/students" className="btn-ghost btn-sm">
            ← Talabalar ro'yxati
          </Link>
        }
      />

      {query.ok === "created" && (
        <div className="mb-4">
          <Alert tone="ok">Talaba bazaga qo'shildi. Endi u botdan foydalana oladi.</Alert>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <div>
          <StudentForm student={student} faculties={faculties} />
        </div>

        <aside className="space-y-5">
          {/* Bot ko'rinishi */}
          <Card
            title="Botda qanday ko'rinadi"
            description="«📊 Status» tugmasi bosilgandagi xabar"
            bodyClassName="p-4"
          >
            <div className="rounded-xl bg-[#e7edf3] p-3">
              <div
                className="whitespace-pre-wrap break-words rounded-xl rounded-tl-sm bg-white p-3 text-[13px] leading-relaxed text-slate-800 shadow-sm [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1"
                dangerouslySetInnerHTML={{ __html: preview }}
              />
            </div>
          </Card>

          {/* Bog'langan Telegram akkauntlar */}
          <Card title="Telegram akkauntlari" bodyClassName="p-0">
            {student.botUsers.length === 0 ? (
              <p className="px-5 py-6 text-center text-[13px] text-slate-500">
                Bu talaba hali botga kirmagan.
              </p>
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {student.botUsers.map((user) => (
                  <li key={user.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-medium text-navy-900">
                        {user.username ? `@${user.username}` : user.telegramId}
                      </p>
                      <p className="text-[12px] text-slate-500">
                        {[user.firstName, user.lastName].filter(Boolean).join(" ")} ·{" "}
                        {user.lang.toUpperCase()}
                      </p>
                    </div>
                    <Badge tone={user.isVerified ? "ok" : "muted"}>
                      {user.isVerified ? "Tasdiqlangan" : "—"}
                    </Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {/* Xavfli zona */}
          <Card title="Xavfli amallar">
            <p className="mb-3 text-[13px] text-slate-500">
              Talaba o'chirilsa, unga bog'langan Telegram akkauntlar tasdiqdan chiqadi va qayta
              pasport kiritishi so'raladi.
            </p>
            <form action={deleteStudentAction}>
              <input type="hidden" name="id" value={student.id} />
              <SubmitButton
                className="btn-danger w-full"
                pendingText="O'chirilmoqda…"
                confirm={`"${student.fullName}" bazadan butunlay o'chirilsinmi?`}
              >
                Talabani o'chirish
              </SubmitButton>
            </form>
          </Card>
        </aside>
      </div>
    </div>
  );
}
