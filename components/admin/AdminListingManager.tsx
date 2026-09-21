"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  faBoxArchive,
  faCheck,
  faClock,
  faEye,
  faFilePen,
  faLock,
  faPause,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  archiveDraftListing,
  moderateListing,
  setListingFeatured,
  type AdminListingType,
} from "@/app/admin/actions";
import { StatusBadge } from "@/components/admin/StatusUI";

type ListingRecord = {
  id: string;
  type: AdminListingType;
  title: string;
  status: string;
  featured: boolean;
  date: string;
  href: string;
  details: Record<string, unknown>;
};

export type AdminListingGroup = {
  name: string;
  records: ListingRecord[];
};

const statusFilters = [
  { value: "published", label: "Published", iconColor: "text-emerald-600", icon: faCheck },
  { value: "pending", label: "Pending", iconColor: "text-amber-500", icon: faClock },
  { value: "on_hold", label: "On hold", iconColor: "text-orange-600", icon: faPause },
  { value: "rejected", label: "Rejected", iconColor: "text-red-600", icon: faXmark },
  { value: "draft", label: "Draft", iconColor: "text-slate-600", icon: faFilePen },
  { value: "archived", label: "Archived", iconColor: "text-violet-600", icon: faBoxArchive },
  { value: "closed", label: "Closed", iconColor: "text-rose-700", icon: faLock },
] as const;

