import Link from "next/link";
import { prisma } from "@/lib/db";
import { Alert, Badge, Card, EmptyState, PageHeader } from "@/components/ui";
import { SubmitButton } from "@/components/client";
import { deleteMenuButtonAction, moveMenuButtonAction, resetMenuButtonsAction } from "@/app/actions/menu";
import { BUILTIN_ACTION_LABELS, BUTTON_TYPE_LABELS, groupIntoRows, type ButtonType } from "@/lib/menu";
import { MenuButtonForm } from "./form";

export const metadata = { title: "Menyu tugmalari" };
export const dynamic = "force-dynamic";

const TYPE_TONES: Record<string, string> = {
  BUILTIN: "navy",
  TEXT: "info",
  LINK: "warn",
  WEBAPP: "ok",
};

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const query = await searchParams;

  const buttons = await prisma.menuButton.findMany({
    orderBy: [{ row: "asc" }, { sort: "asc" }],
  });

  const editing = query.id ? buttons.find((b) => b.id === query.id) : undefined;
  const activeRows = groupIntoRows(
    buttons.filter((b) => b.isActive).map((b) => ({ ...b, contentUz: b.contentUz ?? null })),
  );

  return (
    <>
      <PageHeader
        title="Menyu tugmalari"
        description="Botning pastki qismidagi doimiy klaviatura. Tugmalar shu yerdan qo'shiladi va tartiblanadi."
        actions={
          <form action={resetMenuButtonsAction}>
            <SubmitButton
              className="btn-ghost btn-sm"
              pendingText="…"
              confirm="Barcha tugmalar o'chirilib, standart to'plam tiklanadi. Davom etilsinmi?"
            >
              Standart holatga qaytarish
            </SubmitButton>
          </form>
        }
      />

      {query.ok === "deleted" && (
        <div className="mb-4">
          <Alert tone="ok">Tugma o'chirildi.</Alert>
        </div>
      )}
      {query.ok === "reset" && (
        <div className="mb-4">
          <Alert tone="ok">Standart tugmalar tiklandi.</Alert>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_400px]">
        <div className="space-y-5">
          {/* Jonli ko'rinish */}
          <Card
            title="Botda qanday ko'rinadi"
            description="Telegram klaviaturasining taxminiy ko'rinishi"
            bodyClassName="p-4"
          >
            <div className="rounded-xl bg-[#e7edf3] p-3">
              <div className="mb-3 rounded-xl rounded-tl-sm bg-white px-3 py-2 text-[13px] text-slate-700 shadow-sm">
                🏠 <b>Asosiy menyu</b> — kerakli bo'limni tanlang 👇
              </div>
              {activeRows.length === 0 ? (
                <p className="py-4 text-center text-[13px] text-slate-500">
                  Faol tugma yo'q — bot menyusi bo'sh ko'rinadi.
                </p>
              ) : (
                <div className="space-y-1.5">
                  {activeRows.map((row, i) => (
                    <div key={i} className="flex gap-1.5">
                      {row.map((button) => (
                        <span
                          key={button.id}
                          className="flex-1 truncate rounded-md bg-[#f8fafc] px-3 py-2.5 text-center text-[13px] font-medium text-slate-700 shadow-sm ring-1 ring-slate-200"
                        >
                          {button.labelUz}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Tugmalar ro'yxati */}
          <Card
            title={`Tugmalar (${buttons.length})`}
            description="Qator raqami bir xil bo'lsa — tugmalar yonma-yon joylashadi."
            bodyClassName="p-0"
          >
            {buttons.length === 0 ? (
              <EmptyState
                icon="⌨️"
                title="Tugmalar yo'q"
                description="O'ng tomondagi forma orqali birinchi tugmani qo'shing."
              />
            ) : (
              <ul className="divide-y divide-[var(--border)]">
                {buttons.map((button) => (
                  <li key={button.id} className="flex flex-wrap items-center gap-3 px-5 py-3.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-[12px] font-semibold text-slate-600">
                      {button.row}.{button.sort}
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 text-[14px] font-medium text-navy-900">
                        {button.labelUz}
                        <Badge tone={TYPE_TONES[button.type] ?? "muted"}>
                          {BUTTON_TYPE_LABELS[button.type as ButtonType] ?? button.type}
                        </Badge>
                        {!button.isActive && <Badge tone="muted">Yashirilgan</Badge>}
                      </p>
                      <p className="mt-0.5 truncate text-[12px] text-slate-500">
                        {button.type === "BUILTIN"
                          ? (BUILTIN_ACTION_LABELS[
                              button.action as keyof typeof BUILTIN_ACTION_LABELS
                            ] ?? button.action)
                          : button.type === "WEBAPP"
                            ? button.url
                            : (button.contentUz ?? "").replace(/<[^>]+>/g, "").slice(0, 90)}
                      </p>
                      <p className="mt-0.5 text-[12px] text-slate-400">
                        🇷🇺 {button.labelRu} · 🇬🇧 {button.labelEn}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <form action={moveMenuButtonAction}>
                        <input type="hidden" name="id" value={button.id} />
                        <input type="hidden" name="direction" value="up" />
                        <SubmitButton className="btn-ghost btn-sm" pendingText="…">
                          ↑
                        </SubmitButton>
                      </form>
                      <form action={moveMenuButtonAction}>
                        <input type="hidden" name="id" value={button.id} />
                        <input type="hidden" name="direction" value="down" />
                        <SubmitButton className="btn-ghost btn-sm" pendingText="…">
                          ↓
                        </SubmitButton>
                      </form>
                      <Link href={`/menu?id=${button.id}`} className="btn-ghost btn-sm">
                        Tahrirlash
                      </Link>
                      <form action={deleteMenuButtonAction}>
                        <input type="hidden" name="id" value={button.id} />
                        <SubmitButton
                          className="btn-danger btn-sm"
                          pendingText="…"
                          confirm={`"${button.labelUz}" tugmasi o'chirilsinmi?`}
                        >
                          O'chirish
                        </SubmitButton>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        <aside>
          <div className="lg:sticky lg:top-24">
            <MenuButtonForm key={editing?.id ?? "new"} button={editing} />
          </div>
        </aside>
      </div>
    </>
  );
}
