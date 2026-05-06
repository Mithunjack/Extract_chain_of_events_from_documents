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
    <aside className="flex flex-col bg-[#0a1018] px-3 py-4 lg:min-h-[calc(100vh-1.5rem)]">
      <div className="border-b border-white/10 px-3 pb-4">
        <p className="text-[11px] uppercase tracking-[0.32em] text-gold">Library</p>
        <h2 className="mt-2 font-display text-xl text-white">Documents</h2>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          Pick a source and keep the conversation grounded.
        </p>
      </div>
      <div className="mt-4 space-y-2 overflow-y-auto px-1 pr-2">
        {documents.map((document) => (
          <button
            key={document.id}
            type="button"
            onClick={() => onSelect(document.id)}
            className={`w-full rounded-[1.25rem] border p-3 text-left transition ${
              activeDocumentId === document.id
                ? "border-gold/40 bg-gold/10 shadow-[0_0_0_1px_rgba(244,201,107,0.08)]"
                : "border-white/10 bg-white/[0.03] hover:border-white/20"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="line-clamp-2 text-sm font-medium text-white">
                  {document.filename}
                </h3>
                <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-400">
                  {document.summary}
                </p>
              </div>
              <StatusPill label={document.status} />
            </div>
          </button>
        ))}
      </div>
    </aside>
  );
}