export function AdminListingManager({ groups }: { groups: AdminListingGroup[] }) {
  const [selectedStatuses, setSelectedStatuses] = useState(
    () => new Set(statusFilters.map((filter) => filter.value as string)),
  );
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [reviewing, setReviewing] = useState<ListingRecord | null>(null);
  const [approvalNotice, setApprovalNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!reviewing) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setReviewing(null);
    };
    document.addEventListener("keydown", close);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", close);
      document.body.style.overflow = "";
    };
  }, [reviewing]);

  useEffect(() => {
    if (!approvalNotice) return;
    const timer = window.setTimeout(() => setApprovalNotice(null), 4500);
    return () => window.clearTimeout(timer);
  }, [approvalNotice]);

  const counts = new Map(
    statusFilters.map((filter) => [
      filter.value,
      groups.reduce(
        (total, group) =>
          total + group.records.filter((record) => record.status === filter.value).length,
        0,
      ),
    ]),
  );
  const featuredCount = groups.reduce(
    (total, group) => total + group.records.filter((record) => record.featured).length,
    0,
  );
  const filteredGroups = groups.map((group) => ({
    ...group,
    records: group.records.filter(
      (record) => featuredOnly ? record.featured : selectedStatuses.has(record.status),
    ),
  }));
  const visibleCount = filteredGroups.reduce((total, group) => total + group.records.length, 0);
  const totalCount = groups.reduce((total, group) => total + group.records.length, 0);

  function toggleStatus(status: string) {
    setFeaturedOnly(false);
    setSelectedStatuses((current) => {
      const next = new Set(current);
      if (next.has(status)) next.delete(status);
      else next.add(status);
      return next;
    });
  }

  return (
    <>
      <section aria-label="Filter listings by status" className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-black text-[#0b1f3a]">Filter by status</h2>
            <p className="mt-1 text-xs text-slate-500">
              Showing {visibleCount} of {totalCount} listings
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedStatuses(new Set(statusFilters.map((filter) => filter.value)));
                setFeaturedOnly(false);
              }}
              className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-200"
            >
              Select all
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedStatuses(new Set());
                setFeaturedOnly(false);
              }}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-black text-slate-600 hover:bg-slate-50"
            >
              Clear
            </button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {statusFilters.map((filter) => (
            <label
              key={filter.value}
              className={`flex min-w-[12rem] cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition ${
                selectedStatuses.has(filter.value)
                  ? "border-slate-300 bg-slate-50 text-slate-900"
                  : "border-slate-200 bg-white text-slate-400"
              }`}
            >
              <input
                type="checkbox"
                checked={selectedStatuses.has(filter.value)}
                onChange={() => toggleStatus(filter.value)}
                className="peer sr-only"
              />
              <span className="relative h-5 w-9 shrink-0 rounded-full bg-slate-300 transition peer-checked:bg-[#0b1f3a] peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-amber-500 after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform peer-checked:after:translate-x-4" />
              {filter.label}
              <span className="rounded-full bg-white px-2 py-0.5 text-xs text-slate-500">
                {counts.get(filter.value) ?? 0}
              </span>
              <FontAwesomeIcon icon={filter.icon} className={`ml-auto w-3.5 ${filter.iconColor}`} />
            </label>
          ))}
          <button
            type="button"
            aria-pressed={featuredOnly}
            onClick={() => setFeaturedOnly((current) => !current)}
            className={`flex min-w-[12rem] items-center gap-2 rounded-xl border px-3 py-2 text-sm font-bold transition ${
              featuredOnly
                ? "border-violet-300 bg-violet-50 text-violet-900"
                : "border-slate-200 bg-white text-slate-600"
            }`}
          >
            <span
              aria-hidden="true"
              className={`relative h-5 w-9 shrink-0 rounded-full transition after:absolute after:left-0.5 after:top-0.5 after:size-4 after:rounded-full after:bg-white after:shadow-sm after:transition-transform ${
                featuredOnly
                  ? "bg-violet-600 after:translate-x-4"
                  : "bg-slate-300"
              }`}
            />
            Featured only
            <span className="rounded-full bg-white px-2 py-0.5 text-xs text-violet-700">
              {featuredCount}
            </span>
            <span aria-hidden="true" className="ml-auto text-violet-600">★</span>
          </button>
        </div>
      </section>

      <section className="mt-5 space-y-5">
        {visibleCount ? (
          filteredGroups.map((group) => (
            <article key={group.name} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <header className="flex items-center justify-between gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4">
                <h2 className="font-black text-[#0b1f3a]">{group.name}</h2>
                <span className="rounded-full bg-[#0b1f3a] px-3 py-1 text-xs font-black text-white">{group.records.length}</span>
              </header>
              {group.records.length ? (
                <div className="divide-y divide-slate-100">
                  {group.records.map((record) => (
                    <div key={record.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="truncate font-bold text-slate-900">{record.title}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-1.5">
                          <span className="mr-1 text-xs text-slate-500">
                            Added {new Date(record.date).toLocaleDateString("en-GB")}
                          </span>
                          <StatusBadge status={record.status} />
                          {record.featured && (
                            <span className="inline-flex items-center rounded-full border border-violet-200 bg-violet-100 px-2 py-1 text-[0.68rem] font-black text-violet-800">
                              ★ Featured
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setReviewing(record)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700 hover:bg-blue-100"
                        >
                          <FontAwesomeIcon icon={faEye} className="w-3" />
                          Review details
                        </button>
                        {record.type !== "rfq" && record.status === "published" && (
                          <FeaturedButton
                            type={record.type}
                            id={record.id}
                            featured={record.featured}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="px-5 py-8 text-center text-sm text-slate-500">
                  No {group.name.toLowerCase()} match the selected statuses.
                </p>
              )}
            </article>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
            <h2 className="text-xl font-black text-[#0b1f3a]">No listings match</h2>
            <p className="mt-2 text-sm text-slate-500">Select one or more statuses to display listings.</p>
          </div>
        )}
      </section>
      {reviewing && (
        <ListingReviewModal
          record={reviewing}
          onClose={() => setReviewing(null)}
          onApproved={() => {
            setReviewing(null);
            setApprovalNotice(reviewing.title);
          }}
        />
      )}
      {approvalNotice && (
        <div className="approval-toast fixed bottom-6 right-4 z-[120] w-[min(26rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-emerald-200 bg-white p-5 shadow-2xl" role="status" aria-live="polite">
          <div className="flex items-center gap-4">
            <span className="approval-check relative grid size-14 shrink-0 place-items-center rounded-full bg-emerald-600 text-2xl font-black text-white">
              ✓
              <span className="absolute inset-0 rounded-full bg-emerald-400 opacity-40 motion-safe:animate-ping" aria-hidden="true" />
            </span>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700">Listing approved</p>
              <p className="mt-1 font-black text-[#0b1f3a]">{approvalNotice}</p>
              <p className="mt-1 text-sm text-slate-600">The listing is now published and visible in its marketplace.</p>
            </div>
          </div>
          <div className="approval-progress absolute inset-x-0 bottom-0 h-1 bg-emerald-500" aria-hidden="true" />
        </div>
      )}
    </>
  );
}

function ListingReviewModal({ record, onClose, onApproved }: { record: ListingRecord; onClose: () => void; onApproved: () => void }) {
  const canModerate = record.type !== "rfq" && !["draft", "archived"].includes(record.status);
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-3 sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="listing-review-title" className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <header className="shrink-0 border-b border-slate-200 bg-white px-5 py-4 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700">Complete listing review</p>
              <h2 id="listing-review-title" className="mt-1 truncate text-2xl font-black text-[#0b1f3a]">{record.title}</h2>
              <div className="mt-2 flex items-center gap-2"><StatusBadge status={record.status} /><span className="text-xs text-slate-500">Submitted {new Date(record.date).toLocaleDateString("en-GB")}</span></div>
            </div>
            <button type="button" onClick={onClose} aria-label="Close listing review" className="grid size-10 shrink-0 place-items-center rounded-full bg-slate-100 text-xl font-black text-slate-600 hover:bg-slate-200">×</button>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            {record.type === "rfq" && <Link href="/admin/rfqs" className="rounded-lg bg-[#0b1f3a] px-4 py-2 text-sm font-black text-white">Open RFQ approval queue →</Link>}
            {canModerate && record.status !== "published" && <ModerationButton type={record.type} id={record.id} decision="approve" onCompleted={onApproved} />}
            {canModerate && record.status !== "on_hold" && <ModerationButton type={record.type} id={record.id} decision="hold" onCompleted={onClose} />}
            {canModerate && record.status !== "rejected" && <ModerationButton type={record.type} id={record.id} decision="reject" onCompleted={onClose} />}
            {record.status === "published" && <Link href={record.href} target="_blank" className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-black text-blue-700 hover:bg-blue-100">Open public listing ↗</Link>}
            {record.status === "draft" && <ArchiveDraftButton type={record.type} id={record.id} title={record.title} onCompleted={onClose} />}
            {record.status === "draft" && <p className="rounded-lg bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600">Draft listings cannot be approved until submitted.</p>}
            {record.status === "archived" && <p className="rounded-lg bg-violet-50 px-4 py-2 text-sm font-bold text-violet-700">This abandoned draft is archived and remains private.</p>}
          </div>
        </header>
        <div className="overflow-y-auto bg-slate-50 px-5 py-6 sm:px-7">
          <ReviewObject value={record.details} />
        </div>
      </section>
    </div>
  );
}

function ArchiveDraftButton({ type, id, title, onCompleted }: { type: AdminListingType; id: string; title: string; onCompleted: () => void }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function archiveDraft() {
    if (pending || !window.confirm(`Archive the draft “${title}”? It will remain private and leave the active draft queue.`)) return;
    setPending(true);
    try {
      await archiveDraftListing(type, id);
      onCompleted();
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button type="button" onClick={archiveDraft} disabled={pending} className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-black text-white hover:bg-violet-700 disabled:cursor-wait disabled:opacity-60">
      <FontAwesomeIcon icon={faBoxArchive} className="w-3.5" />
      {pending ? "Archiving…" : "Archive draft"}
    </button>
  );
}

const hiddenReviewKeys = new Set(["id", "ownerId", "buyerId", "categorySlug"]);
const imageKey = /(^image$|images|imageUrl|logoUrl|gallery)/i;
const urlKey = /(Url|website)$/i;

function labelFor(key: string) {
  return key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/_/g, " ").replace(/^./, (letter) => letter.toUpperCase());
}

function ReviewObject({ value }: { value: Record<string, unknown> }) {
  const entries = Object.entries(value).filter(([key, item]) => !hiddenReviewKeys.has(key) && item !== null && item !== "" && !(Array.isArray(item) && item.length === 0));
  return <div className="grid gap-4 lg:grid-cols-2">{entries.map(([key, item]) => <ReviewValue key={key} name={key} value={item} />)}</div>;
}

function ReviewValue({ name, value }: { name: string; value: unknown }) {
  if (Array.isArray(value)) {
    return <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2"><h3 className="font-black text-[#0b1f3a]">{labelFor(name)}</h3><div className="mt-3 grid gap-3 sm:grid-cols-2">{value.map((item, index) => typeof item === "string" ? (imageKey.test(name) ? <a key={index} href={item} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl border border-slate-200"><img src={item} alt={`${labelFor(name)} ${index + 1}`} className="h-44 w-full object-cover" /><span className="block truncate px-3 py-2 text-xs font-bold text-blue-700">Open image ↗</span></a> : <p key={index} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">{item}</p>) : <div key={index} className="rounded-xl border border-slate-200 p-4"><ReviewObject value={item as Record<string, unknown>} /></div>)}</div></section>;
  }
  if (typeof value === "object" && value) {
    return <section className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2"><h3 className="font-black text-[#0b1f3a]">{labelFor(name)}</h3><div className="mt-3"><ReviewObject value={value as Record<string, unknown>} /></div></section>;
  }
  const text = typeof value === "boolean" ? (value ? "Yes" : "No") : String(value);
  const isLink = urlKey.test(name) && /^https?:\/\//.test(text);
  return <div className="rounded-xl border border-slate-200 bg-white p-4"><dt className="text-xs font-black uppercase tracking-wide text-slate-500">{labelFor(name)}</dt><dd className="mt-1 break-words whitespace-pre-wrap text-sm font-semibold text-slate-900">{isLink ? <a href={text} target="_blank" rel="noreferrer" className="text-blue-700 underline">{text}</a> : text}</dd></div>;
}

function FeaturedButton({
  type,
  id,
  featured,
}: {
  type: Exclude<AdminListingType, "rfq">;
  id: string;
  featured: boolean;
}) {
  const action = setListingFeatured.bind(null, type, id, !featured);
  return (
    <form action={action}>
      <button
        type="submit"
        className={`rounded-lg px-3 py-1.5 text-xs font-black ${
          featured
            ? "border border-violet-200 bg-white text-violet-700 hover:bg-violet-50"
            : "bg-violet-600 text-white hover:bg-violet-700"
        }`}
      >
        {featured ? "Remove featured" : "Make featured"}
      </button>
    </form>
  );
}

function ModerationButton({
  type,
  id,
  decision,
  onCompleted,
}: {
  type: AdminListingType;
  id: string;
  decision: "approve" | "reject" | "hold";
  onCompleted?: () => void;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function runModeration() {
    if (pending) return;
    setPending(true);
    try {
      await moderateListing(type, id, decision);
      onCompleted?.();
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
      <button
        type="button"
        onClick={runModeration}
        disabled={pending}
        className={`rounded-lg px-4 py-2 text-sm font-black transition disabled:cursor-wait disabled:opacity-60 ${
          decision === "approve"
            ? "bg-emerald-600 text-white hover:bg-emerald-700"
            : decision === "hold"
              ? "bg-amber-500 text-slate-950 hover:bg-amber-600"
              : "bg-red-600 text-white hover:bg-red-700"
        }`}
      >
        {pending
          ? decision === "approve" ? "Approving…" : "Updating…"
          : decision === "approve" ? "Approve" : decision === "hold" ? "Put on hold" : "Reject"}
      </button>
  );
}
