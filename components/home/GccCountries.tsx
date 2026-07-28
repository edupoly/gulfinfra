import Link from "next/link";

const countries = [
  {
    code: "AE",
    name: "UAE",
    flag: "🇦🇪",
    landmark: (
      <>
        <path d="M36 45V36h-2V26h-2V10h-1V2h-1v8h-1v16h-2v10h-2v9Z" />
        <path d="M15 45h30" />
      </>
    ),
  },
  {
    code: "SA",
    name: "Saudi Arabia",
    flag: "🇸🇦",
    landmark: (
      <>
        <path d="m22 45 2-29 4-8q2-3 4 0l4 8 2 29" />
        <path d="M26 12a4 4 0 0 1 8 0M15 45h30" />
      </>
    ),
  },
  {
    code: "KW",
    name: "Kuwait",
    flag: "🇰🇼",
    landmark: (
      <>
        <path d="M24 45V8m9 37V18m5 27V30M12 45h36" />
        <circle cx="24" cy="20" r="5.5" />
        <circle cx="24" cy="32" r="3.5" />
        <circle cx="33" cy="28" r="3.5" />
      </>
    ),
  },
  {
    code: "QA",
    name: "Qatar",
    flag: "🇶🇦",
    landmark: (
      <>
        <path d="M18 45q14-5 14-33c0-2-3-2-5 0L18 45Zm0 0h20M32 20h8l-8 4m0-12v33" />
      </>
    ),
  },
  {
    code: "OM",
    name: "Oman",
    flag: "🇴🇲",
    landmark: (
      <>
        <path d="M18 45V35h4c0-10 16-10 16 0h4v10M26 35c0-9 8-9 8 0ZM12 45h36" />
      </>
    ),
  },
  {
    code: "BH",
    name: "Bahrain",
    flag: "🇧🇭",
    landmark: (
      <>
        <path d="m20 45 8-33v33Zm20 0-8-33v33ZM28 20h4m-4 10h4m-4 10h4M12 45h36" />
      </>
    ),
  },
] as const;

export function GccCountries() {
  return (
    <section className="border-b border-slate-200 bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center text-xl font-black uppercase tracking-[0.03em] text-[#0b1f3a]">
          We Serve Across GCC Countries
        </h2>

        <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {countries.map((country) => (
            <Link
              key={country.code}
              href={`/contractors?countries=${country.code}`}
              aria-label={`Browse listings in ${country.name}`}
              className="group flex min-h-40 flex-col rounded-xl border border-slate-200 bg-white p-5 text-center shadow-sm transition duration-300 hover:-translate-y-1 hover:border-amber-400 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
            >
              <span
                aria-hidden="true"
                className="self-start text-[22px] leading-none drop-shadow-sm"
              >
                {country.flag}
              </span>

              <span className="flex flex-1 items-end justify-center pb-3">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 60 50"
                  className="h-[70px] w-auto max-w-full fill-none stroke-[#0b1f3a] stroke-[2.2] [stroke-linecap:round] [stroke-linejoin:round] transition group-hover:stroke-amber-600"
                >
                  {country.landmark}
                </svg>
              </span>

              <span className="text-sm font-black uppercase text-[#0b1f3a]">
                {country.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
