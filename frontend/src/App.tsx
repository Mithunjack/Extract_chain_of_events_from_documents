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
      <div className="mx-auto max-w-[1600px] px-4 py-6 md:px-8 lg:px-10">
        <section className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.18),transparent_26%),radial-gradient(circle_at_top_right,rgba(244,201,107,0.18),transparent_28%),linear-gradient(160deg,#0b1320,#10192c_45%,#08111d)] p-6 shadow-glow md:p-8">
          <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
            <DocumentRail
              documents={documents}
              activeDocumentId={activeDocumentId}
              onSelect={setActiveDocumentId}
            />

            <div className="space-y-6">
              <header className="flex flex-col gap-6 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 backdrop-blur lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.38em] text-gold">
                    Narrative Atlas
                  </p>
                  <h1 className="mt-3 max-w-3xl font-display text-5xl leading-tight text-white md:text-6xl">
                    Cinematic timelines for long-form documents.
                  </h1>
                  <p className="mt-4 max-w-3xl text-sm leading-8 text-slate-300">
                    Upload a novel, extract the major entities automatically, and move
                    through a premium story map that shows a character&apos;s chain of events
                    from beginning to end.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {[
                    ["Local-first", "No paid API dependency"],
                    ["Entity-centric", "Timelines built after upload"],
                    ["Evidence-grounded", "Chat answers keep citations"]
                  ].map(([title, body]) => (
                    <div
                      key={title}
                      className="rounded-[1.5rem] border border-white/10 bg-black/10 px-4 py-4"
                    >
                      <div className="font-display text-xl text-white">{title}</div>
                      <div className="mt-2 text-sm text-slate-400">{body}</div>
                    </div>
                  ))}
                </div>
              </header>

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

              <div className="grid gap-6 xl:grid-cols-[1.6fr,0.95fr]">
                <CinematicTimeline
                  entity={timeline.entity}
                  overview={timeline.overview}
                  events={timeline.events}
                />
                <ChatPanel onSubmit={handleAsk} disabled={!activeDocumentId} />
              </div>
            </div>
          </div>
        </section>

        {!documents.length ? (
          <div className="mt-6">
            <EmptyState
              title="No document ingested yet"
              description="The interface is ready with a premium preview timeline, but upload a long-form PDF to switch from demo storytelling into grounded, document-backed analysis."
            />
          </div>
        ) : null}
      </div>
    </main>
  );
}
