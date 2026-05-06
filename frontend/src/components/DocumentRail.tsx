import type { DocumentSummary } from "../lib/types";
import { StatusPill } from "./StatusPill";

type DocumentRailProps = {
  documents: DocumentSummary[];
  activeDocumentId: string | null;
  onSelect: (documentId: string) => void;
};

export function DocumentRail({
  documents,
  activeDocumentId,
  onSelect
}: DocumentRailProps) {
  return (
    <aside className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-4 backdrop-blur xl:flex xl:min-h-0 xl:flex-col">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Library</p>
          <h2 className="mt-2 font-display text-2xl text-white">Documents</h2>
        </div>
      </div>
      <div className="space-y-3 xl:min-h-0 xl:flex-1 xl:overflow-y-auto xl:pr-1">
        {documents.map((document) => (
          <button
            key={document.id}
            type="button"
            onClick={() => onSelect(document.id)}
            className={`w-full rounded-[1.5rem] border p-4 text-left transition ${
              activeDocumentId === document.id
                ? "border-gold/40 bg-gold/10"
                : "border-white/10 bg-black/10 hover:border-white/20"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-medium text-white">{document.filename}</h3>
                <p className="mt-2 text-sm text-slate-400">{document.summary}</p>
              </div>
              <StatusPill label={document.status} />
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
