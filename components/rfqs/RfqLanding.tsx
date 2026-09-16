import Link from "next/link";

type BuyerQuotation = {
  id: string;
  reference: string;
  title: string;
  projectName: string;
  category: string;
  country: string;
  city: string;
  quantity: string;
  budget: string | null;
  expirationDate: string;
  quotationCount: number;
};

type SupplierQuotation = {
  id: string;
  reference: string;
  title: string;
  offerAmount: string;
  status: string;
  submittedAt: string | null;
};

export function RfqLanding({
  buyerQuotations,
  supplierQuotations,
  signedIn,
}: {
  buyerQuotations: BuyerQuotation[];
  supplierQuotations: SupplierQuotation[];
  signedIn: boolean;
}) {
  return (
    <main className="bg-slate-50">
      <div className="mb-10">
        <section className="bg-[#07172c] bg-[linear-gradient(135deg,rgba(6,18,36,.95),rgba(11,31,58,.88)),url('https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1800&q=82')] bg-cover bg-center text-white">
          <div className="mx-auto max-w-[1440px] px-6 pb-14 pt-12">
            <h1 className="text-3xl font-black tracking-tight !text-white sm:text-4xl">RFQ Marketplace</h1>
            <nav aria-label="Breadcrumb" className="mt-2 text-sm text-white"><Link href="/" className="text-white/70 hover:text-white">Home</Link><span className="mx-2 text-white/50">›</span><span className="font-bold text-white">RFQ Marketplace</span></nav>
            <p className="mt-3 max-w-3xl text-base font-medium leading-6 text-white">Buyers post procurement requirements and suppliers respond with competitive quotations across GCC markets.</p>
          </div>
        </section>

        <div className="relative z-10 mx-auto -mt-10 grid w-[calc(100%-3rem)] max-w-[1392px] gap-3 rounded-2xl bg-white p-3 shadow-[0_10px_30px_rgba(15,23,42,.18)] md:grid-cols-2">
          <article className="flex flex-col rounded-xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:gap-5">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-amber-400 text-2xl" aria-hidden="true">🛒</span>
            <div className="mt-4 min-w-0 flex-1 sm:mt-0">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-amber-700">I&apos;m a Buyer</p>
              <h2 className="mt-1 text-xl font-black text-[#0b1f3a]">Request competitive pricing</h2>
              <p className="mt-1 text-sm font-medium leading-6 text-slate-600">Post requirements, compare offers and award a supplier.</p>
              <div className="mt-4 flex flex-wrap gap-2"><Link href="/rfqs?view=buyers&create=1" className="rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-black text-[#0b1f3a] hover:bg-amber-300">＋ Add Buyer Quotation</Link><Link href="/rfqs?view=buyers" className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-[#0b1f3a] hover:border-amber-400">See All</Link></div>
            </div>
          </article>

          <article className="flex flex-col rounded-xl border border-blue-200 bg-blue-50 p-5 sm:flex-row sm:items-center sm:gap-5">
            <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-blue-600 text-2xl" aria-hidden="true">🏭</span>
            <div className="mt-4 min-w-0 flex-1 sm:mt-0">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-blue-700">I&apos;m a Supplier</p>
              <h2 className="mt-1 text-xl font-black text-[#0b1f3a]">Find requirements and quote</h2>
              <p className="mt-1 text-sm font-medium leading-6 text-slate-600">Find open RFQs and submit a private supplier quotation.</p>
              <div className="mt-4 flex flex-wrap gap-2"><Link href="/rfqs?view=buyers#available-rfqs" className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-black text-white hover:bg-blue-500">＋ Add Supplier Quotation</Link><Link href={signedIn ? "/my-quotations" : "/login"} className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-bold text-[#0b1f3a] hover:border-blue-400">See All</Link></div>
            </div>
          </article>
        </div>
      </div>

      <section className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6">
        <SectionHeading eyebrow="Buyer opportunities" title="Featured Buyer Quotations" description="Recent open procurement requests available to qualified suppliers." href="/rfqs?view=buyers" linkLabel="See all buyer quotations" />
        <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {buyerQuotations.map((rfq) => (
            <article key={rfq.id} className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg">
              <div className="flex items-center justify-between gap-3"><span className="text-xs font-black uppercase text-amber-700">{rfq.reference}</span><span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700">Open</span></div>
              <h3 className="mt-4 text-xl font-black text-[#0b1f3a]">{rfq.title}</h3>
              <p className="mt-2 text-sm font-semibold text-slate-500">{rfq.projectName}</p>
              <p className="mt-4 text-sm text-slate-600">{rfq.category} · {rfq.city}, {rfq.country}</p>
              <dl className="mt-5 grid grid-cols-2 gap-3 text-sm"><div className="rounded-xl bg-slate-50 p-3"><dt className="text-xs font-bold text-slate-400">Quantity</dt><dd className="mt-1 font-black text-slate-700">{rfq.quantity}</dd></div><div className="rounded-xl bg-slate-50 p-3"><dt className="text-xs font-bold text-slate-400">Budget</dt><dd className="mt-1 font-black text-emerald-700">{rfq.budget || "On request"}</dd></div></dl>
              <p className="mt-4 text-xs font-semibold text-slate-500">Closes {new Date(rfq.expirationDate).toLocaleDateString("en-GB")} · {rfq.quotationCount} quotations</p>
              <Link href={`/rfqs/${rfq.id}`} className="mt-5 block rounded-xl bg-[#0b1f3a] px-4 py-3 text-center text-sm font-black text-white">View RFQ & Submit Quotation</Link>
            </article>
          ))}
          {!buyerQuotations.length && <EmptyCard text="No open buyer quotations are currently available." />}
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6">
          <SectionHeading eyebrow="Supplier workspace" title="Featured Supplier Quotations" description="Supplier pricing stays private and is visible only to the supplier and the relevant buyer." href={signedIn ? "/my-quotations" : "/login"} linkLabel={signedIn ? "See all supplier quotations" : "Login to view quotations"} />
          <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {supplierQuotations.map((quotation) => (
              <article key={quotation.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-center justify-between gap-3"><span className="text-xs font-black uppercase text-blue-700">{quotation.reference}</span><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-black uppercase text-blue-700">{quotation.status.replace("_", " ")}</span></div>
                <h3 className="mt-4 text-xl font-black text-[#0b1f3a]">{quotation.title}</h3>
                <p className="mt-4 text-sm text-slate-500">Submitted price</p><p className="mt-1 text-2xl font-black text-emerald-700">{quotation.offerAmount}</p>
                {quotation.submittedAt && <p className="mt-3 text-xs font-semibold text-slate-500">Submitted {new Date(quotation.submittedAt).toLocaleDateString("en-GB")}</p>}
                <Link href={`/my-quotations/${quotation.id}`} className="mt-5 block rounded-xl border border-slate-300 bg-white px-4 py-3 text-center text-sm font-black text-[#0b1f3a]">View Private Quotation</Link>
              </article>
            ))}
            {!supplierQuotations.length && <EmptyCard text={signedIn ? "You have not submitted any supplier quotations yet." : "Log in to securely view and manage your supplier quotations."} />}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 py-14 sm:px-6">
        <div className="rounded-3xl bg-[#0b1f3a] p-7 text-white sm:p-10"><p className="text-sm font-black uppercase tracking-[0.2em] text-amber-400">Simple procurement workflow</p><h2 className="mt-3 text-3xl font-black !text-white">How RFQ Works</h2><div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{[["01", "Post Your RFQ", "Tell suppliers what you need."], ["02", "Receive Quotations", "Relevant suppliers submit private offers."], ["03", "Compare", "Review prices, terms and supplier information."], ["04", "Select", "Communicate and award the best quotation."]].map(([number, title, detail]) => <div key={number}><span className="text-3xl font-black text-amber-400">{number}</span><h3 className="mt-3 text-lg font-black !text-white">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-300">{detail}</p></div>)}</div></div>
      </section>
    </main>
  );
}

function SectionHeading({ eyebrow, title, description, href, linkLabel }: { eyebrow: string; title: string; description: string; href: string; linkLabel: string }) {
  return <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm font-black uppercase tracking-[0.18em] text-amber-700">{eyebrow}</p><h2 className="mt-2 text-3xl font-black text-[#0b1f3a]">{title}</h2><p className="mt-2 max-w-2xl text-slate-600">{description}</p></div><Link href={href} className="shrink-0 font-black text-blue-700">{linkLabel} →</Link></div>;
}

function EmptyCard({ text }: { text: string }) {
  return <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-600 md:col-span-2 xl:col-span-3">{text}</div>;
}
