import { useEffect, useState } from "react";

import { ChatPanel } from "./components/ChatPanel";
import { CinematicTimeline } from "./components/CinematicTimeline";
import { DocumentRail } from "./components/DocumentRail";
import { EmptyState } from "./components/EmptyState";
import { EntitySpotlight } from "./components/EntitySpotlight";
import { UploadPanel } from "./components/UploadPanel";
import { api } from "./lib/api";
import type {
  ChatResponse,
  DocumentSummary,
  EntitySummary,
  TimelineResponse
} from "./lib/types";

const demoTimeline: TimelineResponse = {
  entity: "Karna",
  documentId: "demo",
  overview:
    "A premium preview of how Narrative Atlas turns a sprawling novel into a clean, character-centered chain of events.",
  events: [
    {
      id: "1",
      title: "Birth in Secrecy",
      summary:
        "Karna enters the world under concealed circumstances, shaping the identity tension that follows him throughout the narrative.",
      sequenceIndex: 0,
      eventPhase: "origin",
      sourcePage: 12,
      confidence: 0.88
    },
    {
      id: "2",
      title: "Discipline and Training",
      summary:
        "He pushes toward mastery despite exclusion, and the timeline surfaces this stretch as a long arc of formation rather than a single isolated event.",
      sequenceIndex: 1,
      eventPhase: "development",
      sourcePage: 64,
      confidence: 0.79
    },
    {
      id: "3",
      title: "Loyalty in Conflict",
      summary:
        "Karna's alliances harden into destiny, connecting court politics, friendship, and fatal obligation in one readable narrative thread.",
      sequenceIndex: 2,
      eventPhase: "conflict",
      sourcePage: 201,
      confidence: 0.76
    },
    {
      id: "4",
      title: "Final Fall in Battle",
      summary:
        "The system anchors the end of his story with supporting evidence and presents it as the culminating beat of the timeline rather than a detached answer snippet.",
      sequenceIndex: 3,
      eventPhase: "end",
      sourcePage: 442,
      confidence: 0.91
    }
  ]
};

export default function App() {
  const [documents, setDocuments] = useState<DocumentSummary[]>([]);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);
  const [entities, setEntities] = useState<EntitySummary[]>([]);
  const [activeEntity, setActiveEntity] = useState<string | null>(null);
  const [timeline, setTimeline] = useState<TimelineResponse>(demoTimeline);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void api
      .listDocuments()
      .then((items) => {
        setDocuments(items);
        if (items[0]) {
          setActiveDocumentId(items[0].id);
        }
      })
      .catch(() => {
        setDocuments([]);
      });
  }, []);

  useEffect(() => {
    if (!activeDocumentId) {
      return;
    }
    void api
      .listEntities(activeDocumentId)
      .then((items) => {
        setEntities(items);
        if (items[0]) {
          setActiveEntity(items[0].canonical_name);
        }
      })
      .catch(() => {
        setEntities([]);
      });
  }, [activeDocumentId]);

  useEffect(() => {
    if (!activeDocumentId || !activeEntity) {
      return;
    }
    void api
      .getTimeline(activeDocumentId, activeEntity)
      .then(setTimeline)
      .catch(() => {
        setTimeline(demoTimeline);
      });
  }, [activeDocumentId, activeEntity]);

  async function handleUpload(file: File) {
    setError(null);
    setUploading(true);
    try {
      const response = await api.uploadDocument(file);
      const nextDocuments = [response.document, ...documents];
      setDocuments(nextDocuments);
      setActiveDocumentId(response.document.id);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleAsk(question: string): Promise<ChatResponse> {
    if (!activeDocumentId) {
      return {
        answer: "Upload a document first so the app has evidence to work from.",
        citations: []
      };
    }
    return api.askQuestion(activeDocumentId, question);
  }

  return (
    <main className="min-h-screen bg-ink text-white">
      <div className="mx-auto max-w-[1480px] px-3 py-3 md:px-4 md:py-4 lg:px-6">
        <section className="overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.1),transparent_22%),linear-gradient(180deg,#0d1522,#0a111b_55%,#09111a)] shadow-glow">
          <div className="grid min-h-[calc(100vh-1.5rem)] gap-0 lg:grid-cols-[280px,1fr]">
            <DocumentRail
              documents={documents}
              activeDocumentId={activeDocumentId}
              onSelect={setActiveDocumentId}
            />

            <div className="flex min-h-[calc(100vh-1.5rem)] flex-col border-t border-white/10 lg:border-l lg:border-t-0">
              <header className="border-b border-white/10 bg-black/10 px-4 py-4 backdrop-blur md:px-6">
                <div className="mx-auto flex w-full max-w-[920px] items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.32em] text-gold">
                      Narrative Atlas
                    </p>
                    <h1 className="mt-2 font-display text-2xl text-white md:text-3xl">
                      Narrative workspace
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                      Upload a book, pick a character, and ask for a clean chain of
                      events without the interface getting in your way.
                    </p>
                  </div>
                  <div className="hidden items-center gap-2 lg:flex">
                    {["Local-first", "Entity-centric", "Evidence-grounded"].map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-slate-300"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6">
                <div className="mx-auto flex w-full max-w-[920px] flex-col gap-4">
                  <UploadPanel onUpload={handleUpload} uploading={uploading} />

                  {error ? (
                    <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                      {error}
                    </div>
                  ) : null}

                  <EntitySpotlight
                    entities={entities}
                    activeEntity={activeEntity}
                    onSelect={setActiveEntity}
                  />

                  <ChatPanel onSubmit={handleAsk} disabled={!activeDocumentId} />

                  <CinematicTimeline
                    entity={timeline.entity}
                    overview={timeline.overview}
                    events={timeline.events}
                  />

                  {!documents.length ? (
                    <EmptyState
                      title="No document ingested yet"
                      description="The workspace is ready. Upload a long-form PDF to switch from the preview state into grounded character analysis."
                    />
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
