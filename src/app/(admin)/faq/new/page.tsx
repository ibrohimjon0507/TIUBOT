import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui";
import { FaqForm } from "../form";

export const metadata = { title: "Yangi savol" };
export const dynamic = "force-dynamic";

export default async function NewFaqPage() {
  const categories = await prisma.faqCategory.findMany({
    orderBy: { sort: "asc" },
    select: { id: true, titleUz: true, emoji: true },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Yangi savol qo'shish"
        description="Savol va javob uchta tilda saqlanadi. Rus va ingliz tili bo'sh qolsa — o'zbekcha matn ishlatiladi."
        actions={
          <Link href="/faq" className="btn-ghost btn-sm">
            ← Savol-javoblar
          </Link>
        }
      />
      <FaqForm categories={categories} />
    </div>
  );
}
