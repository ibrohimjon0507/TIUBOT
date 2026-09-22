"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/app/actions/auth";
import { SubmitButton } from "@/components/client";
import { Field } from "@/components/ui";

export function LoginForm() {
  const [state, formAction] = useActionState<LoginState, FormData>(loginAction, {});

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {state.error}
        </div>
      )}

      <Field label="E-mail" required>
        <input
          name="email"
          type="email"
          className="input"
          placeholder="admin@tiu.uz"
          autoComplete="username"
          required
          autoFocus
        />
      </Field>

      <Field label="Parol" required>
        <input
          name="password"
          type="password"
          className="input"
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />
      </Field>

      <SubmitButton className="btn-primary w-full" pendingText="Tekshirilmoqda…">
        Kirish
      </SubmitButton>
    </form>
  );
}
