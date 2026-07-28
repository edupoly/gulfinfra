const benefits = [
  {
    icon: "🛡️",
    title: "Pre-Vetted Directory",
    description:
      "We check CR licenses, engineering ratings, and company histories before issuing 'Verified Status'.",
  },
  {
    icon: "📈",
    title: "GCC-Wide Coverage",
    description:
      "Single platform tracking commercial developments and projects across Saudi, UAE, Qatar, Kuwait, Oman, and Bahrain.",
  },
  {
    icon: "🎯",
    title: "RFQ Matching",
    description:
      "Our matching engine routes your supply requirements directly to approved local distributors.",
  },
  {
    icon: "💎",
    title: "Premium & Free Tools",
    description:
      "Access free tender boards, post unlimited RFQs, and advertise items in the machinery marketplace.",
  },
] as const;

export function WhyChooseGulfBuildHub() {
  return (
    <section className="bg-[#061224] px-4 py-8 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mx-auto mb-4 max-w-[700px] text-center">
          <h2 className="relative inline-block pb-3 text-3xl font-black tracking-tight !text-white after:absolute after:bottom-0 after:left-1/2 after:h-1 after:w-[60px] after:-translate-x-1/2 after:rounded-full after:bg-amber-400">
            Why Choose GulfBuildHub?
          </h2>
          <p className="mt-4 text-base text-slate-400">
            The premium portal enabling digital transformation in Middle Eastern heavy engineering and industrial sourcing.
          </p>
        </header>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {benefits.map((benefit) => (
            <article key={benefit.title} className="p-6 text-center">
              <div aria-hidden="true" className="mb-5 text-5xl leading-none">
                {benefit.icon}
              </div>
              <h3 className="mb-3 text-lg font-bold !text-white">{benefit.title}</h3>
              <p className="text-sm leading-8 text-slate-500">{benefit.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
