import { useEffect, useMemo, useRef, useState } from "react";
import {
  DESCRIPTION_MAX,
  DESCRIPTION_MIN,
  REPORT_KIND_OPTIONS
} from "@/features/public-report/report-validation";
import { cn } from "@/shared/lib/cn";
import type { TicketKind } from "@/shared/constants/ticket.constant";
import type { SubmitPhase } from "@/features/public-report/hooks/use-submit-report";

export interface ReportFormProps {
  readonly sppgName: string;
  readonly phase: SubmitPhase;
  readonly error: string | null;
  readonly onSubmit: (draft: { jenis: TicketKind | null; deskripsi: string; website: string }, photo: File | null) => void;
}

export function ReportForm({ sppgName, phase, error, onSubmit }: ReportFormProps) {
  const [jenis, setJenis] = useState<TicketKind | null>(null);
  const [deskripsi, setDeskripsi] = useState("");
  const [website, setWebsite] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const previewUrl = useMemo(() => (photo === null ? null : URL.createObjectURL(photo)), [photo]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (previewUrl === null) return;
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  const busy = phase === "uploading-photo" || phase === "submitting";
  const trimmedLength = deskripsi.trim().length;

  const pickPhoto = (file: File | null) => {
    setPhoto(file);
    if (fileInputRef.current !== null) fileInputRef.current.value = "";
  };

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        if (busy) return;
        onSubmit({ jenis, deskripsi, website }, photo);
      }}
      className="flex flex-col gap-6"
    >
      <fieldset className="flex flex-col gap-2">
        <legend className="text-md font-medium text-ink">Apa yang terjadi?</legend>
        <div className="flex flex-col gap-2">
          {REPORT_KIND_OPTIONS.map((option) => {
            const selected = jenis === option.value;
            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={selected}
                onClick={() => setJenis(option.value)}
                className={cn(
                  "flex min-h-16 flex-col items-start gap-0.5 rounded-kontainer border px-4 py-3 text-left transition-colors duration-150 ease-out",
                  selected
                    ? "border-ink bg-ink text-kertas"
                    : "border-garis bg-kertas text-ink hover:border-ink-lemah"
                )}
              >
                <span className="text-md font-medium">{option.label}</span>
                <span className={cn("text-xs", selected ? "text-kertas/70" : "text-ink-lemah")}>
                  {option.example}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="lapor-deskripsi" className="text-md font-medium text-ink">
          Ceritakan yang Anda lihat
        </label>
        <textarea
          id="lapor-deskripsi"
          name="deskripsi"
          rows={5}
          maxLength={DESCRIPTION_MAX}
          value={deskripsi}
          onChange={(event) => setDeskripsi(event.target.value)}
          placeholder={`Contoh: sejak pagi tercium bau dari belakang ${sppgName}...`}
          className="min-h-32 w-full resize-y rounded-kontrol border border-garis bg-kertas px-3 py-2.5 text-md text-ink placeholder:text-ink-lemah"
        />
        <p className={cn("text-xs", trimmedLength > 0 && trimmedLength < DESCRIPTION_MIN ? "text-kunyit" : "text-ink-lemah")}>
          {trimmedLength}/{DESCRIPTION_MAX} karakter
          {trimmedLength > 0 && trimmedLength < DESCRIPTION_MIN
            ? ` — minimal ${DESCRIPTION_MIN}`
            : ""}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-md font-medium text-ink">Foto (opsional)</span>
        {previewUrl === null ? (
          <label className="flex min-h-20 cursor-pointer items-center justify-center rounded-kontainer border border-dashed border-ink-lemah px-4 py-4 text-center text-sm text-ink-lemah">
            Ketuk untuk mengambil atau memilih foto
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={(event) => pickPhoto(event.target.files?.[0] ?? null)}
            />
          </label>
        ) : (
          <div className="flex flex-col gap-2">
            <img
              src={previewUrl}
              alt="Pratinjau foto laporan"
              width={320}
              height={240}
              className="max-h-48 w-full max-w-xs rounded-kontainer border border-garis object-cover"
            />
            <button
              type="button"
              onClick={() => pickPhoto(null)}
              className="self-start text-sm text-biru-tinta underline underline-offset-2"
            >
              Hapus foto
            </button>
          </div>
        )}
        <p className="text-xs text-ink-lemah">Jika ada foto, hindari wajah orang.</p>
      </div>

      <div aria-hidden="true" className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label htmlFor="lapor-website">Jangan diisi</label>
        <input
          id="lapor-website"
          name="website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
      </div>

      {error === null ? null : (
        <p role="alert" className="rounded-kontainer border border-bata/40 bg-bata/5 px-3 py-2 text-sm text-bata">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="h-13 w-full rounded-kontrol bg-biru-tinta text-md font-medium text-kertas transition-colors duration-150 ease-out disabled:opacity-60"
      >
        {phase === "uploading-photo"
          ? "Mengunggah foto…"
          : phase === "submitting"
            ? "Mengirim laporan…"
            : "Kirim laporan"}
      </button>

      <p className="text-xs text-ink-lemah">
        Kami tidak menampilkan nama atau kontak Anda.
      </p>
    </form>
  );
}