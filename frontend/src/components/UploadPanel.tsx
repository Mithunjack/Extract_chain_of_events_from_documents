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
    <section className="rounded-[2rem] border border-gold/20 bg-[radial-gradient(circle_at_top,#19304f,transparent_60%),linear-gradient(135deg,#101c2d,#0b1320)] p-5 shadow-glow xl:flex-none">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-gold">Upload</p>
          <h2 className="mt-3 font-display text-2xl text-white xl:text-[1.75rem]">
            Drop a novel and let the timeline engine start reading.
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
            The analysis begins immediately after upload and prepares character-centric
            chains of events for exploration.
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
        className={`mt-5 w-full rounded-[1.75rem] border border-dashed p-6 text-left transition xl:p-5 ${
          dragging
            ? "border-gold bg-gold/10"
            : "border-white/15 bg-white/[0.03] hover:border-sapphire/40 hover:bg-white/[0.05]"
        }`}
      >
        <span className="block text-sm uppercase tracking-[0.35em] text-slate-400">
          {uploading ? "Analyzing..." : "Drag and drop a PDF"}
        </span>
        <span className="mt-2 block font-display text-xl text-white">
          Turn long-form narrative into a premium visual timeline.
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
