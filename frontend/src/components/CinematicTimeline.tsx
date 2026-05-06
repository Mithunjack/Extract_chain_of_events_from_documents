import type { TimelineEvent } from "../lib/types";

type CinematicTimelineProps = {
  entity: string;
  overview: string;
  events: TimelineEvent[];
};

function confidenceLabel(confidence: number) {
  if (confidence >= 0.8) {
    return "High confidence";
  }
  if (confidence >= 0.6) {
    return "Supported by evidence";
  }
  return "Exploratory inference";
}

export function CinematicTimeline({
  entity,
  overview,
  events
}: CinematicTimelineProps) {
  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.04]">
      <div className="flex flex-col gap-3 border-b border-white/10 px-4 py-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold">Timeline</p>
          <h2 className="mt-2 font-display text-2xl text-white">{entity}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">{overview}</p>
        </div>
        <div className="rounded-full border border-white/10 bg-black/10 px-3 py-1.5 text-xs text-slate-300">
          {events.length} story beats
        </div>
      </div>

      <div className="relative space-y-3 px-4 py-4 before:absolute before:left-[1.06rem] before:top-5 before:h-[calc(100%-2.5rem)] before:w-px before:bg-gradient-to-b before:from-gold/80 before:to-sapphire/20 md:before:left-6 lg:max-h-[380px] lg:overflow-y-auto lg:pr-3">
        {events.map((event, index) => (
          <article
            key={event.id}
            className="relative rounded-[1.25rem] border border-white/10 bg-black/20 p-4 pl-12 transition hover:border-gold/30 hover:bg-black/25 md:pl-16"
          >
            <div className="absolute left-[0.5rem] top-5 flex h-6 w-6 items-center justify-center rounded-full border border-gold/60 bg-ink text-[11px] text-gold md:left-[0.55rem]">
              {index + 1}
            </div>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.28em] text-sapphire">
                  {event.eventPhase}
                </p>
                <h3 className="mt-1.5 font-display text-lg text-white">{event.title}</h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  {event.summary}
                </p>
              </div>
              <div className="shrink-0 rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-300">
                <div>Page {event.sourcePage}</div>
                <div className="mt-1 uppercase tracking-[0.22em] text-gold">
                  {confidenceLabel(event.confidence)}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
