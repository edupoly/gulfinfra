"use client";

import { deleteOwnedListing, type OwnedListingType } from "@/app/my-listings/actions";

export function DeleteListingButton({ type, id }: { type: OwnedListingType; id: string }) {
  return (
    <form
      action={deleteOwnedListing}
      onSubmit={(event) => {
        if (!window.confirm("Delete this listing permanently? This action cannot be undone.")) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="type" value={type} />
      <input type="hidden" name="id" value={id} />
      <button className="rounded-lg border border-red-200 px-4 py-2 text-sm font-black text-red-700 hover:bg-red-50">
        Delete
      </button>
    </form>
  );
}
