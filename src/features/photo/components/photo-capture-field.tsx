import { useEffect, useMemo, useRef, useState } from "react";
import { compressPhoto, type CompressedPhoto } from "@/features/photo/photo-compress";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/cn";
import { formatBytes } from "@/shared/lib/format";

const ERROR_MESSAGES: Readonly<Record<string, string>> = Object.freeze({
  PHOTO_UNREADABLE: "Foto tidak dapat dibaca. Coba ambil ulang.",
  PHOTO_TOO_LARGE: "Foto tetap terlalu besar setelah dikompres. Coba foto lain atau perkecil resolusinya."
});

export interface PhotoCaptureFieldProps {
  readonly label?: string;
  readonly hint?: string;
  readonly disabled?: boolean;
  readonly className?: string;
  readonly onPhotoChange: (photo: CompressedPhoto | null) => void;
}

export function PhotoCaptureField({
  label = "Foto bukti",
  hint = "Opsional. Dikompres di perangkat sebelum dikirim. Hindari merekam wajah orang.",
  disabled = false,
  className,
  onPhotoChange
}: PhotoCaptureFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<CompressedPhoto | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  const previewUrl = useMemo(
    () => (photo === null ? null : URL.createObjectURL(photo.blob)),
    [photo]
  );

  useEffect(
    () => () => {
      if (previewUrl !== null) URL.revokeObjectURL(previewUrl);
    },
    [previewUrl]
  );

  const applyPhoto = (next: CompressedPhoto | null) => {
    setPhoto(next);
    onPhotoChange(next);
  };

  const handleFile = (file: File | undefined) => {
    if (file === undefined) return;
    setBusy(true);
    setError(null);
    void compressPhoto(file)
      .then((result) => {
        if (!result.ok) {
          setError(ERROR_MESSAGES[result.code] ?? "Foto tidak dapat diproses.");
          return;
        }
        applyPhoto(result.photo);
      })
      .catch(() => {
        setError("Foto tidak dapat diproses di perangkat ini.");
      })
      .finally(() => {
        setBusy(false);
      });
  };

  const openPicker = () => {
    setNonce((value) => value + 1);
    inputRef.current?.click();
  };

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <p className="text-sm font-medium text-ink">{label}</p>
      <p className="text-xs text-ink-lemah">{hint}</p>

      <input
        ref={inputRef}
        key={nonce}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        disabled={disabled || busy}
        onChange={(event) => {
          handleFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      {busy ? (
        <p className="text-sm text-ink-lemah">Mengompres foto...</p>
      ) : photo === null ? (
        <button
          type="button"
          disabled={disabled}
          onClick={openPicker}
          className={cn(
            "flex min-h-20 flex-col items-center justify-center gap-1 rounded-kontainer border border-dashed border-ink-lemah/60 px-4 py-4 text-center transition-colors",
            "hover:border-ink-lemah disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          <span className="text-sm text-ink">Ambil atau pilih foto</span>
          <span className="text-xs text-ink-lemah">Kamera belakang dipakai bila tersedia.</span>
        </button>
      ) : (
        <figure className="flex flex-col gap-2">
          <img
            src={previewUrl ?? undefined}
            alt="Pratinjau foto bukti"
            className="max-h-44 w-full rounded-kontainer border border-garis object-cover"
          />
          <figcaption className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-2xs text-ink-lemah">
            <span>sha {photo.sha256.slice(0, 8)}</span>
            <span>{formatBytes(photo.bytes)}</span>
            <span>
              {photo.width}x{photo.height}
            </span>
            <span>{photo.mime === "image/webp" ? "webp" : "jpeg"}</span>
          </figcaption>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              disabled={disabled}
              onClick={openPicker}
            >
              Ganti foto
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={() => {
                applyPhoto(null);
                setError(null);
              }}
            >
              Hapus foto
            </Button>
          </div>
        </figure>
      )}

      {error === null ? null : (
        <p role="alert" className="text-sm text-bata">
          {error}
        </p>
      )}
    </div>
  );
}
