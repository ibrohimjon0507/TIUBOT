import Link from "next/link";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[22px] font-semibold tracking-tight text-navy-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}

export function Card({
  title,
  description,
  actions,
  children,
  className = "",
  bodyClassName = "p-5",
}: {
  title?: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={`card ${className}`}>
      {(title || actions) && (
        <div className="card-head">
          <div>
            {title && <h2 className="text-[15px] font-semibold text-navy-900">{title}</h2>}
            {description && <p className="mt-0.5 text-[13px] text-slate-500">{description}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}

export function Field({
  label,
  hint,
  required,
  children,
  className = "",
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="label">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-[12px] text-slate-400">{hint}</p>}
    </div>
  );
}

const TONES: Record<string, string> = {
  ok: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  warn: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  danger: "bg-red-50 text-red-700 ring-1 ring-red-200",
  info: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
  muted: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  navy: "bg-navy-50 text-navy-800 ring-1 ring-navy-200",
};

export function Badge({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: keyof typeof TONES | string;
}) {
  return <span className={`badge ${TONES[tone] ?? TONES.muted}`}>{children}</span>;
}

export function EmptyState({
  icon = "📭",
  title,
  description,
  action,
}: {
  icon?: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
      <div className="text-3xl">{icon}</div>
      <p className="text-[15px] font-medium text-slate-700">{title}</p>
      {description && <p className="max-w-md text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "navy",
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  tone?: string;
  icon?: string;
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-slate-500">{label}</p>
        {icon && (
          <span className={`badge ${TONES[tone] ?? TONES.navy} text-[14px]`}>{icon}</span>
        )}
      </div>
      <p className="mt-2 text-[26px] font-semibold leading-none tracking-tight text-navy-900">
        {value}
      </p>
      {hint && <p className="mt-2 text-[12px] text-slate-400">{hint}</p>}
    </div>
  );
}

export function Pagination({
  page,
  totalPages,
  basePath,
  params = {},
}: {
  page: number;
  totalPages: number;
  basePath: string;
  params?: Record<string, string | undefined>;
}) {
  if (totalPages <= 1) return null;

  const href = (p: number) => {
    const search = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v) search.set(k, v);
    search.set("page", String(p));
    return `${basePath}?${search.toString()}`;
  };

  return (
    <nav className="flex items-center justify-between gap-3 border-t border-[var(--border)] px-5 py-3">
      <p className="text-[13px] text-slate-500">
        {page} / {totalPages} sahifa
      </p>
      <div className="flex gap-2">
        {page > 1 && (
          <Link href={href(page - 1)} className="btn-ghost btn-sm">
            ← Oldingi
          </Link>
        )}
        {page < totalPages && (
          <Link href={href(page + 1)} className="btn-ghost btn-sm">
            Keyingi →
          </Link>
        )}
      </div>
    </nav>
  );
}

/** Server action natijasi uchun xabar */
export function Alert({
  tone = "info",
  children,
}: {
  tone?: "ok" | "danger" | "info" | "warn";
  children: ReactNode;
}) {
  const map = {
    ok: "border-emerald-200 bg-emerald-50 text-emerald-800",
    danger: "border-red-200 bg-red-50 text-red-700",
    info: "border-sky-200 bg-sky-50 text-sky-800",
    warn: "border-amber-200 bg-amber-50 text-amber-800",
  };
  return (
    <div className={`rounded-lg border px-4 py-3 text-sm ${map[tone]}`} role="status">
      {children}
    </div>
  );
}
