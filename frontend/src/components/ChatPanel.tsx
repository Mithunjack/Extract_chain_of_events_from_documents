import { useState } from "react";

import type { ChatResponse } from "../lib/types";

type ChatPanelProps = {
  onSubmit: (question: string) => Promise<ChatResponse>;
  disabled?: boolean;
};

export function ChatPanel({ onSubmit, disabled = false }: ChatPanelProps) {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState<ChatResponse | null>(null);
  const [loading, setLoading] = useState(false);

  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-[#0f1722]">
      <div className="border-b border-white/10 px-4 py-4">
        <p className="text-[11px] uppercase tracking-[0.3em] text-gold">Conversation</p>
        <h2 className="mt-2 font-display text-2xl text-white">
          Ask anything about the document
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
          Keep the chat focused on one character or one story arc at a time.
        </p>
      </div>
      <div className="px-4 py-4">
        <div className="rounded-[1.25rem] border border-white/10 bg-black/10 p-3">
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Explain Karna's timeline in the whole novel."
            className="min-h-24 w-full resize-none bg-transparent px-1 py-1 text-sm text-white outline-none placeholder:text-slate-500"
          />
          <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/10 pt-3">
            <p className="text-xs text-slate-500">Grounded responses with source snippets.</p>
            <button
              type="button"
              disabled={disabled || loading || !question.trim()}
              onClick={async () => {
                setLoading(true);
                try {
                  const response = await onSubmit(question.trim());
                  setResult(response);
                } finally {
                  setLoading(false);
                }
              }}
              className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-ink transition hover:bg-[#ffda8a] disabled:cursor-not-allowed disabled:bg-slate-600"
            >
              {loading ? "Thinking..." : "Send"}
            </button>
          </div>
        </div>

        {result ? (
          <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-black/15 p-4 lg:max-h-[360px] lg:overflow-y-auto">
            <p className="text-sm leading-7 text-slate-200">{result.answer}</p>
            <div className="mt-4 space-y-3">
              {result.citations.map((citation, index) => (
                <blockquote
                  key={`${citation.page}-${index}`}
                  className="rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-sm text-slate-300"
                >
                  <p className="text-xs uppercase tracking-[0.3em] text-gold">
                    Page {citation.page}
                  </p>
                  <p className="mt-2 leading-6">{citation.quote}</p>
                </blockquote>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-[1.25rem] border border-white/10 bg-black/10 px-4 py-4 text-sm leading-6 text-slate-400">
            Ask for a summary, a relationship arc, or a full character timeline and the
            response will stay in this focused thread.
          </div>
        )}
      </div>
    </section>
  );
}
