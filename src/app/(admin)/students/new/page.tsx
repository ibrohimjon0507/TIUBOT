import Link from "next/link";
import { prisma } from "@/lib/db";
import { PageHeader } from "@/components/ui";
import { StudentForm } from "../form";

export const metadata = { title: "Yangi talaba" };
export const dynamic = "force-dynamic";

export default async function NewStudentPage() {
  const faculties = await prisma.faculty.findMany({
    where: { isActive: true },
    orderBy: { sort: "asc" },
    select: { id: true, nameUz: true, code: true },
  });

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Yangi talaba qo'shish"
        description="Talaba botdan foydalanishi uchun pasport seriyasi bazada bo'lishi shart."
        actions={
          <Link href="/students" className="btn-ghost btn-sm">
            ← Talabalar ro'yxati
          </Link>
        }
      />
      <StudentForm faculties={faculties} />
    </div>
  );
}
