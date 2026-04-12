import { useEffect, useId, useMemo, useRef, useState } from "react";
import { MAX_COMPLETION_FILES, MEDIA_ACCEPT } from "../lib/constants";
import { formatFileSize } from "../lib/formatters";

type ServiceFilePickerProps = {
  files: File[];
  error?: string;
  onFilesAdd: (files: FileList | null) => void;
  onFileRemove: (fileName: string) => void;
};

type PreviewItem = {
  key: string;
  file: File;
  url: string | null;
  kind: "image" | "video" | "pdf" | "other";
};

function getPreviewKind(file: File): PreviewItem["kind"] {
  if (file.type.startsWith("image/")) {
    return "image";
  }

  if (file.type.startsWith("video/")) {
    return "video";
  }

  if (file.type === "application/pdf") {
    return "pdf";
  }

  return "other";
}

export function ServiceFilePicker({ files, error, onFilesAdd, onFileRemove }: ServiceFilePickerProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});

  const previewItems = useMemo<PreviewItem[]>(
    () =>
      files.map((file) => {
        const key = `${file.name}-${file.size}-${file.lastModified}`;
        return {
          key,
          file,
          url: previewUrls[key] ?? null,
          kind: getPreviewKind(file),
        };
      }),
    [files, previewUrls],
  );

  useEffect(() => {
    const nextUrls: Record<string, string> = {};
    const canCreateObjectUrls = typeof URL !== "undefined" && typeof URL.createObjectURL === "function";

    for (const file of files) {
      const key = `${file.name}-${file.size}-${file.lastModified}`;

      if (canCreateObjectUrls && (file.type.startsWith("image/") || file.type.startsWith("video/"))) {
        nextUrls[key] = URL.createObjectURL(file);
      }
    }

    setPreviewUrls(nextUrls);

    return () => {
      if (typeof URL !== "undefined" && typeof URL.revokeObjectURL === "function") {
        Object.values(nextUrls).forEach((url) => URL.revokeObjectURL(url));
      }
    };
  }, [files]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-panel">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-brand-700">Service Media</p>
          <h2 className="mt-2 text-xl font-semibold text-slate-900">Upload proof of work</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Upload 1 to {MAX_COMPLETION_FILES} files. Allowed types: photos, videos, and PDF.
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {files.length}/{MAX_COMPLETION_FILES}
        </span>
      </div>

      <input
        id={inputId}
        ref={inputRef}
        type="file"
        accept={MEDIA_ACCEPT}
        multiple
        className="sr-only"
        aria-label="Add files"
        onChange={(event) => {
          onFilesAdd(event.target.files);
          event.target.value = "";
        }}
      />

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-center text-sm font-medium text-slate-600 transition hover:border-brand-300 hover:bg-brand-50 sm:min-w-[180px]"
        >
          Add files
        </button>
        <label
          htmlFor={inputId}
          className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-500"
        >
          Selected files will appear below immediately so the technician can confirm proof of work before submitting.
        </label>
      </div>

      {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}

      {previewItems.length > 0 ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {previewItems.map(({ key, file, url, kind }) => (
            <article key={key} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
              <div className="aspect-[4/3] bg-slate-100">
                {kind === "image" && url ? (
                  <img src={url} alt={file.name} className="h-full w-full object-cover" />
                ) : null}
                {kind === "video" && url ? (
                  <video src={url} className="h-full w-full object-cover" controls preload="metadata" />
                ) : null}
                {kind === "pdf" ? (
                  <div className="flex h-full items-center justify-center px-4 text-center text-sm font-semibold text-slate-600">
                    PDF document selected
                  </div>
                ) : null}
                {kind === "other" ? (
                  <div className="flex h-full items-center justify-center px-4 text-center text-sm font-semibold text-slate-600">
                    File selected
                  </div>
                ) : null}
              </div>
              <div className="flex items-start justify-between gap-4 px-4 py-4">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{file.name}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {file.type || "Unknown type"} | {formatFileSize(file.size)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onFileRemove(file.name)}
                  className="rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-white"
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </div>
  );
}
