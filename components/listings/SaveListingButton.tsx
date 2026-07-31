"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  toggleSavedListing,
  type SavedListingState,
} from "@/app/saved-listings/actions";
import type { SavedListingType } from "@/lib/saved-listings";

export function SaveListingButton({
  listingType,
  listingSlug,
  initialSaved,
  compact = false,
}: {
  listingType: SavedListingType;
  listingSlug: string;
  initialSaved: boolean;
  compact?: boolean;
}) {
  const [state, action, pending] = useActionState(toggleSavedListing, {
    success: false,
    saved: initialSaved,
    message: "",
  } satisfies SavedListingState);

  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      {state.message && !compact && (
        <span className={`text-sm font-bold ${state.success ? "text-emerald-700" : "text-red-700"}`}>
          {state.message}
        </span>
      )}
      {state.requiresLogin ? (
        <Link
          href="/login"
          className={compact
            ? "rounded-full bg-amber-400 px-3 py-2 text-xs font-black text-[#0b1f3a]"
            : "rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-black text-[#0b1f3a]"}
        >
          {compact ? "Sign in" : "Sign in to save"}
        </Link>
      ) : (
        <form action={action}>
          <input type="hidden" name="listingType" value={listingType} />
          <input type="hidden" name="listingSlug" value={listingSlug} />
          <button
            type="submit"
            disabled={pending}
            aria-label={state.saved ? "Remove from saved listings" : "Save listing"}
            title={state.message || (state.saved ? "Remove from saved listings" : "Save listing")}
            className={`${compact ? "rounded-full px-3 py-2 text-xs" : "rounded-xl px-5 py-2.5 text-sm"} border font-black transition disabled:opacity-60 ${
              state.saved
                ? "border-amber-400 bg-amber-400 text-[#0b1f3a]"
                : "border-slate-300 bg-white text-[#0b1f3a] hover:border-amber-400"
            }`}
          >
            {pending ? "Saving…" : state.saved ? "★ Saved" : compact ? "☆ Save" : "☆ Save listing"}
          </button>
        </form>
      )}
    </div>
  );
}
