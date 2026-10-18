import { useState } from "react";
import type { PublicTicketCreatedDto } from "@/shared/types/ticket.types";

export interface ReportReceiptProps {
  readonly ticket: PublicTicketCreatedDto;
  readonly onNewReport: () => void;
}

export function ReportReceipt({ ticket, onNewReport }: ReportReceiptProps) {
  const [copied, setCopied] = useState(false);
  const shortCode = ticket.id.slice(0, 8).toUpperCase();

  const copy = () => {
    void navigator.clipboard
      .writeText(ticket.id)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        setCopied(false);
      });
  };

  return (
    <div className="flex flex-col items-center gap-5 py-6 text-center">
      <p className="text-md font-medium text-ink">Laporan Anda masuk.</p>
      <div className="-rotate-1 rounded-kontrol border-[1.5px] border-ink px-5 py-3">
        <p className="font-mono text-2xs tracking-label text-ink-lemah uppercase">Nomor laporan</p>
        <p className="font-mono text-2xl font-medium tracking-wide text-ink">{shortCode}</p>
      </div>
      <p className="max-w-prose text-sm text-ink-lemah">
        Dapur dan dinas akan menindaklanjuti. Simpan nomor ini.
      </p>
      <div className="flex flex-col items-center gap-2">
        <button
          type="button"
          onClick={copy}
          className="h-11 rounded-kontrol border border-garis px-4 text-sm text-ink transition-colors duration-150 ease-out hover:bg-ink/5"
        >
          {copied ? "Nomor disalin" : "Salin nomor lengkap"}
        </button>
        <button
          type="button"
          onClick={onNewReport}
          className="text-sm text-biru-tinta underline underline-offset-2"
        >
          Kirim laporan lain
        </button>
      </div>
    </div>
  );
}