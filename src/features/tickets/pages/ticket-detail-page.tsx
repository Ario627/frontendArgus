import { useState } from "react";
import { Link, useParams } from "react-router";
import { isApiError } from "@/api/api-error";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { TicketActionSheet, type TicketActionMode } from "@/features/tickets/components/ticket-action-sheet";
import { TicketHistoryList } from "@/features/tickets/components/ticket-history-list";
import { useTicketDetail } from "@/features/tickets/hooks/use-ticket-detail";
import { useTicketPhoto } from "@/features/tickets/hooks/use-ticket-photo";
import { parseRiskBreakdown } from "@/features/tickets/ticket-view";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Button } from "@/shared/components/ui/button";
import { Chip } from "@/shared/components/ui/chip";
import { Skeleton, SkeletonList } from "@/shared/components/ui/skeleton";
import { TICKET_KIND_LABELS, TICKET_STATUS_LABELS } from "@/shared/constants/ticket.constant";
import { isTicketTransitionAllowed } from "@/shared/constants/transitions.constant";
import { cn } from "@/shared/lib/cn";
import { formatDateTime, formatInt } from "@/shared/lib/format";
import { isSafeAssetUrl } from "@/shared/lib/url-safety";
import { env } from "@/shared/lib/env";
import { STATUS_CHIP_CLASSES } from "@/features/tickets/ticket-view";
import type { TicketDto } from "@/shared/types/ticket.types";

interface InfoRowProps {
  readonly label: string;
  readonly children: React.ReactNode;
}

function InfoRow({ label, children }: InfoRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-garis py-2 last:border-b-0">
      <dt className="shrink-0 text-sm text-ink-lemah">{label}</dt>
      <dd className="min-w-0 text-right text-sm text-ink">{children}</dd>
    </div>
  );
}

function TicketPhoto({ fotoHash }: { readonly fotoHash: string }) {
  const photo = useTicketPhoto(fotoHash);
  const url = photo.data?.url ?? null;
  const safe = url !== null && isSafeAssetUrl(url, env.mediaOrigins);

  if (photo.isPending) return <Skeleton className="h-48 w-full max-w-md" />;
  if (photo.isError || !safe) {
    return <p className="text-sm text-ink-lemah">Foto tidak dapat dimuat.</p>;
  }
  return (
    <img
      src={url}
      alt="Foto yang dilampirkan pada laporan"
      width={photo.data === undefined ? undefined : undefined}
      height={undefined}
      loading="lazy"
      className="max-h-80 w-full max-w-md rounded-kontainer border border-garis object-cover"
    />
  );
}

function canVerify(role: string | null, ticket: TicketDto): boolean {
  if (role !== "admin" && role !== "dlh_auditor") return false;
  return (
    isTicketTransitionAllowed(ticket.status, "DIVERIFIKASI") ||
    isTicketTransitionAllowed(ticket.status, "DITOLAK_MODERASI")
  );
}

function canRespond(role: string | null, ticket: TicketDto): boolean {
  if (role !== "admin" && role !== "sppg_staff") return false;
  return isTicketTransitionAllowed(ticket.status, "DITANGGAPI");
}

function canClose(role: string | null, ticket: TicketDto): boolean {
  if (role !== "admin" && role !== "dlh_auditor") return false;
  return isTicketTransitionAllowed(ticket.status, "SELESAI");
}

