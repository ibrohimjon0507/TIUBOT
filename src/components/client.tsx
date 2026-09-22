"use client";

import { useFormStatus } from "react-dom";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

/** Server action yuborilayotganda "yuklanmoqda" holatini ko'rsatadi */
export function SubmitButton({
  children = "Saqlash",
  className = "btn-primary",
  pendingText = "Saqlanmoqda…",
  confirm,
}: {
  children?: ReactNode;
  className?: string;
  pendingText?: string;
  confirm?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className={className}
      disabled={pending}
      onClick={(event) => {
        if (confirm && !window.confirm(confirm)) event.preventDefault();
      }}
    >
      {pending ? pendingText : children}
    </button>
  );
}

/** Qidiruv maydoni — yozganda URL query yangilanadi (debounce) */
export function SearchInput({
  placeholder = "Qidirish…",
  paramName = "q",
  className = "",
}: {
  placeholder?: string;
  paramName?: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(searchParams.get(paramName) ?? "");

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(paramName, value);
      else params.delete(paramName);
      params.delete("page");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <div className={`relative ${className}`}>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
        🔍
      </span>
      <input
        className="input pl-9"
        placeholder={placeholder}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}

/** Tanlov (select) — o'zgarganda URL query yangilanadi */
export function FilterSelect({
  paramName,
  options,
  placeholder = "Barchasi",
  className = "",
}: {
  paramName: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <select
      className={`input ${className}`}
      value={searchParams.get(paramName) ?? ""}
      onChange={(e) => {
        const params = new URLSearchParams(searchParams.toString());
        if (e.target.value) params.set(paramName, e.target.value);
        else params.delete(paramName);
        params.delete("page");
        const query = params.toString();
        router.replace(query ? `${pathname}?${query}` : pathname);
      }}
    >
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/** Uch tilli matn maydonlari — tab bilan almashadi */
export function LangTabs({
  uz,
  ru,
  en,
  label,
}: {
  uz: ReactNode;
  ru: ReactNode;
  en: ReactNode;
  label?: string;
}) {
  const [tab, setTab] = useState<"uz" | "ru" | "en">("uz");
  const tabs = [
    { key: "uz" as const, label: "🇺🇿 O'zbekcha" },
    { key: "ru" as const, label: "🇷🇺 Русский" },
    { key: "en" as const, label: "🇬🇧 English" },
  ];

  return (
    <div>
      {label && <p className="label">{label}</p>}
      <div className="mb-3 inline-flex rounded-lg border border-[var(--border)] bg-slate-50 p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={`rounded-md px-3 py-1.5 text-[13px] font-medium transition ${
              tab === t.key
                ? "bg-white text-navy-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className={tab === "uz" ? "" : "hidden"}>{uz}</div>
      <div className={tab === "ru" ? "" : "hidden"}>{ru}</div>
      <div className={tab === "en" ? "" : "hidden"}>{en}</div>
    </div>
  );
}

/** Mobil menyu tugmasi */
export function MobileNavToggle({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <button
        type="button"
        aria-label="Menyu"
        onClick={() => setOpen((v) => !v)}
        className="btn-ghost btn-sm lg:hidden"
      >
        ☰
      </button>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-navy-950/50"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute left-0 top-0 h-full w-72 overflow-y-auto bg-navy-900 p-4">
            {children}
          </div>
        </div>
      )}
    </>
  );
}
