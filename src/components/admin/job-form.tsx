"use client";

import { startTransition, useActionState, type FormEvent } from "react";
import { CircleAlert, LoaderCircle } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { Field, inputProps } from "@/components/forms/form-kit";
import { saveJobAction, type JobFormState } from "@/app/admin/actions";
import type { JobPostingField } from "@/lib/validation/job-posting";

export type JobFormValues = Record<JobPostingField, string>;

/** Post or edit a role. `slug` is null when posting a new role. */
export function JobForm({ slug, values }: { slug: string | null; values: JobFormValues }) {
  const [state, action, pending] = useActionState<JobFormState, FormData>(saveJobAction.bind(null, slug), {});
  const e = state.errors ?? {};
  // Submit without React's automatic form reset, so what the admin typed is never cleared after a validation
  // error, even if they keep typing while the response arrives.
  const onSubmit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const data = new FormData(ev.currentTarget);
    startTransition(() => action(data));
  };
  const id = (name: string) => `job-${name}`;
  const text = (name: JobPostingField, label: string, hint: string | undefined, required = true) => (
    <Field id={id(name)} label={label} hint={hint} required={required} error={e[name]}>
      <input name={name} type="text" defaultValue={values[name]} required={required} {...inputProps(id(name), e[name])} />
    </Field>
  );
  const area = (name: JobPostingField, label: string, hint: string, rows: number, required = true) => (
    <Field id={id(name)} label={label} hint={hint} required={required} error={e[name]}>
      <textarea name={name} rows={rows} defaultValue={values[name]} required={required} {...inputProps(id(name), e[name])} />
    </Field>
  );

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-8">
      {state.error && (
        <p role="alert" className="flex items-center gap-2 rounded-xl border border-danger-600/30 bg-danger-50 p-4 text-sm text-danger-700">
          <CircleAlert aria-hidden="true" className="size-4 shrink-0" />
          {state.error}
        </p>
      )}

      <fieldset className="space-y-6">
        <legend className="text-lg font-semibold">Basics</legend>
        {text("title", "Job title", "Shown as the page heading, e.g. “Senior Software Engineer — AI/ML”.")}
        <div className="grid gap-6 sm:grid-cols-2">
          {text("shortTitle", "Short title", "Optional · used in tight spaces, e.g. “AI/ML Engineer”.", false)}
          {text("team", "Team", "e.g. Engineering or Operations.")}
        </div>
        {area("summary", "Summary", "One or two sentences shown on the careers list and in search results.", 3)}
      </fieldset>

      <fieldset className="space-y-6">
        <legend className="text-lg font-semibold">Terms</legend>
        <p className="-mt-3 text-sm text-slate-600">Only state terms you&apos;ve confirmed. Leave blank to show “Shared during the hiring process”.</p>
        {text("location", "Location", "e.g. Remote — worldwide (outside the United States)", false)}
        <div className="grid gap-6 sm:grid-cols-2">
          {text("employmentType", "Employment type", "e.g. Full-time", false)}
          {text("compensation", "Compensation", "e.g. USD 2,000 per month", false)}
        </div>
      </fieldset>

      <fieldset className="space-y-6">
        <legend className="text-lg font-semibold">Description</legend>
        {area("overview", "About the role", "One or more paragraphs. Separate paragraphs with a blank line.", 8)}
        {area("workOn", "What you'd work on", "One responsibility per line.", 8)}
        {area("lookingFor", "What we're looking for", "One requirement per line.", 7)}
        {area("niceToHave", "Nice to have", "Optional · one per line.", 5, false)}
        {text("skills", "Key skills", "Optional · comma-separated, e.g. Python, SQL, APIs", false)}
      </fieldset>

      {slug === null && (
        <label className="flex items-start gap-3 rounded-xl bg-paper p-4 ring-1 ring-line">
          <input name="publish" type="checkbox" defaultChecked className="mt-0.5 size-5 shrink-0 accent-cobalt-600" />
          <span className="text-sm text-navy-900">
            <span className="font-semibold">Publish now</span> — show this role on the careers page and accept applications.
            Untick to save it as withdrawn and publish later.
          </span>
        </label>
      )}

      <button type="submit" disabled={pending} className={buttonClasses({ size: "lg" })}>
        {pending && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
        {slug ? "Save changes" : "Post role"}
      </button>
    </form>
  );
}
