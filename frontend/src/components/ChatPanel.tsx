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
    <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
      <p className="text-xs uppercase tracking-[0.35em] text-gold">Ask</p>
      <h2 className="mt-3 font-display text-2xl text-white">
        Ask for a character journey across the whole text.
      </h2>
      <div className="mt-5 flex flex-col gap-3">
        <textarea
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          placeholder="Explain Karna's timeline in the whole novel."
          className="min-h-28 rounded-[1.5rem] border border-white/10 bg-black/15 px-4 py-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-gold/40"
        />
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
          className="self-start rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink transition hover:bg-[#ffda8a] disabled:cursor-not-allowed disabled:bg-slate-600"
        >
          {loading ? "Thinking..." : "Ask"}
        </button>
      </div>

      {result ? (
        <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-black/15 p-4">
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
      ) : null}
    </section>
  );
}
