export function AdminPageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <header>
      <p className="text-sm font-black uppercase tracking-[0.2em] text-amber-700">Administration</p>
      <h1 className="mt-2 text-4xl font-black text-[#0b1f3a]">{title}</h1>
      <p className="mt-2 text-slate-600">{description}</p>
    </header>
  );
}
