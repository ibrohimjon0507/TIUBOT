"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const NAV_SECTIONS: {
  title: string;
  items: { href: string; label: string; icon: string; exact?: boolean }[];
}[] = [
  {
    title: "Umumiy",
    items: [{ href: "/", label: "Boshqaruv paneli", icon: "📊", exact: true }],
  },
  {
    title: "Bot mazmuni",
    items: [
      { href: "/students", label: "Talabalar", icon: "🎓" },
      { href: "/faculties", label: "Fakultet va mas'ullar", icon: "🏛" },
      { href: "/faq", label: "Savol-javoblar", icon: "❓" },
      { href: "/programs", label: "Chet elda o'qish", icon: "🌍" },
    ],
  },
  {
    title: "Muloqot",
    items: [
      { href: "/messages", label: "Mas'ul xabarlari", icon: "💬" },
      { href: "/tickets", label: "Murojaatlar", icon: "✉️" },
      { href: "/broadcast", label: "Xabar yuborish", icon: "📢" },
      { href: "/bot-users", label: "Bot foydalanuvchilari", icon: "👥" },
    ],
  },
  {
    title: "Bot sozlamalari",
    items: [
      { href: "/menu", label: "Menyu tugmalari", icon: "⌨️" },
      { href: "/texts", label: "Bot matnlari", icon: "🌐" },
      { href: "/settings", label: "Sozlamalar", icon: "⚙️" },
    ],
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav className="space-y-6">
      {NAV_SECTIONS.map((section) => (
        <div key={section.title}>
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-navy-300/70">
            {section.title}
          </p>
          <ul className="space-y-1">
            {section.items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`nav-link ${isActive(item.href, item.exact) ? "nav-link-active" : ""}`}
                >
                  <span className="w-5 text-center text-[15px]">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export function SidebarBrand() {
  return (
    <Link href="/" className="mb-7 flex items-center gap-3 px-2">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400 text-lg font-bold text-navy-950">
        T
      </span>
      <span>
        <span className="block text-[15px] font-semibold leading-tight text-white">TIU Admin</span>
        <span className="block text-[11px] leading-tight text-navy-300">
          Telegram bot boshqaruvi
        </span>
      </span>
    </Link>
  );
}
