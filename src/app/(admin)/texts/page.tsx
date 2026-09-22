import Link from "next/link";
import { prisma } from "@/lib/db";
import { Badge, Card, PageHeader } from "@/components/ui";
import { DEFAULT_TEXTS } from "@/lib/texts";
import { TextEditor } from "./editor";

export const metadata = { title: "Bot matnlari" };
export const dynamic = "force-dynamic";

type Group = {
  slug: string;
  title: string;
  icon: string;
  description: string;
  match: (key: string) => boolean;
};

const GROUPS: Group[] = [
  {
    slug: "auth",
    title: "Kirish va tasdiqlash",
    icon: "🔐",
    description: "Til tanlash, pasport so'rash, tasdiqlash va xatolik xabarlari",
    match: (k) => k === "choose_lang" || k.startsWith("passport") || k === "ask_passport",
  },
  {
    slug: "menu",
    title: "Menyu va tugmalar",
    icon: "⌨️",
    description: "Asosiy menyu sarlavhasi va inline tugmalar yozuvi",
    match: (k) => k.startsWith("btn_") || k === "main_menu",
  },
  {
    slug: "status",
    title: "Status bo'limi",
    icon: "📊",
    description: "«📊 Status» xabaridagi barcha sarlavha va yozuvlar",
    match: (k) =>
      k.startsWith("status_") ||
      k.startsWith("lbl_") ||
      k.startsWith("no_") ||
      k.startsWith("contract_") ||
      k === "grant_note",
  },
  {
    slug: "content",
    title: "Savol-javob va dasturlar",
    icon: "📚",
    description: "FAQ hamda chet elda o'qish bo'limlari",
    match: (k) => k.startsWith("faq_") || k.startsWith("abroad_"),
  },
  {
    slug: "contacts",
    title: "Mas'ullar va yozishmalar",
    icon: "👥",
    description: "Bog'lanish bo'limi va xodimga xabar yozish oqimi",
    match: (k) => k.startsWith("contacts_") || k.startsWith("staff_"),
  },
  {
    slug: "admin",
    title: "Admin va Mini App",
    icon: "🛠",
    description: "Telegram orqali admin panelga ulanish matnlari",
    match: (k) => k.startsWith("admin_"),
  },
  {
    slug: "system",
    title: "Xizmat xabarlari",
    icon: "ℹ️",
    description: "Murojaat, yordam, xatolik va boshqa umumiy matnlar",
    match: () => true,
  },
];

export default async function TextsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const query = await searchParams;

  const rows = await prisma.botText.findMany();
  const byKey = new Map(rows.map((r) => [r.key, r]));

  // Kalitlarni guruhlarga taqsimlash
  const allKeys = Object.keys(DEFAULT_TEXTS);
  const used = new Set<string>();
  const groups = GROUPS.map((group) => {
    const keys = allKeys.filter((key) => !used.has(key) && group.match(key));
    keys.forEach((key) => used.add(key));
    return { ...group, keys };
  }).filter((group) => group.keys.length > 0);

  const activeGroup = groups.find((g) => g.slug === query.group) ?? groups[0];
  const activeKey =
    query.key && activeGroup.keys.includes(query.key) ? query.key : activeGroup.keys[0];

  const entry = DEFAULT_TEXTS[activeKey as keyof typeof DEFAULT_TEXTS];
  const row = byKey.get(activeKey);
  const current = row
    ? { uz: row.uz, ru: row.ru, en: row.en }
    : { uz: entry.uz, ru: entry.ru, en: entry.en };

  const changedCount = allKeys.filter((key) => {
    const def = DEFAULT_TEXTS[key as keyof typeof DEFAULT_TEXTS];
    const saved = byKey.get(key);
    return saved && (saved.uz !== def.uz || saved.ru !== def.ru || saved.en !== def.en);
  }).length;

  return (
    <>
      <PageHeader
        title="Bot matnlari"
        description={`Botdagi har bir xabarni uch tilda tahrirlang · ${allKeys.length} ta matn${
          changedCount > 0 ? ` · ${changedCount} tasi o'zgartirilgan` : ""
        }`}
      />

      {/* Guruhlar */}
      <div className="mb-5 flex flex-wrap gap-2">
        {groups.map((group) => {
          const active = group.slug === activeGroup.slug;
          return (
            <Link
              key={group.slug}
              href={`/texts?group=${group.slug}`}
              className={`inline-flex items-center gap-2 rounded-lg border px-3.5 py-2 text-[13px] font-medium transition ${
                active
                  ? "border-navy-800 bg-navy-800 text-white"
                  : "border-[var(--border)] bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>{group.icon}</span>
              {group.title}
              <span
                className={`rounded px-1.5 text-[11px] tabular-nums ${
                  active ? "bg-white/20" : "bg-slate-100 text-slate-500"
                }`}
              >
                {group.keys.length}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        {/* Kalitlar ro'yxati */}
        <Card
          title={activeGroup.title}
          description={activeGroup.description}
          bodyClassName="max-h-[70vh] overflow-y-auto p-0"
        >
          <ul className="divide-y divide-[var(--border)]">
            {activeGroup.keys.map((key) => {
              const def = DEFAULT_TEXTS[key as keyof typeof DEFAULT_TEXTS];
              const saved = byKey.get(key);
              const value = saved?.uz ?? def.uz;
              const modified =
                saved && (saved.uz !== def.uz || saved.ru !== def.ru || saved.en !== def.en);
              const selected = key === activeKey;

              return (
                <li key={key}>
                  <Link
                    href={`/texts?group=${activeGroup.slug}&key=${key}`}
                    className={`block px-4 py-3 transition ${
                      selected ? "bg-navy-50" : "hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <code
                        className={`rounded px-1.5 py-0.5 text-[11.5px] ${
                          selected ? "bg-navy-800 text-white" : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {key}
                      </code>
                      {modified && <Badge tone="info">●</Badge>}
                    </span>
                    <span className="mt-1.5 block line-clamp-2 text-[12.5px] leading-snug text-slate-500">
                      {value.replace(/<[^>]+>/g, "")}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>

        {/* Tahrirlash */}
        <TextEditor
          key={activeKey}
          textKey={activeKey}
          note={entry.note}
          current={current}
          defaults={{ uz: entry.uz, ru: entry.ru, en: entry.en }}
          backHref={`/texts?group=${activeGroup.slug}`}
        />
      </div>
    </>
  );
}
