"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { saveRfq, type RfqActionState } from "@/app/rfqs/actions";
import { EmailAuthFlow } from "@/components/auth/EmailAuthFlow";
import { FileDropzone, type FileDropzoneHandle } from "@/components/uploads/FileDropzone";
import type { CityOption, CountryOption } from "@/services/location-service";

export type RfqRecord = {
  id: string;
  reference: string;
  title: string;
  projectName: string;
  materialService: string | null;
  category: string;
  status: string;
  country: string;
  city: string;
  address: string | null;
  quantity: string;
  unit: string | null;
  specifications: string | null;
  notes: string | null;
  budget: string | null;
  urgency: string;
  deliveryDate: string | null;
  expirationDate: string;
  deliveryTerms: string;
  description: string;
  phone: string;
  email: string;
  boqUrl: string | null;
  drawingsUrl: string | null;
  specificationDocumentUrl: string | null;
  otherDocumentUrls: string[];
  postedAt: string;
  quotationCount: number;
};

const defaultCategories = ["Construction Materials", "Civil Works", "MEP", "Electrical", "Plumbing", "HVAC", "Finishing", "Other"];
const statuses = ["published", "draft", "closed"];
const newRfqDefaults = {
  projectName: "Dubai Creek Infrastructure Development",
  materialService: "Ready-Mix Concrete Grade C40",
  category: "Construction Materials",
  country: "United Arab Emirates",
  city: "Dubai",
  deliveryDate: "",
  expirationDate: "",
  budget: "AED 850,000",
  quantity: "5,000",
  unit: "Cubic Meters",
  specifications:
    "Supply ready-mix concrete Grade C40 compliant with UAE construction standards. Include batch certificates, slump-test reports, cube-test results, and scheduled deliveries aligned with the project programme.",
  address: "Dubai Creek Harbour Infrastructure Site, Dubai, UAE",
  notes:
    "Pricing should include transport, pumping coordination, quality testing, and staged delivery. Suppliers must confirm daily production capacity.",
  phone: "+971 50 555 0147",
  email: "",
  boqUrl: "https://example.com/documents/ready-mix-concrete-boq.pdf",
  drawingsUrl: "https://example.com/documents/site-layout-drawings.pdf",
  specificationDocumentUrl:
    "https://example.com/documents/concrete-technical-specifications.pdf",
  otherDocumentUrls:
    "https://example.com/documents/commercial-terms.pdf\nhttps://example.com/documents/delivery-schedule.pdf",
};

