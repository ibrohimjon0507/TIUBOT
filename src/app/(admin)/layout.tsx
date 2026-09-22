import { requireSession } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";
import { SidebarBrand, SidebarNav } from "@/components/Sidebar";
import { MobileNavToggle } from "@/components/client";
import { ADMIN_ROLE_LABELS, type AdminRole } from "@/lib/constants";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const initials = session.fullName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return (
    <div className="flex min-h-screen">
      {/* Sidebar — desktop */}
      <aside className="hidden w-64 shrink-0 flex-col bg-navy-900 p-4 lg:flex">
        <SidebarBrand />
        <SidebarNav />
        <div className="mt-auto rounded-lg bg-white/5 p-3">
          <p className="text-[11px] uppercase tracking-wide text-navy-400">Bot holati</p>
          <p className="mt-1 flex items-center gap-2 text-[13px] text-navy-100">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            Ishlamoqda
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-[var(--border)] bg-white/90 px-5 backdrop-blur">
          <div className="flex items-center gap-3">
            <MobileNavToggle>
              <SidebarBrand />
              <SidebarNav />
            </MobileNavToggle>
            <div className="lg:hidden">
              <span className="text-[15px] font-semibold text-navy-900">TIU Admin</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-[13px] font-medium leading-tight text-navy-900">
                {session.fullName}
              </p>
              <p className="text-[11px] leading-tight text-slate-500">
                {ADMIN_ROLE_LABELS[session.role as AdminRole] ?? session.role}
              </p>
            </div>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-navy-100 text-[13px] font-semibold text-navy-800">
              {initials || "A"}
            </span>
            <form action={logoutAction}>
              <button type="submit" className="btn-ghost btn-sm" title="Chiqish">
                Chiqish
              </button>
            </form>
          </div>
        </header>

        <main className="min-w-0 flex-1 p-5 lg:p-7">{children}</main>

        <footer className="border-t border-[var(--border)] px-5 py-4 text-[12px] text-slate-400">
          TIU Telegram bot boshqaruv paneli · {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}
