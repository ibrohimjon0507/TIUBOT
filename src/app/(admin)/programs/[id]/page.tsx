import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Alert, Card, PageHeader } from "@/components/ui";
import { SubmitButton } from "@/components/client";
import { deleteProgramAction } from "@/app/actions/programs";
import { ProgramForm } from "../form";
import { getTranslator } from "@/lib/i18n";
import { renderProgram } from "@/bot/views";

export const metadata = { title: "Dasturni tahrirlash" };
export const dynamic = "force-dynamic";

export default async function ProgramEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { id } = await params;
  const query = await searchParams;

  const program = await prisma.studyAbroadProgram.findUnique({ where: { id } });
  if (!program) notFound();

  const tr = await getTranslator("uz");
  const preview = renderProgram(program, tr);

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title={program.titleUz}
        description={`${program.flag} ${program.country} · 👁 ${program.views} marta o'qilgan`}
        actions={
          <Link href="/programs" className="btn-ghost btn-sm">
            ← Dasturlar
          </Link>
        }
      />

      {query.ok === "created" && (
        <div className="mb-4">
          <Alert tone="ok">Dastur qo'shildi va botda ko'rina boshladi.</Alert>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <ProgramForm program={program} />

        <aside className="space-y-5">
          <div className="lg:sticky lg:top-24 lg:space-y-5">
            <Card title="Botda qanday ko'rinadi" bodyClassName="p-4">
              <div className="rounded-xl bg-[#e7edf3] p-3">
                <div
                  className="whitespace-pre-wrap break-words rounded-xl rounded-tl-sm bg-white p-3 text-[13px] leading-relaxed text-slate-800 shadow-sm"
                  dangerouslySetInnerHTML={{ __html: preview }}
                />
              </div>
            </Card>

            <Card title="Xavfli amallar">
              <form action={deleteProgramAction}>
                <input type="hidden" name="id" value={program.id} />
                <SubmitButton
                  className="btn-danger w-full"
                  pendingText="O'chirilmoqda…"
                  confirm="Bu dastur butunlay o'chirilsinmi?"
                >
                  Dasturni o'chirish
                </SubmitButton>
              </form>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  );
}
