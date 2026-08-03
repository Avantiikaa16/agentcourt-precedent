const ACCENTS: Record<string, string> = {
  amber: "before:bg-amber-500",
  blue: "before:bg-blue-500",
  emerald: "before:bg-emerald-500",
  violet: "before:bg-violet-500",
  rose: "before:bg-rose-500",
};

export function Panel({
  title,
  accent = "amber",
  children,
}: {
  title: string;
  accent?: keyof typeof ACCENTS;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`relative overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-white/80 dark:bg-zinc-900/70 backdrop-blur-sm p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow before:absolute before:inset-x-0 before:top-0 before:h-1 ${ACCENTS[accent]}`}
    >
      <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500 dark:text-zinc-400">{title}</h2>
      {children}
    </section>
  );
}
