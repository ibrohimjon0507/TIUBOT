import Link from "next/link";
import { PageHeader } from "@/components/ui";
import { ProgramForm } from "../form";

export const metadata = { title: "Yangi dastur" };

export default function NewProgramPage() {
  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Yangi dastur qo'shish"
        description="Xalqaro almashinuv, double degree yoki yozgi maktab dasturi."
        actions={
          <Link href="/programs" className="btn-ghost btn-sm">
            ← Dasturlar
          </Link>
        }
      />
      <ProgramForm />
    </div>
  );
}