export function RfqWorkspace({
  rfqs,
  signedInEmail,
  initialCreate,
  initialRfqId,
  initialEditRfqId,
  locations,
  categories: categoryOptions,
}: {
  rfqs: RfqRecord[];
  signedInEmail: string | null;
  initialCreate: boolean;
  initialRfqId: string | null;
  initialEditRfqId: string | null;
  locations: { countries: CountryOption[]; cities: CityOption[] };
  categories: string[];
}) {
  const categories = categoryOptions.length ? categoryOptions : defaultCategories;
  const router = useRouter();
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [category, setCategory] = useState("All Categories");
  const [country, setCountry] = useState("All Countries");
  const [city, setCity] = useState("All Cities");
  const [closingDate, setClosingDate] = useState("");
  const [query, setQuery] = useState("");
  const [formRfq, setFormRfq] = useState<RfqRecord | null | undefined>(
    initialCreate ? null : initialEditRfqId ? rfqs.find((rfq) => rfq.id === initialEditRfqId) : undefined,
  );
  const [detailsRfq, setDetailsRfq] = useState<RfqRecord | null>(
    () => rfqs.find((rfq) => rfq.id === initialRfqId) ?? null,
  );

  const countries = locations.countries.map((item) => item.name);
  const cities = useMemo(
    () =>
      country === "All Countries"
        ? locations.cities.map((item) => item.name)
        : locations.cities
            .filter((item) => locations.countries.find((row) => row.name === country)?.code === item.countryCode)
            .map((item) => item.name),
    [country, locations],
  );

  const counts = useMemo(
    () => ({
      statuses: Object.fromEntries(
        statuses.map((status) => [status, rfqs.filter((item) => item.status === status).length]),
      ),
      categories: Object.fromEntries(
        categories.map((item) => [item, rfqs.filter((rfq) => rfq.category === item).length]),
      ),
    }),
    [categories, rfqs],
  );

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return rfqs.filter((rfq) => {
      const matchesStatus =
        selectedStatuses.length === 0 || selectedStatuses.includes(rfq.status);
      const matchesCategory = category === "All Categories" || rfq.category === category;
      const matchesCountry = country === "All Countries" || rfq.country === country;
      const matchesCity = city === "All Cities" || rfq.city === city;
      const matchesClosingDate =
        !closingDate || rfq.expirationDate.slice(0, 10) === closingDate;
      const matchesQuery =
        !normalizedQuery ||
        [rfq.title, rfq.projectName, rfq.reference, rfq.city, rfq.country]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);
      return (
        matchesStatus &&
        matchesCategory &&
        matchesCountry &&
        matchesCity &&
        matchesClosingDate &&
        matchesQuery
      );
    });
  }, [category, city, closingDate, country, query, rfqs, selectedStatuses]);

  function resetFilters() {
    setSelectedStatuses([]);
    setCategory("All Categories");
    setCountry("All Countries");
    setCity("All Cities");
    setClosingDate("");
    setQuery("");
  }

  return (
    <>
      <section className="bg-[#0b1f3a] text-white">
        <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.22em] text-amber-300">
                Procurement workspace
              </p>
              <h1 className="mt-3 text-4xl font-black !text-white sm:text-5xl">
                Requests for Quotation
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-slate-300">
              Browse active GCC procurement opportunities and submit competitive quotations.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFormRfq(null)}
              className="w-fit rounded-xl bg-amber-400 px-6 py-3 font-black text-slate-950 shadow-lg transition hover:bg-amber-300"
            >
              ＋ Create New RFQ
            </button>
          </div>
        </div>
      </section>

      <main id="available-rfqs" className="mx-auto w-full max-w-[1440px] scroll-mt-28 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xl font-black text-[#0b1f3a]">Available RFQs</h2>
            <p className="text-sm text-slate-500">
              {filtered.length} of {rfqs.length} requests shown
            </p>
          </div>
          <label className="relative block w-full sm:max-w-md">
            <span className="sr-only">Search RFQs</span>
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2">⌕</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title, project, reference or location"
              className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
            />
          </label>
        </div>

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-28">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h2 className="text-lg font-black text-[#0b1f3a]">Filters</h2>
              <button
                type="button"
                onClick={resetFilters}
                className="text-sm font-bold text-blue-700 underline"
              >
                Reset
              </button>
            </div>

            <fieldset className="border-b border-slate-200 py-6">
              <legend className="mb-4 text-sm font-black uppercase tracking-[0.08em] text-[#0b1f3a]">
                RFQ Status
              </legend>
              <div className="space-y-3">
                {statuses.map((status) => (
                  <label key={status} className="flex cursor-pointer items-center gap-3 text-sm text-slate-600">
                    <input
                      type="checkbox"
                      checked={selectedStatuses.includes(status)}
                      onChange={() =>
                        setSelectedStatuses((current) =>
                          current.includes(status)
                            ? current.filter((item) => item !== status)
                            : [...current, status],
                        )
                      }
                      className="size-4 accent-[#0b1f3a]"
                    />
                    <span className="capitalize">{status}</span>
                    <span className="ml-auto text-xs text-slate-400">
                      ({counts.statuses[status]})
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="border-b border-slate-200 py-6">
              <legend className="mb-4 text-sm font-black uppercase tracking-[0.08em] text-[#0b1f3a]">
                RFQ Category
              </legend>
              <div className="space-y-3">
                {["All Categories", ...categories].map((item) => (
                  <label key={item} className="flex cursor-pointer items-center gap-3 text-sm text-slate-600">
                    <input
                      type="radio"
                      name="categoryFilter"
                      checked={category === item}
                      onChange={() => setCategory(item)}
                      className="size-4 accent-[#0b1f3a]"
                    />
                    <span>{item}</span>
                    {item !== "All Categories" && (
                      <span className="ml-auto text-xs text-slate-400">
                        ({counts.categories[item]})
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset className="pt-6">
              <legend className="mb-4 text-sm font-black uppercase tracking-[0.08em] text-[#0b1f3a]">
                Location & Closing
              </legend>
              <div className="space-y-4">
                <label className="block text-sm font-bold text-slate-600">
                  Country
                  <select
                    value={country}
                    onChange={(event) => {
                      setCountry(event.target.value);
                      setCity("All Cities");
                    }}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal text-slate-700 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  >
                    <option>All Countries</option>
                    {countries.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm font-bold text-slate-600">
                  City
                  <select
                    value={city}
                    onChange={(event) => setCity(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal text-slate-700 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  >
                    <option>All Cities</option>
                    {cities.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>

                <label className="block text-sm font-bold text-slate-600">
                  Closing Date
                  <input
                    type="date"
                    value={closingDate}
                    onChange={(event) => setClosingDate(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 font-normal text-slate-700 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
                  />
                </label>
              </div>
            </fieldset>
          </aside>

          <section className="space-y-4" aria-label="RFQ listings">
            {filtered.length ? (
              filtered.map((rfq) => (
                <RfqCard
                  key={rfq.id}
                  rfq={rfq}
                  onDetails={() => setDetailsRfq(rfq)}
                />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                <p className="text-xl font-black text-[#0b1f3a]">No RFQs match these filters</p>
                <button type="button" onClick={resetFilters} className="mt-3 font-bold text-amber-700">
                  Clear all filters
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      {formRfq !== undefined && (
        <RfqFormModal
          rfq={formRfq}
          signedInEmail={signedInEmail}
          onClose={() => setFormRfq(undefined)}
          onSaved={() => {
            setFormRfq(undefined);
            router.refresh();
          }}
          locations={locations}
          categories={categories}
        />
      )}
      {detailsRfq && (
        <RfqDetailsModal rfq={detailsRfq} onClose={() => setDetailsRfq(null)} />
      )}
    </>
  );
}

function RfqCard({
  rfq,
  onDetails,
}: {
  rfq: RfqRecord;
  onDetails: () => void;
}) {
  const statusStyle =
    rfq.status === "published"
      ? "bg-emerald-500 text-white"
      : rfq.status === "closed"
        ? "bg-slate-500 text-white"
        : "bg-amber-500 text-white";

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      <div className="grid lg:grid-cols-[130px_minmax(0,1fr)_260px]">
        <div className="relative m-5 mb-0 grid min-h-28 place-items-center rounded-xl border border-slate-200 bg-slate-50 lg:mb-5">
          <span className={`absolute left-2 top-2 rounded px-2.5 py-1 text-[0.68rem] font-black uppercase ${statusStyle}`}>
            {rfq.status === "published" ? "Open" : rfq.status}
          </span>
          <span className="mt-5 text-4xl" aria-hidden="true">
            {rfq.category === "Materials Sourcing" ? "📦" : "🏗️"}
          </span>
        </div>

        <div className="p-5 lg:pl-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-xl font-black text-[#0b1f3a]">{rfq.title}</h3>
            <span className="rounded border border-slate-300 bg-slate-50 px-2 py-0.5 text-xs font-bold text-slate-600">
              {rfq.reference}
            </span>
          </div>
          <p className="mt-1 text-sm font-bold text-slate-500">
            Project: {rfq.projectName} | {rfq.category}
          </p>
          <p className="mt-2 text-sm font-bold uppercase text-slate-500">
            ● {rfq.city}, {rfq.country}
          </p>
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{rfq.description}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
            <span className="rounded border border-blue-200 bg-blue-50 px-3 py-1.5 text-blue-700">
              Qty: {rfq.quantity}
            </span>
            <span className="rounded border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-emerald-700">
              Budget: {rfq.budget || "On request"}
            </span>
            <span className="rounded border border-amber-200 bg-amber-50 px-3 py-1.5 text-amber-700">
              Closing: {formatDate(rfq.expirationDate)}
            </span>
          </div>
        </div>

        <div className="border-t border-slate-200 p-5 lg:border-l lg:border-t-0">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Posted {formatDate(rfq.postedAt)}</span>
            <span className="rounded-full bg-blue-50 px-3 py-1 font-bold text-blue-700">
              🗎 {rfq.quotationCount} {rfq.quotationCount === 1 ? "Bid" : "Bids"}
            </span>
          </div>
          <p className="mt-4 text-[0.68rem] font-black uppercase tracking-wide text-slate-400">Required date</p>
          <p className="mt-1 text-sm font-bold text-[#0b1f3a]">{rfq.deliveryDate ? formatDate(rfq.deliveryDate) : "Not specified"}</p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button type="button" onClick={onDetails} className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm font-black text-[#0b1f3a]">Details</button>
            <Link href={`/rfqs/${rfq.id}`} className="rounded-xl bg-[#0b1f3a] px-3 py-2.5 text-center text-sm font-black text-white">View / Quote →</Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function RfqFormModal({
  rfq,
  signedInEmail,
  onClose,
  onSaved,
  locations,
  categories,
}: {
  rfq: RfqRecord | null;
  signedInEmail: string | null;
  onClose: () => void;
  onSaved: () => void;
  locations: { countries: CountryOption[]; cities: CityOption[] };
  categories: string[];
}) {
  const [step, setStep] = useState(1);
  const [review, setReview] = useState<Record<string, string>>({});
  const [contactEmail, setContactEmail] = useState(
    rfq?.email || signedInEmail || newRfqDefaults.email,
  );
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(
    rfq ? rfq.email : null,
  );
  const [formCountry, setFormCountry] = useState(rfq?.country || newRfqDefaults.country);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const formRef = useRef<HTMLFormElement>(null);
  const documentUploadRefs = useRef<Array<FileDropzoneHandle | null>>([]);
  const [uploadingDocuments, setUploadingDocuments] = useState(false);
  const [state, action, pending] = useActionState(async (previousState: RfqActionState, data: FormData) => {
    const result = await saveRfq(previousState, data);
    if (result.errors && Object.keys(result.errors).length > 0) {
      const stepOneFields = ["projectName", "materialService", "category", "country", "city", "deliveryDate", "expirationDate"];
      setStep(Object.keys(result.errors).some((name) => stepOneFields.includes(name)) ? 1 : 2);
    }
    return result;
  }, {
    success: false,
    message: "",
  } satisfies RfqActionState);
  const field =
    "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100";

  function validateStep(stepToValidate: number) {
    const form = formRef.current;
    if (!form) return false;

    const stepContainer = form.querySelector<HTMLElement>(`[data-rfq-step="${stepToValidate}"]`);
    if (!stepContainer) return true;

    const controls = Array.from(
      stepContainer.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
        "input, select, textarea",
      ),
    );

    if (stepToValidate === 1) {
      const delivery = form.elements.namedItem("deliveryDate") as HTMLInputElement | null;
      const expiration = form.elements.namedItem("expirationDate") as HTMLInputElement | null;
      delivery?.setCustomValidity("");
      if (delivery?.value && expiration?.value && new Date(delivery.value) <= new Date(expiration.value)) {
        delivery.setCustomValidity("Delivery must be scheduled after the RFQ closing date.");
      }
    }

    const errors: Record<string, string> = {};
    for (const control of controls) {
      if (control.name && !control.checkValidity()) {
        errors[control.name] = control.validationMessage;
      }
    }
    setClientErrors((current) => ({ ...current, ...errors }));
    return Object.keys(errors).length === 0;
  }

  function continueFromStep(currentStep: number, nextStep: number) {
    if (!validateStep(currentStep)) return;
    setStep(nextStep);
  }

  function clearClientError(event: React.FormEvent<HTMLFormElement>) {
    const control = event.target as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
    if (!control.name || !clientErrors[control.name]) return;
    setClientErrors((current) => {
      const next = { ...current };
      delete next[control.name];
      return next;
    });
  }

  async function uploadDocumentsBeforeSubmit(event: React.FormEvent<HTMLFormElement>) {
    const pendingDropzones = documentUploadRefs.current.filter(
      (dropzone): dropzone is FileDropzoneHandle => Boolean(dropzone?.hasPendingFiles()),
    );
    if (!pendingDropzones.length) return;

    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    setUploadingDocuments(true);
    const results = await Promise.all(pendingDropzones.map((dropzone) => dropzone.uploadPendingFiles()));
    setUploadingDocuments(false);
    if (results.some((uploaded) => !uploaded)) return;

    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    formRef.current?.requestSubmit(submitter ?? undefined);
  }

  if (state.success && state.rfq) {
    return (
      <ModalShell title="RFQ submitted" onClose={onSaved}>
        <div className="px-6 py-12 text-center sm:px-10">
          <div className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-100 text-3xl text-emerald-700">✓</div>
          <h2 className="mt-5 text-3xl font-black text-[#0b1f3a]">Your RFQ is ready for review</h2>
          <p className="mt-3 text-slate-600">Reference number</p>
          <p className="mt-1 text-xl font-black text-amber-700">{state.rfq.reference}</p>
          <p className="mt-4 text-sm text-slate-500">We have linked this RFQ to your verified email. You can track it from My RFQs.</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/my-rfqs" className="rounded-xl bg-[#0b1f3a] px-6 py-3 font-black text-white">Go to My RFQs</Link>
            <button type="button" onClick={onSaved} className="rounded-xl border border-slate-300 px-6 py-3 font-bold">Browse RFQs</button>
          </div>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell title={rfq ? `Edit ${rfq.reference}` : "Create New RFQ"} onClose={onClose}>
      <div className="px-5 py-6 sm:px-10">
        <ol className="relative mb-9 flex items-center justify-between">
          <div className="absolute inset-x-4 top-1/2 h-0.5 -translate-y-1/2 bg-slate-200" />
          {[1, 2, 3, 4].map((item) => (
            <li
              key={item}
              className={`relative z-10 grid size-9 place-items-center rounded-full font-black ${
                item <= step ? "bg-amber-400 text-slate-950" : "border-2 border-slate-200 bg-white text-slate-400"
              }`}
            >
              {item}
            </li>
          ))}
        </ol>

        <form id="rfq-form" ref={formRef} action={action} noValidate onInput={clearClientError} onSubmit={uploadDocumentsBeforeSubmit}>
          {rfq && <input type="hidden" name="id" value={rfq.id} />}
          <div data-rfq-step="1" className={step === 1 ? "block" : "hidden"}>
            <div className="mb-7 text-center">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-600">Step 1 of 4</p>
              <h2 className="mt-2 text-3xl font-black text-[#0b1f3a]">Project & Procurement</h2>
              <p className="mt-2 text-slate-500">Define what is needed and the key procurement dates.</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Project Name" error={clientErrors.projectName || state.errors?.projectName}>
                <input name="projectName" required defaultValue={rfq?.projectName || newRfqDefaults.projectName} placeholder="Associated project" className={field} />
              </Field>
              <Field label="RFQ Category" error={clientErrors.category || state.errors?.category}>
                <select name="category" required defaultValue={rfq?.category || newRfqDefaults.category} className={field}>
                  {categories.map((item) => <option key={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="Material / Service" error={clientErrors.materialService || state.errors?.materialService} wide>
                <input name="materialService" required defaultValue={rfq?.materialService || rfq?.title || newRfqDefaults.materialService} placeholder="e.g. Premium grade bitumen MC-30" className={field} />
              </Field>
              <Field label="GCC Country Served" error={clientErrors.country || state.errors?.country}>
                <select name="country" required value={formCountry} onChange={(event) => setFormCountry(event.target.value)} className={field}>
                  {locations.countries.map((item) => <option key={item.code}>{item.name}</option>)}
                </select>
              </Field>
              <Field label="City" error={clientErrors.city || state.errors?.city}>
                <select name="city" required defaultValue={rfq?.city || newRfqDefaults.city} className={field}>
                  {locations.cities.filter((item) => locations.countries.find((country) => country.name === formCountry)?.code === item.countryCode).map((item) => <option key={item.slug}>{item.name}</option>)}
                </select>
              </Field>
              <Field label="Required Date" error={clientErrors.deliveryDate || state.errors?.deliveryDate}>
                <input name="deliveryDate" type="date" required defaultValue={rfq?.deliveryDate?.slice(0, 10) || newRfqDefaults.deliveryDate} className={field} />
              </Field>
              <Field label="Closing Date & Time" error={clientErrors.expirationDate || state.errors?.expirationDate}>
                <input name="expirationDate" type="datetime-local" required defaultValue={rfq ? toDateTimeLocal(rfq.expirationDate) : newRfqDefaults.expirationDate} className={field} />
              </Field>
              <Field label="Estimated Budget" wide optional>
                <input name="budget" defaultValue={rfq ? rfq.budget || "" : newRfqDefaults.budget} placeholder="e.g. SAR 750,000" className={field} />
              </Field>
            </div>
            <div className="mt-8 flex justify-end border-t border-slate-200 pt-6">
              <button type="button" onClick={() => continueFromStep(1, 2)} className="rounded-xl bg-[#0b1f3a] px-7 py-3 font-black text-white">
                Continue →
              </button>
            </div>
          </div>

          <div data-rfq-step="2" className={step === 2 ? "block" : "hidden"}>
            <div className="mb-7 text-center">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-600">Step 2 of 4</p>
              <h2 className="mt-2 text-3xl font-black text-[#0b1f3a]">Requirements</h2>
              <p className="mt-2 text-slate-500">Give vendors enough detail to prepare an accurate quotation.</p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Quantity" error={clientErrors.quantity || state.errors?.quantity}>
                <input name="quantity" required defaultValue={rfq?.quantity || newRfqDefaults.quantity} placeholder="e.g. 5,000" className={field} />
              </Field>
              <Field label="Unit" error={clientErrors.unit || state.errors?.unit}>
                <input name="unit" required defaultValue={rfq?.unit || newRfqDefaults.unit} list="rfq-units" placeholder="e.g. Tons, Units, Liters" className={field} />
                <datalist id="rfq-units"><option value="Units" /><option value="Tons" /><option value="Kilograms" /><option value="Liters" /><option value="Meters" /><option value="Square Meters" /><option value="Cubic Meters" /><option value="Months" /></datalist>
              </Field>
              <Field label="Specifications" error={clientErrors.specifications || state.errors?.specifications} wide>
                <textarea name="specifications" required minLength={20} rows={5} defaultValue={rfq?.specifications || rfq?.description || newRfqDefaults.specifications} placeholder="Technical grade, standards, dimensions, performance and compliance requirements…" className={field} />
              </Field>
              <Field label="Notes" wide optional>
                <textarea name="notes" rows={3} defaultValue={rfq ? rfq.notes || "" : newRfqDefaults.notes} placeholder="Commercial conditions, inspection requirements or other instructions…" className={field} />
              </Field>
              <Field label="Corporate Phone" error={clientErrors.phone || state.errors?.phone}>
                <input name="phone" type="tel" required defaultValue={rfq?.phone || newRfqDefaults.phone} placeholder="+966 50 XXX XXXX" className={field} />
              </Field>
              <Field label="Procurement Email" error={clientErrors.email || state.errors?.email}>
                <input
                  name="email"
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(event) => setContactEmail(event.target.value)}
                  placeholder="procurement@company.com"
                  className={field}
                />
                {!rfq && signedInEmail && <p className="mt-1 text-xs text-slate-500">You can use your signed-in email or enter another email for verification.</p>}
              </Field>
            </div>
            <div className="mt-8 flex flex-col-reverse justify-between gap-3 border-t border-slate-200 pt-6 sm:flex-row">
              <button type="button" onClick={() => setStep(1)} className="rounded-xl border border-slate-300 px-6 py-3 font-bold">← Back</button>
              <button type="button" onClick={() => continueFromStep(2, 3)} className="rounded-xl bg-[#0b1f3a] px-7 py-3 font-black text-white">Continue →</button>
            </div>
          </div>

          <div data-rfq-step="3" className={step === 3 ? "block" : "hidden"}>
            <div className="mb-7 text-center">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-600">Step 3 of 4</p>
              <h2 className="mt-2 text-3xl font-black text-[#0b1f3a]">Supporting Documents</h2>
              <p className="mt-2 text-slate-500">Add secure links to the files vendors should review.</p>
            </div>
            <div className="grid gap-5">
              <FileDropzone ref={(handle) => { documentUploadRefs.current[0] = handle; }} deferUpload={!rfq} kind="document" name="boqUrl" label="BOQ" initialUrls={rfq?.boqUrl ? [rfq.boqUrl] : []} />
              <FileDropzone ref={(handle) => { documentUploadRefs.current[1] = handle; }} deferUpload={!rfq} kind="document" name="drawingsUrl" label="drawings" initialUrls={rfq?.drawingsUrl ? [rfq.drawingsUrl] : []} />
              <FileDropzone ref={(handle) => { documentUploadRefs.current[2] = handle; }} deferUpload={!rfq} kind="document" name="specificationDocumentUrl" label="specification document" initialUrls={rfq?.specificationDocumentUrl ? [rfq.specificationDocumentUrl] : []} />
              <FileDropzone ref={(handle) => { documentUploadRefs.current[3] = handle; }} deferUpload={!rfq} kind="document" name="otherDocumentUrls" label="other documents" initialUrls={rfq?.otherDocumentUrls ?? []} maxFiles={5} />
            </div>
            <div className="mt-8 flex flex-col-reverse justify-between gap-3 border-t border-slate-200 pt-6 sm:flex-row">
              <button type="button" onClick={() => setStep(2)} className="rounded-xl border border-slate-300 px-6 py-3 font-bold">← Back</button>
              <button
                type="button"
                onClick={() => {
                  if (!validateStep(3)) return;
                  if (formRef.current) {
                    const entries = Array.from(new FormData(formRef.current).entries()).map(([key, value]) => [key, String(value)]);
                    setReview(Object.fromEntries(entries));
                  }
                  setStep(4);
                }}
                className="rounded-xl bg-[#0b1f3a] px-7 py-3 font-black text-white"
              >
                Review RFQ →
              </button>
            </div>
          </div>
        </form>

        <div className={step === 4 ? "block" : "hidden"}>
            <div className="mb-7 text-center">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-600">Step 4 of 4</p>
              <h2 className="mt-2 text-3xl font-black text-[#0b1f3a]">Review & Publish</h2>
              <p className="mt-2 text-slate-500">Confirm the RFQ details before sharing them with vendors.</p>
            </div>
            <div className="grid gap-5">
              <ReviewSection title="Project & Procurement" items={[
                ["Project", review.projectName], ["Category", review.category], ["Material / Service", review.materialService],
                ["Location", [review.city, review.country].filter(Boolean).join(", ")], ["Required date", review.deliveryDate],
                ["Closing date", review.expirationDate], ["Budget", review.budget || "Not specified"],
              ]} />
              <ReviewSection title="Requirements" items={[
                ["Quantity", `${review.quantity || ""} ${review.unit || ""}`.trim()], ["Specifications", review.specifications],
                ["Notes", review.notes || "None"], ["Contact", `${review.phone || ""} · ${review.email || ""}`],
              ]} />
              <ReviewSection title="Supporting Documents" items={[
                ["BOQ", review.boqUrl || "Not attached"], ["Drawings", review.drawingsUrl || "Not attached"],
                ["Specifications", review.specificationDocumentUrl || "Not attached"], ["Other documents", review.otherDocumentUrls || "None"],
              ]} />
            </div>
            {state.message && !state.success && (
              <p role="alert" className="mt-5 rounded-xl bg-red-50 p-3 text-center text-sm font-bold text-red-700">{state.message}</p>
            )}
            {!rfq && !verifiedEmail && (
              <div className="mt-6">
                <EmailAuthFlow
                  defaultEmail={contactEmail}
                  requireOtp
                  purpose="rfq_create"
                  lockEmail
                  onAuthenticated={setVerifiedEmail}
                />
              </div>
            )}
            {(uploadingDocuments || pending) && (
              <div role="status" aria-live="polite" className="mt-6 rounded-xl border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-center justify-between gap-4 text-sm font-bold text-blue-900">
                  <span>{uploadingDocuments ? "Uploading documents…" : "Submitting RFQ…"}</span>
                  <span>Please wait</span>
                </div>
                <div
                  role="progressbar"
                  aria-label={uploadingDocuments ? "Uploading documents" : "Submitting RFQ"}
                  className="mt-3 h-2 overflow-hidden rounded-full bg-blue-200"
                >
                  <div className="h-full w-full animate-pulse rounded-full bg-blue-600" />
                </div>
              </div>
            )}
            <div className="mt-8 flex flex-col-reverse justify-between gap-3 border-t border-slate-200 pt-6 sm:flex-row">
              <button type="button" onClick={() => setStep(3)} className="rounded-xl border border-slate-300 px-6 py-3 font-bold">← Back</button>
              {(rfq || verifiedEmail) && (
                <div className="flex gap-3">
                  <button form="rfq-form" name="intent" value="draft" disabled={pending || uploadingDocuments} className="rounded-xl border border-slate-300 px-6 py-3 font-bold text-slate-700">Save Draft</button>
                  <button form="rfq-form" name="intent" value="published" disabled={pending || uploadingDocuments} className="rounded-xl bg-amber-400 px-6 py-3 font-black text-slate-950">
                    {uploadingDocuments ? "Uploading documents…" : pending ? "Saving…" : rfq ? "Update & Submit for Approval" : "Submit RFQ for Approval"}
                  </button>
                </div>
              )}
            </div>
          </div>
      </div>
    </ModalShell>
  );
}

function RfqDetailsModal({
  rfq,
  onClose,
}: {
  rfq: RfqRecord;
  onClose: () => void;
}) {
  const documents = [
    ["BOQ", rfq.boqUrl],
    ["Drawings", rfq.drawingsUrl],
    ["Specification document", rfq.specificationDocumentUrl],
    ...rfq.otherDocumentUrls.map((url, index) => [`Other document ${index + 1}`, url]),
  ].filter((item): item is [string, string] => Boolean(item[1]));

  return (
    <ModalShell title={`${rfq.reference} — RFQ Details`} onClose={onClose}>
      <div className="px-5 py-6 sm:px-8">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.16em] text-amber-600">
              {rfq.category}
            </p>
            <h2 className="mt-2 text-2xl font-black text-[#0b1f3a]">
              {rfq.materialService || rfq.title}
            </h2>
            <p className="mt-2 font-bold text-slate-500">{rfq.projectName}</p>
          </div>
          <span
            className={`w-fit rounded-full px-3 py-1 text-xs font-black uppercase ${
              rfq.status === "published"
                ? "bg-emerald-100 text-emerald-700"
                : rfq.status === "closed"
                  ? "bg-slate-200 text-slate-700"
                  : "bg-amber-100 text-amber-700"
            }`}
          >
            {rfq.status === "published" ? "Open" : rfq.status}
          </span>
        </div>

        <div className="mt-6 grid gap-5">
          <ReviewSection
            title="Project & Procurement"
            items={[
              ["Project name", rfq.projectName],
              ["Category", rfq.category],
              ["Material / Service", rfq.materialService || rfq.title],
              ["Country", rfq.country],
              ["City", rfq.city],
              ["Required date", rfq.deliveryDate ? formatDate(rfq.deliveryDate) : "Not specified"],
              ["Closing date", formatDate(rfq.expirationDate)],
              ["Budget", rfq.budget || "Not specified"],
            ]}
          />
          <ReviewSection
            title="Requirements"
            items={[
              ["Quantity", `${rfq.quantity}${rfq.unit ? ` ${rfq.unit}` : ""}`],
              ["Specifications", rfq.specifications || rfq.description],
              ["Notes", rfq.notes || "None"],
            ]}
          />

          <section className="overflow-hidden rounded-2xl border border-slate-200">
            <h3 className="bg-slate-50 px-5 py-3 text-lg font-black text-[#0b1f3a]">
              Supporting Documents
            </h3>
            {documents.length ? (
              <div className="grid gap-3 p-5 sm:grid-cols-2">
                {documents.map(([label, url]) => (
                  <a
                    key={`${label}-${url}`}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-[#0b1f3a] transition hover:border-amber-400 hover:bg-amber-50"
                  >
                    <span>📄 {label}</span>
                    <span aria-hidden="true">↗</span>
                  </a>
                ))}
              </div>
            ) : (
              <p className="p-5 text-sm text-slate-500">No supporting documents attached.</p>
            )}
          </section>

          <section className="rounded-2xl bg-[#0b1f3a] p-5 text-white">
            <h3 className="text-lg font-black !text-white">Procurement Contact</h3>
            <div className="mt-3 flex flex-col gap-2 text-sm sm:flex-row sm:gap-6">
              <Link href="/contact" className="font-bold text-white">
                ☎ {rfq.phone}
              </Link>
              <Link href="/contact" className="font-bold text-white">
                ✉ {rfq.email}
              </Link>
            </div>
          </section>
        </div>
      </div>
    </ModalShell>
  );
}

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-[70] overflow-y-auto bg-slate-950/65 p-3 backdrop-blur-sm sm:p-6">
      <div className="mx-auto my-3 max-w-4xl overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between bg-[#0b1f3a] px-6 py-5 text-white">
          <h2 className="text-xl font-black !text-white">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="grid size-10 place-items-center rounded-full text-2xl text-white/80 hover:bg-white/10">×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({
  label,
  error,
  wide = false,
  optional = false,
  children,
}: {
  label: string;
  error?: string;
  wide?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={wide ? "sm:col-span-2" : undefined}>
      <b className="text-sm text-[#0b1f3a]">
        {label}{!optional && (
          <span className={error ? "text-red-600" : "text-slate-500"}> *(mandatory)</span>
        )}
      </b>
      {children}
      {error && <span className="mt-1 block text-xs font-bold text-red-600">{error}</span>}
    </label>
  );
}

function ReviewSection({
  title,
  items,
}: {
  title: string;
  items: Array<[string, string | undefined]>;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200">
      <h3 className="bg-slate-50 px-5 py-3 text-lg font-black text-[#0b1f3a]">{title}</h3>
      <dl className="grid gap-px bg-slate-200 sm:grid-cols-2">
        {items.map(([label, value]) => (
          <div key={label} className="bg-white p-4">
            <dt className="text-xs font-black uppercase tracking-wide text-slate-400">{label}</dt>
            <dd className="mt-1 break-words text-sm font-bold text-slate-700">{value || "Not specified"}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(value));
}

function toDateTimeLocal(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
