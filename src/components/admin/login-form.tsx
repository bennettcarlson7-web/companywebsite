"use client";

import { useActionState } from "react";
import { CircleAlert, LoaderCircle, MailCheck } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { inputProps } from "@/components/forms/form-kit";
import { requestCodeAction, verifyCodeAction, type LoginState } from "@/app/admin/actions";

export function LoginForm() {
  const [requestState, request, requesting] = useActionState<LoginState, FormData>(requestCodeAction, { step: "email" });
  const [verifyState, verify, verifying] = useActionState<LoginState, FormData>(verifyCodeAction, { step: "code" });
  const onCodeStep = requestState.step === "code";

  if (!onCodeStep) {
    return (
      <form action={request} className="space-y-5" noValidate>
        <div>
          <label htmlFor="admin-email" className="block text-sm font-semibold text-navy-900">
            Admin email
          </label>
          <input
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            defaultValue={requestState.email}
            {...withMargin(inputProps("admin-email", requestState.error))}
          />
          <p id="admin-email-hint" className="mt-1.5 text-sm text-slate-600">
            We&apos;ll email you a 6-digit sign-in code. No password needed.
          </p>
        </div>
        <ErrorText id="admin-email-error" message={requestState.error} />
        <button type="submit" disabled={requesting} className={buttonClasses({ className: "w-full" })}>
          {requesting && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
          Email me a code
        </button>
      </form>
    );
  }

  const email = requestState.email ?? "";
  return (
    <div className="space-y-5">
      <p role="status" className="flex gap-2 rounded-xl bg-cobalt-50 p-4 text-sm text-navy-900 ring-1 ring-cobalt-100">
        <MailCheck aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-cobalt-700" />
        <span>{requestState.message}</span>
      </p>
      <form action={verify} className="space-y-5" noValidate>
        <input type="hidden" name="email" value={email} />
        <div>
          <label htmlFor="admin-code" className="block text-sm font-semibold text-navy-900">
            6-digit code
          </label>
          <input
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={7}
            required
            autoFocus
            {...withMargin(inputProps("admin-code", verifyState.error), "text-center text-2xl tracking-[0.5em]")}
          />
          <p id="admin-code-hint" className="mt-1.5 text-sm text-slate-600">
            Sent to {email}
          </p>
        </div>
        <ErrorText id="admin-code-error" message={verifyState.error} />
        <button type="submit" disabled={verifying} className={buttonClasses({ className: "w-full" })}>
          {verifying && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
          Sign in
        </button>
      </form>
      <form action={request}>
        <input type="hidden" name="email" value={email} />
        <button type="submit" disabled={requesting} className="text-sm font-semibold text-cobalt-700 underline underline-offset-2">
          Send a new code
        </button>
      </form>
    </div>
  );
}

const withMargin = (p: ReturnType<typeof inputProps>, extra = "") => ({ ...p, className: `${p.className} mt-2 ${extra}` });

function ErrorText({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="flex items-center gap-1.5 text-sm text-danger-700">
      <CircleAlert aria-hidden="true" className="size-4 shrink-0" />
      {message}
    </p>
  );
}
