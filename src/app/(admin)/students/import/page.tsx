import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { ImportForm } from "./form";

export const metadata = { title: "Talabalarni import qilish" };

export default function ImportPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader
        title="Talabalarni import qilish"
        description="Excel yoki HEMIS'dan yuklangan ma'lumotlarni bir vaqtda qo'shing."
        actions={
          <Link href="/students" className="btn-ghost btn-sm">
            ← Talabalar ro'yxati
          </Link>
        }
      />
      <ImportForm />
    </div>
  );
}