export function TicketDetailPage() {
  const params = useParams();
  const ticketId = typeof params.ticketId === "string" ? params.ticketId : undefined;
  const role = useAuthStore((state) => state.role);
  const query = useTicketDetail(ticketId);
  const [actionMode, setActionMode] = useState<TicketActionMode | null>(null);

  const apiError = isApiError(query.error) ? query.error : null;

  if (query.isPending) {
    return (
      <div className="flex max-w-3xl flex-col gap-4">
        <Skeleton className="h-6 w-40" />
        <SkeletonList rows={4} />
      </div>
    );
  }

  if (query.isError || query.data === undefined) {
    return (
      <div className="max-w-3xl">
        <ErrorState
          description={apiError?.message ?? "Laporan tidak dapat dimuat."}
          requestId={apiError?.requestId}
          onRetry={() => void query.refetch()}
        />
      </div>
    );
  }

  const ticket = query.data;
  const risk = parseRiskBreakdown(ticket.riwayat[0]?.catatan ?? null);
  const showVerify = canVerify(role, ticket);
  const showRespond = canRespond(role, ticket);
  const showClose = canClose(role, ticket);

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <PageHeader
        title="Laporan warga"
        breadcrumb={[{ label: "Tiket", to: "/tickets" }, { label: ticket.id.slice(0, 8) }]}
        description={formatDateTime(ticket.createdAt)}
      />

      <div className="flex flex-wrap items-center gap-3 border-b border-garis pb-4">
        <Chip className={cn("h-7", STATUS_CHIP_CLASSES[ticket.status])}>
          {TICKET_STATUS_LABELS[ticket.status]}
        </Chip>
        <span className="text-sm text-ink-lemah">{TICKET_KIND_LABELS[ticket.jenis]}</span>
        {ticket.skorRisiko === null ? null : (
          <span className="ml-auto font-mono text-sm tabular-nums text-ink">
            skor {formatInt(ticket.skorRisiko)}
            <span className="text-ink-lemah">/100</span>
          </span>
        )}
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-ink">Deskripsi</h2>
        <p className="max-w-prose text-base leading-relaxed text-ink">{ticket.deskripsi}</p>
      </section>

      {ticket.fotoHash === null ? null : (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-ink">Foto</h2>
          <TicketPhoto fotoHash={ticket.fotoHash} />
        </section>
      )}

      <section className="flex flex-col">
        <h2 className="pb-2 text-sm font-medium text-ink">Rincian</h2>
        <dl className="flex flex-col">
          <InfoRow label="Jenis">{TICKET_KIND_LABELS[ticket.jenis]}</InfoRow>
          {ticket.lat === null || ticket.lng === null ? null : (
            <InfoRow label="Koordinat">
              <span className="font-mono text-xs">
                {ticket.lat.toFixed(5)}, {ticket.lng.toFixed(5)}
              </span>
            </InfoRow>
          )}
          {ticket.jawabanSppg === null ? null : (
            <InfoRow label="Jawaban dapur">{ticket.jawabanSppg}</InfoRow>
          )}
        </dl>
      </section>

      {risk === null ? null : (
        <section className="flex flex-col gap-1">
          <h2 className="text-sm font-medium text-ink">Komponen skor risiko</h2>
          {risk.components.map((component) => (
            <div
              key={component.label}
              className="flex items-baseline justify-between gap-4 border-b border-garis py-1.5 last:border-b-0"
            >
              <span className="text-xs text-ink-lemah">{component.label}</span>
              <span className="font-mono text-xs tabular-nums text-ink">+{formatInt(component.value)}</span>
            </div>
          ))}
        </section>
      )}

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-ink">Riwayat moderasi</h2>
        <TicketHistoryList events={ticket.riwayat} />
      </section>

      {showVerify || showRespond || showClose ? (
        <div className="flex flex-wrap gap-2">
          {showVerify ? (
            <Button variant="secondary" size="sm" onClick={() => setActionMode("verify")}>
              Moderasi
            </Button>
          ) : null}
          {showRespond ? (
            <Button variant="secondary" size="sm" onClick={() => setActionMode("respond")}>
              Jawab
            </Button>
          ) : null}
          {showClose ? (
            <Button variant="secondary" size="sm" onClick={() => setActionMode("close")}>
              Tutup laporan
            </Button>
          ) : null}
        </div>
      ) : null}

      {actionMode === null ? null : (
        <TicketActionSheet
          open
          onOpenChange={(open) => {
            if (!open) setActionMode(null);
          }}
          ticketId={ticket.id}
          mode={actionMode}
          canVerifyTarget={isTicketTransitionAllowed(ticket.status, "DIVERIFIKASI")}
        />
      )}

      <p className="text-xs text-ink-lemah">
        <Link to="/tickets" className="text-biru-tinta underline underline-offset-2">
          Kembali ke kotak masuk
        </Link>
      </p>
    </div>
  );
}