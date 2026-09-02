import Link from "next/link";

export function ListingSubmissionSuccess({ message }: { message: string }) {
  return (
    <div className="submission-success relative mx-auto mt-16 max-w-2xl overflow-hidden rounded-3xl border border-emerald-200 bg-emerald-50 px-6 py-12 text-center shadow-lg shadow-emerald-900/5" role="status" aria-live="polite">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-emerald-400 via-amber-300 to-emerald-500" aria-hidden="true" />
      <div className="submission-check relative mx-auto grid size-20 place-items-center rounded-full bg-emerald-600 text-4xl font-black text-white shadow-xl shadow-emerald-600/25">
        ✓
        <span className="submission-ring absolute inset-0 rounded-full border-4 border-emerald-400" aria-hidden="true" />
      </div>
      <div className="submission-spark submission-spark-left" aria-hidden="true">◆</div>
      <div className="submission-spark submission-spark-right" aria-hidden="true">◆</div>
      <p className="mt-7 text-sm font-black uppercase tracking-[0.2em] text-emerald-700">Listing submitted successfully</p>
      <h1 className="mt-3 text-3xl font-black tracking-tight text-[#0b1f3a] sm:text-4xl">Your listing is awaiting approval</h1>
      <p className="mx-auto mt-4 max-w-xl text-lg text-slate-600">{message}</p>
      <p className="mx-auto mt-3 max-w-xl text-sm text-slate-500">It will remain private until an administrator reviews and approves it.</p>
      <Link href="/my-listings" className="mt-8 inline-flex rounded-full bg-[#0b1f3a] px-7 py-3 font-black text-white transition hover:-translate-y-0.5 hover:bg-slate-700">
        View my listings →
      </Link>
    </div>
  );
}
