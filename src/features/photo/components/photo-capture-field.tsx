import { useEffect, useMemo, useRef, useState } from "react";
import { compressPhoto, type CompressedPhoto } from "@/features/photo/photo-compress";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/cn";
import { formatBytes } from "@/shared/lib/format";

const ERROR_MESSAGES = {
  PHOTO_UNREADABLE:
    "Foto ini tidak bisa dibaca browser. Coba JPG atau PNG, atau ambil ulang lewat kamera.",
  PHOTO_TOO_LARGE:
    "Foto tetap terlalu besar setelah dikompres. Coba foto lain atau perkecil resolusinya.",
  CRYPTO_UNAVAILABLE:
    "Perangkat ini tidak mengizinkan pembuatan hash. Buka aplikasi lewat https atau localhost."
} as const satisfies Readonly<Record<string, string>>;

type PickerKind = "camera" | "file";

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
  const cameraRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState<CompressedPhoto | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const pick = (kind: PickerKind) => {
    const input = kind === "camera" ? cameraRef.current : fileRef.current;
    if (input === null) return;
    input.value = "";
    input.click();
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
      .catch((cause: unknown) => {
        const cryptoUnavailable =
          cause instanceof Error && cause.message.includes("CRYPTO");
        setError(
          cryptoUnavailable
            ? ERROR_MESSAGES.CRYPTO_UNAVAILABLE
            : "Foto tidak dapat diproses di perangkat ini. Coba foto lain."
        );
      })
      .finally(() => {
        setBusy(false);
      });
  };

  const blocked = disabled || busy;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <p className="text-sm font-medium text-ink">{label}</p>
      <p className="text-xs text-ink-lemah">{hint}</p>

      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        disabled={blocked}
        aria-hidden
        tabIndex={-1}
        onChange={(event) => {
          handleFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="sr-only"
        disabled={blocked}
        aria-hidden
        tabIndex={-1}
        onChange={(event) => {
          handleFile(event.target.files?.[0]);
          event.target.value = "";
        }}
      />

      {busy ? (
        <p className="text-sm text-ink-lemah">Mengompres foto...</p>
      ) : photo === null ? (
        <div className="flex flex-col gap-2.5 rounded-kontainer border border-dashed border-ink-lemah/60 px-4 py-3.5">
          <p className="text-sm text-ink">Belum ada foto</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" disabled={blocked} onClick={() => pick("file")}>
              Pilih file
            </Button>
            <Button variant="ghost" size="sm" disabled={blocked} onClick={() => pick("camera")}>
              Ambil dari kamera
            </Button>
          </div>
        </div>
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
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" disabled={blocked} onClick={() => pick("file")}>
              Ganti foto
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={blocked}
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
