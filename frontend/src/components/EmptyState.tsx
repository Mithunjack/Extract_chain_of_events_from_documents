type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-[2rem] border border-white/10 bg-white/5 p-8 text-mist shadow-glow backdrop-blur">
      <h3 className="font-display text-2xl text-white">{title}</h3>
      <p className="mt-3 max-w-prose text-sm leading-7 text-slate-300">
        {description}
      </p>
    </div>
  );
}
