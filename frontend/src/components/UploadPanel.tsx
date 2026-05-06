import { useRef, useState } from "react";

type UploadPanelProps = {
  onUpload: (file: File) => Promise<void>;
  uploading: boolean;
};

export function UploadPanel({ onUpload, uploading }: UploadPanelProps) {
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  async function handleFiles(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) {
      return;
    }
    await onUpload(file);
  }

  return (
    <section className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold">Upload</p>
          <h2 className="mt-2 font-display text-xl text-white">
            Add a document to start the analysis.
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
            Narrative extraction begins after upload, then the workspace stays compact
            while you explore characters and ask questions.
          </p>
        </div>
        <button
          className="rounded-full border border-white/15 px-4 py-2 text-sm text-white transition hover:border-gold/40 hover:text-gold"
          onClick={() => fileRef.current?.click()}
          type="button"
        >
          Choose PDF
        </button>
      </div>

      <button
        type="button"
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={async (event) => {
          event.preventDefault();
          setDragging(false);
          await handleFiles(event.dataTransfer.files);
        }}
        onClick={() => fileRef.current?.click()}
        className={`mt-4 w-full rounded-[1.25rem] border border-dashed px-4 py-5 text-left transition ${
          dragging
            ? "border-gold bg-gold/10"
            : "border-white/15 bg-white/[0.03] hover:border-sapphire/40 hover:bg-white/[0.05]"
        }`}
      >
        <span className="block text-xs uppercase tracking-[0.3em] text-slate-400">
          {uploading ? "Analyzing..." : "Drag and drop a PDF"}
        </span>
        <span className="mt-2 block font-display text-lg text-white">
          Turn a long-form narrative into a focused timeline and chat workspace.
        </span>
      </button>

      <input
        ref={fileRef}
        className="hidden"
        type="file"
        accept="application/pdf"
        onChange={async (event) => handleFiles(event.target.files)}
      />
    </section>
  );
}
