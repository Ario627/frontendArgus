import { useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Sheet } from "@/shared/components/ui/sheet";
import { formatDateTime } from "@/shared/lib/format";
import { isSafeExternalHref } from "@/shared/lib/url-safety";
import type { StrukLinkDto } from "@/shared/types/struk.types";

export interface StrukLinkSheetProps {
  readonly link: StrukLinkDto | null;
  readonly onOpenChange: (open: boolean) => void;
}

export function StrukLinkSheet({ link, onOpenChange }: StrukLinkSheetProps) {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);

  if (link === null) return null;

  const copied = copiedUrl === link.url;
  const failed = failedUrl === link.url;
  const safe = isSafeExternalHref(link.url);

  const copy = () => {
    void navigator.clipboard.writeText(link.url).then(
      () => {
        setCopiedUrl(link.url);
        setFailedUrl(null);
      },
      () => {
        setFailedUrl(link.url);
        setCopiedUrl(null);
      }
    );
  };

  return (
    <Sheet
      open
      onOpenChange={onOpenChange}
      title="Tautan struk"
      description="Siapa pun yang memiliki tautan ini dapat membuka struk tanpa login."
      footer={
        <Button size="lg" fullWidth onClick={copy}>
          {copied ? "Tautan disalin" : "Salin tautan"}
        </Button>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="rounded-kontainer border border-garis px-3 py-2.5">
          <p className="font-mono text-xs break-all text-ink">{link.url}</p>
        </div>
        {failed ? (
          <p role="alert" className="text-sm text-bata">
            Tidak bisa menyalin otomatis. Salin manual dari kotak di atas.
          </p>
        ) : null}
        {safe ? (
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="self-start text-sm text-biru-tinta underline underline-offset-2"
          >
            Buka struk di tab baru
          </a>
        ) : null}
        <p className="text-xs text-ink-lemah">
          Berlaku sampai {formatDateTime(link.berlakuSampai)}. Bagikan hanya kepada pihak yang
          membutuhkan.
        </p>
      </div>
    </Sheet>
  );
}