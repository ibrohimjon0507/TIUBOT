import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { LoginForm } from "./form";

export const metadata = { title: "Kirish" };

export default async function LoginPage() {
  if (await getSession()) redirect("/");

  return (
    <main className="grid min-h-screen lg:grid-cols-2">
      {/* Chap tomon — brend */}
      <section className="relative hidden flex-col justify-between bg-navy-900 p-12 text-white lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, #648ecd 0, transparent 45%), radial-gradient(circle at 80% 70%, #e2b54b 0, transparent 40%)",
          }}
        />
        <div className="relative flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-400 text-xl font-bold text-navy-950">
            T
          </span>
          <div>
            <p className="text-[15px] font-semibold leading-tight">
              Toshkent Xalqaro Universiteti
            </p>
            <p className="text-[12px] text-navy-300">Tashkent International University</p>
          </div>
        </div>

        <div className="relative max-w-md">
          <h2 className="text-[30px] font-semibold leading-tight tracking-tight">
            Telegram bot boshqaruv paneli
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-navy-200">
            Talabalar ma'lumotlari, savol-javoblar, xalqaro dasturlar va fakultet mas'ullari —
            barchasi bitta tizimda.
          </p>
          <ul className="mt-8 space-y-3 text-sm text-navy-100">
            <li className="flex items-center gap-3">
              <span className="text-gold-400">◆</span> Uch tilli bot mazmuni (UZ / RU / EN)
            </li>
            <li className="flex items-center gap-3">
              <span className="text-gold-400">◆</span> Pasport seriyasi bo'yicha tasdiqlash
            </li>
            <li className="flex items-center gap-3">
              <span className="text-gold-400">◆</span> Talaba holati va kontrakt nazorati
            </li>
          </ul>
        </div>

        <p className="relative text-[12px] text-navy-400">
          © {new Date().getFullYear()} TIU. Barcha huquqlar himoyalangan.
        </p>
      </section>

      {/* O'ng tomon — forma */}
      <section className="flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-[400px]">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-900 text-lg font-bold text-gold-400">
              T
            </span>
            <span className="text-[15px] font-semibold text-navy-900">TIU Admin</span>
          </div>

          <h1 className="text-[24px] font-semibold tracking-tight text-navy-900">
            Tizimga kirish
          </h1>
          <p className="mt-1.5 text-sm text-slate-500">
            Boshqaruv paneliga kirish uchun ma'lumotlaringizni kiriting.
          </p>

          <div className="mt-7">
            <LoginForm />
          </div>

          <p className="mt-8 text-center text-[12px] text-slate-400">
            Kirish huquqi faqat universitet mas'ul xodimlari uchun.
          </p>
        </div>
      </section>
    </main>
  );
}
