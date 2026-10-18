import { isApiError } from "@/api/api-error";
import { usePhotoLink } from "@/features/photo/hooks/use-photo-link";
import { cn } from "@/shared/lib/cn";
import { formatBytes, formatDateTime } from "@/shared/lib/format";

export interface PhotoBuktiProps {
  readonly sha256: string;
  readonly className?: string;
}

export function PhotoBukti({ sha256, className }: PhotoBuktiProps) {
  const link = usePhotoLink(sha256);

  const errorMessage =
    link.isError && isApiError(link.error)
      ? link.error.status === 403
        ? "Foto ini tidak dapat ditampilkan untuk akun Anda."
        : link.error.status === 404
          ? "Foto tidak ditemukan di penyimpanan."
          : link.error.message
      : null;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {link.isPending ? (
        <div className="h-44 w-full rounded-kontainer border border-garis bg-ink/5" />
      ) : null}

      {errorMessage === null ? null : (
        <p className="rounded-kontainer border border-garis px-3 py-2 text-sm text-ink-lemah">
          {errorMessage}
        </p>
      )}

      {link.data === undefined ? null : (
        <figure className="flex flex-col gap-2">
          <a href={link.data.url} target="_blank" rel="noreferrer">
            <img
              src={link.data.url}
              alt={`Foto bukti ${link.data.sha256.slice(0, 8)}`}
              className="max-h-72 w-full rounded-kontainer border border-garis object-cover"
            />
          </a>
          <figcaption className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-2xs text-ink-lemah">
            <span title={link.data.sha256}>sha {link.data.sha256.slice(0, 8)}</span>
            <span>{formatBytes(link.data.bytes)}</span>
            {link.data.width === null || link.data.height === null ? null : (
              <span>
                {link.data.width}x{link.data.height}
              </span>
            )}
            <span>{formatDateTime(link.data.createdAt)}</span>
          </figcaption>
        </figure>
      )}
    </div>
  );
}
