"use client";

import Link from "next/link";
import { useState } from "react";
import {
  faCheck,
  faClock,
  faFilePen,
  faLock,
  faPause,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
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
  { value: "closed", label: "Closed", iconColor: "text-rose-700", icon: faLock },
] as const;

export function AdminListingManager({ groups }: { groups: AdminListingGroup[] }) {
  const [selectedStatuses, setSelectedStatuses] = useState(
    () => new Set(statusFilters.map((filter) => filter.value as string)),
  );
  const [featuredOnly, setFeaturedOnly] = useState(false);

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
                        {record.status === "published" && (
                          <Link
                            href={record.href}
                            className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-black text-blue-700 hover:bg-blue-100"
                          >
                            Details
                          </Link>
                        )}
                        {record.type !== "rfq" && record.status !== "draft" && record.status !== "published" && (
                          <ModerationButton type={record.type} id={record.id} decision="approve" />
                        )}
                        {record.type !== "rfq" && record.status !== "draft" && record.status !== "rejected" && (
                          <ModerationButton type={record.type} id={record.id} decision="reject" />
                        )}
                        {record.type !== "rfq" && record.status !== "draft" && record.status !== "on_hold" && (
                          <ModerationButton type={record.type} id={record.id} decision="hold" />
                        )}
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
    </>
  );
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
}: {
  type: AdminListingType;
  id: string;
  decision: "approve" | "reject" | "hold";
}) {
  const action = moderateListing.bind(null, type, id, decision);
  return (
    <form action={action}>
      <button
        type="submit"
        className={`rounded-lg px-3 py-1.5 text-xs font-black ${
          decision === "approve"
            ? "bg-emerald-600 text-white hover:bg-emerald-700"
            : decision === "hold"
              ? "bg-amber-500 text-slate-950 hover:bg-amber-600"
              : "bg-red-600 text-white hover:bg-red-700"
        }`}
      >
        {decision === "approve" ? "Approve" : decision === "hold" ? "Put on hold" : "Reject"}
      </button>
    </form>
  );
}
