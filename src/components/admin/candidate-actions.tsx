"use client";

import { startTransition, useActionState, type FormEvent } from "react";
import { CircleCheck, LoaderCircle, Trash2 } from "lucide-react";
import { buttonClasses } from "@/components/ui/button";
import { deleteCandidateAction, saveCandidateReviewAction, type ReviewState } from "@/app/admin/actions";
import type { CandidateStatus } from "@/lib/data/candidates";

type Option = { value: string; label: string };

export function ReviewForm({ id, status, notes, statuses }: { id: string; status: CandidateStatus; notes: string; statuses: readonly Option[] }) {
  const [state, action, pending] = useActionState<ReviewState, FormData>(saveCandidateReviewAction.bind(null, id), {});
  // No automatic form reset: notes being written are never cleared by a save or an error.
  const onSubmit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const data = new FormData(ev.currentTarget);
    startTransition(() => action(data));
  };
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="review-status" className="block text-sm font-semibold text-navy-900">
          Status
        </label>
        <select id="review-status" name="status" defaultValue={status} className={field}>
          {statuses.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="review-notes" className="block text-sm font-semibold text-navy-900">
          Private notes
        </label>
        <textarea id="review-notes" name="notes" rows={6} maxLength={5000} defaultValue={notes} className={field} />
        <p className="mt-1 text-xs text-slate-600">Visible to admins only. Keep notes factual and job-related.</p>
      </div>
      <div className="flex items-center gap-3" aria-live="polite">
        <button type="submit" disabled={pending} className={buttonClasses()}>
          {pending && <LoaderCircle aria-hidden="true" className="size-4 animate-spin" />}
          Save
        </button>
        {state.saved && !pending && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-success-700">
            <CircleCheck aria-hidden="true" className="size-4" /> Saved
          </span>
        )}
        {state.error && <span className="text-sm text-danger-700">{state.error}</span>}
      </div>
    </form>
  );
}

export function DeleteCandidateButton({ id, name }: { id: string; name: string }) {
  return (
    <form
      action={deleteCandidateAction.bind(null, id)}
      onSubmit={(e) => {
        if (!window.confirm(`Permanently delete ${name}'s application and résumé? This can't be undone.`)) e.preventDefault();
      }}
    >
      <button type="submit" className={buttonClasses({ variant: "ghost", className: "text-danger-700 hover:bg-danger-50" })}>
        <Trash2 aria-hidden="true" className="size-4" />
        Delete application
      </button>
    </form>
  );
}

const field =
  "mt-1.5 block w-full rounded-xl border border-line-strong bg-white px-3 py-2.5 text-sm text-navy-900 focus:border-cobalt-600 focus:ring-2 focus:ring-cobalt-600/25 focus:outline-none";
