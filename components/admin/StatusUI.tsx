import {
  faBoxArchive,
  faCheck,
  faClock,
  faFilePen,
  faLock,
  faPause,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export type StatusCounts = {
  published: number;
  draft: number;
  pending: number;
  closed: number;
  rejected: number;
  on_hold: number;
};

export function countStatuses(statuses: string[]): StatusCounts {
  return statuses.reduce<StatusCounts>(
    (counts, status) => {
      if (status in counts) counts[status as keyof StatusCounts] += 1;
      return counts;
    },
    { published: 0, draft: 0, pending: 0, closed: 0, rejected: 0, on_hold: 0 },
  );
}

export function StatusCount({
  label,
  count,
  tone,
}: {
  label: string;
  count: number;
  tone: "emerald" | "slate" | "amber" | "red";
}) {
  const tones = {
    emerald: "bg-emerald-50 text-emerald-700",
    slate: "bg-slate-100 text-slate-700",
    amber: "bg-amber-50 text-amber-800",
    red: "bg-red-50 text-red-700",
  };
  return (
    <div className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2 ${tones[tone]}`}>
      <p className="text-[0.68rem] font-black uppercase tracking-wide">{label}</p>
      <p className="text-lg font-black">{count}</p>
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const statusMeta = {
    published: {
      label: "Published",
      icon: faCheck,
      className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
    pending: {
      label: "Pending",
      icon: faClock,
      className: "border-amber-200 bg-amber-50 text-amber-800",
    },
    on_hold: {
      label: "On hold",
      icon: faPause,
      className: "border-orange-200 bg-orange-50 text-orange-800",
    },
    rejected: {
      label: "Rejected",
      icon: faXmark,
      className: "border-red-200 bg-red-50 text-red-700",
    },
    draft: {
      label: "Draft",
      icon: faFilePen,
      className: "border-slate-200 bg-slate-100 text-slate-700",
    },
    archived: {
      label: "Archived",
      icon: faBoxArchive,
      className: "border-violet-200 bg-violet-50 text-violet-700",
    },
    closed: {
      label: "Closed",
      icon: faLock,
      className: "border-rose-200 bg-rose-50 text-rose-700",
    },
  } as const;
  const meta = statusMeta[status as keyof typeof statusMeta] ?? {
    label: status.replaceAll("_", " "),
    icon: faClock,
    className: "border-slate-200 bg-slate-50 text-slate-700",
  };

  return (
    <span className={`inline-flex min-w-[5.75rem] items-center justify-center gap-1 rounded-full border px-2 py-1 text-[0.68rem] font-black ${meta.className}`}>
      <FontAwesomeIcon icon={meta.icon} className="w-2.5" />
      {meta.label}
    </span>
  );
}
