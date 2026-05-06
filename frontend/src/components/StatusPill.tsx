type StatusPillProps = {
  label: string;
};

const statusClasses: Record<string, string> = {
  analyzed: "bg-emerald-500/20 text-emerald-200 ring-emerald-300/30",
  indexed: "bg-sky-500/20 text-sky-100 ring-sky-300/30",
  uploaded: "bg-amber-500/20 text-amber-100 ring-amber-300/30",
  failed: "bg-rose-500/20 text-rose-100 ring-rose-300/30"
};

export function StatusPill({ label }: StatusPillProps) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ring-1 ${
        statusClasses[label] ?? "bg-white/10 text-white ring-white/10"
      }`}
    >
      {label}
    </span>
  );
}
