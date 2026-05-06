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
    <section className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-5 shadow-glow backdrop-blur">
      <div className="flex flex-col gap-3 border-b border-white/10 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-gold">Timeline</p>
          <h2 className="mt-2 font-display text-3xl text-white xl:text-[2rem]">{entity}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{overview}</p>
        </div>
        <div className="rounded-full border border-white/10 bg-black/10 px-4 py-2 text-sm text-slate-300">
          {events.length} story beats
        </div>
      </div>

      <div className="relative mt-5 space-y-4 before:absolute before:left-[1.08rem] before:top-4 before:h-[calc(100%-2rem)] before:w-px before:bg-gradient-to-b before:from-gold/80 before:to-sapphire/20 md:before:left-6 lg:max-h-[calc(100vh-22rem)] lg:overflow-y-auto lg:pr-2">
        {events.map((event, index) => (
          <article
            key={event.id}
            className="relative rounded-[1.5rem] border border-white/10 bg-black/20 p-4 pl-12 transition hover:border-gold/30 hover:bg-black/25 md:pl-20"
          >
            <div className="absolute left-[0.55rem] top-6 flex h-6 w-6 items-center justify-center rounded-full border border-gold/60 bg-ink text-xs text-gold md:left-[0.6rem]">
              {index + 1}
            </div>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-sapphire">
                  {event.eventPhase}
                </p>
                <h3 className="mt-2 font-display text-xl text-white">{event.title}</h3>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                  {event.summary}
                </p>
              </div>
              <div className="shrink-0 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-300">
                <div>Page {event.sourcePage}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.22em] text-gold">
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
