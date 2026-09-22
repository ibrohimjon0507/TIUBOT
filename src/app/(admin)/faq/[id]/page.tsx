import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { Alert, Card, PageHeader } from "@/components/ui";
import { SubmitButton } from "@/components/client";
import { deleteFaqAction } from "@/app/actions/faq";
import { FaqForm } from "../form";

export const metadata = { title: "Savolni tahrirlash" };
export const dynamic = "force-dynamic";

export default async function FaqEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { id } = await params;
  const query = await searchParams;

  const [faq, categories] = await Promise.all([
    prisma.faq.findUnique({ where: { id } }),
    prisma.faqCategory.findMany({
      orderBy: { sort: "asc" },
      select: { id: true, titleUz: true, emoji: true },
    }),
  ]);
  if (!faq) notFound();

  return (
    <div className="mx-auto max-w-5xl">
      <PageHeader
        title="Savolni tahrirlash"
        description={`👁 ${faq.views} marta o'qilgan`}
        actions={
          <Link href="/faq" className="btn-ghost btn-sm">
            ← Savol-javoblar
          </Link>
        }
      />

      {query.ok === "created" && (
        <div className="mb-4">
          <Alert tone="ok">Savol qo'shildi va botda ko'rina boshladi.</Alert>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <FaqForm faq={faq} categories={categories} />

        <aside className="space-y-5">
          <Card title="Botda qanday ko'rinadi" bodyClassName="p-4">
            <div className="rounded-xl bg-[#e7edf3] p-3">
              <div className="rounded-xl rounded-tl-sm bg-white p-3 text-[13px] leading-relaxed text-slate-800 shadow-sm">
                <p className="font-semibold">❓ {faq.questionUz}</p>
                <div className="my-2 border-t border-slate-200" />
                <div
                  className="whitespace-pre-wrap break-words"
                  dangerouslySetInnerHTML={{ __html: faq.answerUz }}
                />
              </div>
            </div>
          </Card>

          <Card title="Xavfli amallar">
            <form action={deleteFaqAction}>
              <input type="hidden" name="id" value={faq.id} />
              <SubmitButton
                className="btn-danger w-full"
                pendingText="O'chirilmoqda…"
                confirm="Bu savol butunlay o'chirilsinmi?"
              >
                Savolni o'chirish
              </SubmitButton>
            </form>
          </Card>
        </aside>
      </div>
    </div>
  );
}
