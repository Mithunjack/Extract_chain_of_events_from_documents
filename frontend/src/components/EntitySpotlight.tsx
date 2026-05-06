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
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
      <p className="text-xs uppercase tracking-[0.35em] text-gold">Entity Atlas</p>
      <div className="mt-5 flex flex-wrap gap-3">
        {entities.map((entity) => {
          const selected = entity.canonical_name === activeEntity;
          return (
            <button
              key={entity.id}
              type="button"
              onClick={() => onSelect(entity.canonical_name)}
              className={`rounded-full border px-4 py-2 text-sm transition ${
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
