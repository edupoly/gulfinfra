"use client";

import { useRef, useState, type ReactNode } from "react";
import { updateOwnedListing, type OwnedListingType } from "@/app/my-listings/actions";
import { Progress } from "@/components/listings/ProjectListingForm";

const names: Record<OwnedListingType, string> = {
  contractor: "Contractors & Services",
  project: "Projects & Tenders",
  equipment: "Equipment Marketplace",
  material: "Construction & Industrial Materials",
  business: "Business Opportunities",
};

export function EditListingWizard({
  type,
  id,
  title,
  details,
  media,
}: {
  type: OwnedListingType;
  id: string;
  title: string;
  details: ReactNode;
  media: ReactNode;
}) {
  const [step, setStep] = useState(1);
  const [review, setReview] = useState<Array<[string, string]>>([]);
  const formRef = useRef<HTMLFormElement>(null);

  const next = () => {
    if (step === 2 && formRef.current && !formRef.current.reportValidity()) return;
    if (step === 3 && formRef.current) {
      const data = new FormData(formRef.current);
      const hidden = new Set(["type", "id"]);
      const values = [...new Set([...data.keys()])]
        .filter((key) => !hidden.has(key))
        .map((key) => [key, data.getAll(key).map(String).filter(Boolean).join(", ")] as [string, string])
        .filter(([, value]) => value);
      setReview(values);
    }
    setStep((current) => Math.min(4, current + 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const back = () => {
    setStep((current) => Math.max(1, current - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="w-full rounded-[38px] border border-slate-200 bg-white px-5 py-10 shadow-[0_18px_60px_rgba(15,23,42,0.08)] sm:px-10 sm:py-14 lg:px-20">
      <Progress activeStep={step} />
      <div className="mx-auto mt-12 max-w-4xl text-center">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-600">Step {step} of 4 · Edit listing</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-[#0b1f3a] sm:text-5xl">
          {step === 1 && "Confirm Listing Type"}
          {step === 2 && `Edit ${names[type]} Details`}
          {step === 3 && "Media & Additional Information"}
          {step === 4 && "Review Your Changes"}
        </h1>
        <p className="mt-4 text-lg text-slate-500">
          {step === 1 && "The listing type is fixed after creation."}
          {step === 2 && "Update the listing, commercial, location, and contact information."}
          {step === 3 && "Update images, specifications, compliance, and related information."}
          {step === 4 && "Confirm the information below before saving it to your listing."}
        </p>
      </div>

      {step === 1 && (
        <div className="mx-auto mt-10 max-w-3xl rounded-3xl border-4 border-amber-400 bg-amber-50 p-8 text-center">
          <p className="text-sm font-black uppercase tracking-wider text-amber-700">Selected listing type</p>
          <h2 className="mt-3 text-2xl font-black text-[#0b1f3a]">{names[type]}</h2>
          <p className="mt-2 font-semibold text-slate-600">{title}</p>
        </div>
      )}

      <form ref={formRef} action={updateOwnedListing} className="mx-auto mt-10 max-w-5xl">
        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="id" value={id} />
        <div className={step === 2 ? "grid gap-5 sm:grid-cols-2" : "hidden"}>{details}</div>
        <div className={step === 3 ? "grid gap-5 sm:grid-cols-2" : "hidden"}>{media}</div>
        {step === 4 && (
          <dl className="grid gap-4 rounded-3xl border border-slate-200 p-5 sm:grid-cols-2 sm:p-7">
            {review.map(([label, value]) => (
              <div key={label} className={["description", "specifications", "images", "galleryImages", "galleryUrls", "imageUrls"].includes(label) ? "sm:col-span-2" : ""}>
                <dt className="text-xs font-black uppercase tracking-wider text-slate-500">{label.replace(/([A-Z])/g, " $1")}</dt>
                <dd className="mt-1 whitespace-pre-wrap break-words font-semibold text-slate-800">{value}</dd>
              </div>
            ))}
          </dl>
        )}

        <div className="mt-8 flex flex-col-reverse justify-between gap-3 border-t border-slate-200 pt-6 sm:flex-row">
          {step > 1 ? <button type="button" onClick={back} className="rounded-full border border-slate-300 px-7 py-3 font-bold text-slate-700">← Back</button> : <span />}
          {step < 4 ? (
            <button type="button" onClick={next} className="rounded-full bg-amber-400 px-7 py-3 font-black text-slate-950 hover:bg-amber-300">Continue →</button>
          ) : (
            <button type="submit" className="rounded-full bg-amber-400 px-8 py-3.5 font-black text-slate-950 hover:bg-amber-300">Save Listing Changes →</button>
          )}
        </div>
      </form>
    </section>
  );
}
