import Link from "next/link";
import { prisma } from "@/lib/db";
import { Alert, Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { SubmitButton } from "@/components/client";
import { deleteFaqCategoryAction } from "@/app/actions/faq";
import { FaqCategoryForm } from "./category-form";

export const metadata = { title: "Savol-javoblar" };
export const dynamic = "force-dynamic";

export default async function FaqPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const query = await searchParams;

  const [categories, uncategorized] = await Promise.all([
    prisma.faqCategory.findMany({
      orderBy: [{ sort: "asc" }, { createdAt: "asc" }],
      include: { items: { orderBy: [{ sort: "asc" }, { createdAt: "asc" }] } },
    }),
    prisma.faq.findMany({
      where: { categoryId: null },
      orderBy: [{ sort: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  const editing = query.category
    ? (categories.find((c) => c.id === query.category) ?? undefined)
    : undefined;

  const totalQuestions =
    categories.reduce((sum, c) => sum + c.items.length, 0) + uncategorized.length;

  return (
    <>
      <PageHeader
        title="Savol-javoblar"
        description={`Botdagi «❓ Savol-javoblar» bo'limi · ${totalQuestions} ta savol`}
        actions={
          <Link href="/faq/new" className="btn-primary btn-sm">
            + Savol qo'shish
          </Link>
        }
      />

      {query.ok === "deleted" && (
        <div className="mb-4">
          <Alert tone="ok">Savol o'chirildi.</Alert>
        </div>
      )}
      {query.ok === "category-deleted" && (
        <div className="mb-4">
          <Alert tone="ok">Kategoriya o'chirildi, savollar saqlanib qoldi.</Alert>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {categories.length === 0 && uncategorized.length === 0 && (
            <Card bodyClassName="p-0">
              <EmptyState
                icon="❓"
                title="Savol-javoblar qo'shilmagan"
                description="Avval kategoriya yarating, so'ng unga savollar qo'shing."
                action={
                  <Link href="/faq/new" className="btn-primary btn-sm">
                    + Savol qo'shish
                  </Link>
                }
              />
            </Card>
          )}

          {categories.map((category) => (
            <Card
              key={category.id}
              bodyClassName="p-0"
              title={`${category.emoji} ${category.titleUz}`}
              description={`${category.items.length} ta savol · ${category.titleRu}`}
              actions={
                <div className="flex items-center gap-2">
                  {!category.isActive && <Badge tone="muted">Nofaol</Badge>}
                  <Link href={`/faq?category=${category.id}`} className="btn-ghost btn-sm">
                    Tahrirlash
                  </Link>
                  <form action={deleteFaqCategoryAction}>
                    <input type="hidden" name="id" value={category.id} />
                    <SubmitButton
                      className="btn-danger btn-sm"
                      pendingText="…"
                      confirm={`"${category.titleUz}" kategoriyasi o'chirilsinmi? Savollar saqlanib qoladi.`}
                    >
                      O'chirish
                    </SubmitButton>
                  </form>
                </div>
              }
            >
              {category.items.length === 0 ? (
                <p className="px-5 py-6 text-center text-[13px] text-slate-500">
                  Bu kategoriyada savol yo'q.
                </p>
              ) : (
                <ul className="divide-y divide-[var(--border)]">
                  {category.items.map((faq) => (
                    <FaqRow key={faq.id} faq={faq} />
                  ))}
                </ul>
              )}
            </Card>
          ))}

          {uncategorized.length > 0 && (
            <Card
              title="Kategoriyasiz savollar"
              description="Bu savollar botda umumiy ro'yxatda ko'rsatiladi."
              bodyClassName="p-0"
            >
              <ul className="divide-y divide-[var(--border)]">
                {uncategorized.map((faq) => (
                  <FaqRow key={faq.id} faq={faq} />
                ))}
              </ul>
            </Card>
          )}
        </div>

        <aside>
          <div className="lg:sticky lg:top-24">
            <FaqCategoryForm key={editing?.id ?? "new"} category={editing} />
          </div>
        </aside>
      </div>
    </>
  );
}

function FaqRow({
  faq,
}: {
  faq: { id: string; questionUz: string; views: number; isActive: boolean; sort: number };
}) {
  return (
    <li className="flex items-center gap-3 px-5 py-3">
      <div className="min-w-0 flex-1">
        <Link
          href={`/faq/${faq.id}`}
          className="text-[14px] font-medium text-navy-900 hover:underline"
        >
          {faq.questionUz}
        </Link>
        <p className="mt-0.5 text-[12px] text-slate-500">
          👁 {faq.views} marta o'qilgan · tartib: {faq.sort}
        </p>
      </div>
      {!faq.isActive && <Badge tone="muted">Yashirilgan</Badge>}
      <Link href={`/faq/${faq.id}`} className="btn-ghost btn-sm">
        Tahrirlash
      </Link>
    </li>
  );
}
