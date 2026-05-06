import type { EntitySummary } from "../lib/types";

type EntitySpotlightProps = {
  entities: EntitySummary[];
  activeEntity: string | null;
  onSelect: (entityName: string) => void;
};

export function EntitySpotlight({
  entities,
  activeEntity,
  onSelect
}: EntitySpotlightProps) {
  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold">Characters</p>
          <p className="mt-1 text-sm text-slate-400">
            Select one entity to focus the timeline.
          </p>
        </div>
      </div>
      <div className="mt-4 flex max-h-28 flex-wrap gap-2 overflow-y-auto pr-1">
        {entities.map((entity) => {
          const selected = entity.canonical_name === activeEntity;
          return (
            <button
              key={entity.id}
              type="button"
              onClick={() => onSelect(entity.canonical_name)}
              className={`rounded-full border px-3 py-1.5 text-sm transition ${
                selected
                  ? "border-gold bg-gold/15 text-gold"
                  : "border-white/10 bg-white/[0.03] text-white hover:border-sapphire/40"
              }`}
            >
              {entity.canonical_name}
              <span className="ml-2 text-slate-400">{entity.mention_count}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
