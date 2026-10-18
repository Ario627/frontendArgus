import { useState } from "react";
import { Link, useParams } from "react-router";
import { isApiError } from "@/api/api-error";
import { useAuthStore } from "@/features/auth/store/auth.store";
import { RegateSheet } from "@/features/batch/components/regate-sheet";
import { StrukLinkSheet } from "@/features/batch/components/struk-link-sheet";
import { useBatchDetail } from "@/features/batch/hooks/use-batch-detail";
import { useMintStruk } from "@/features/batch/hooks/use-mint-struk";
import { AppendEventSheet } from "@/features/ledger/components/append-event-sheet";
import { uiAppendOptions } from "@/features/ledger/ledger-append";
import { useLedgerEvents } from "@/features/ledger/hooks/use-ledger-events";
import { useBatchVerification } from "@/features/ledger/hooks/use-batch-verification";
import { LedgerEventList } from "@/features/ledger/components/ledger-event-list";
import { LedgerVerifyPanel } from "@/features/ledger/components/ledger-verify-panel";
import { PhotoBukti } from "@/features/photo/components/photo-bukti";
import { KgValue } from "@/shared/components/data/kg-value";
import { HashTag } from "@/shared/components/data/hash-tag";
import { FractionBar } from "@/shared/components/data/fraction-bar";
import { PitaPaspor } from "@/shared/components/data/pita-paspor";
import { Button } from "@/shared/components/ui/button";
import { Stamp } from "@/shared/components/ui/stamp";
import { useToastStore } from "@/shared/components/ui/toast-store";
import { ErrorState } from "@/shared/components/feedback/error-state";
import { PageHeader } from "@/shared/components/layout/page-header";
import { Skeleton, SkeletonList } from "@/shared/components/ui/skeleton";
import { BATCH_STATUS_LABELS } from "@/shared/constants/batch.constant";
import { FLOW_LABELS, MOISTURE_LABELS, type MoistureProxy } from "@/shared/constants/flow.constant";
import { TIER_LABELS } from "@/shared/constants/tier.constant";
import { formatDateTime } from "@/shared/lib/format";
import type { StrukLinkDto } from "@/shared/types/struk.types";

interface MetaRowProps {
  readonly label: string;
  readonly children: React.ReactNode;
}

function MetaRow({ label, children }: MetaRowProps) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-garis py-2 last:border-b-0">
      <dt className="shrink-0 text-sm text-ink-lemah">{label}</dt>
      <dd className="min-w-0 text-right text-sm text-ink">{children}</dd>
    </div>
  );
}

export function BatchDetailPage() {
  const params = useParams();
  const batchId = typeof params.batchId === "string" ? params.batchId : undefined;

  const batchQuery = useBatchDetail(batchId);
  const ledgerQuery = useLedgerEvents(batchId);
  const verifyQuery = useBatchVerification(batchId);

  const loading = batchQuery.isPending || ledgerQuery.isPending;
  const failed = batchQuery.isError || ledgerQuery.isError;
  const error = isApiError(batchQuery.error) ? batchQuery.error : isApiError(ledgerQuery.error) ? ledgerQuery.error : null;
  const batch = batchQuery.data;
  const role = useAuthStore((state) => state.role);
  const [appendOpen, setAppendOpen] = useState(false);
  const [regateOpen, setRegateOpen] = useState(false);
  const [strukLink, setStrukLink] = useState<StrukLinkDto | null>(null);
  const mintStruk = useMintStruk();
  const showToast = useToastStore((state) => state.show);

  const retry = () => {
    void batchQuery.refetch();
    void ledgerQuery.refetch();
  };

  if (loading) {
    return (
      <div className="flex max-w-3xl flex-col gap-4">
        <Skeleton className="h-6 w-40" />
        <SkeletonList rows={3} />
      </div>
    );
  }

  if (failed || batch === undefined) {
    return (
      <div className="max-w-3xl">
        <ErrorState
          description={error?.message ?? "Batch tidak dapat dimuat."}
          requestId={error?.requestId}
          onRetry={retry}
        />
      </div>
    );
  }

  const events = ledgerQuery.data?.events ?? [];
  const transfer = ledgerQuery.data?.transfer ?? null;
  const ongoing = batch.status !== "SELESAI" && batch.status !== "TERSANGKUT";
  const moisture =
    batch.moistureProxy === null ? null : MOISTURE_LABELS[batch.moistureProxy as MoistureProxy];
  const appendOptions = role === null ? [] : uiAppendOptions(role, batch.status);
  const canRegate = batch.status === "GAGAL_GATE" && (role === "sppg_staff" || role === "admin");

  const handleMintStruk = () => {
    mintStruk.mutate(batch.id, {
      onSuccess: (link) => {
        setStrukLink(link);
      },
      onError: (cause) => {
        showToast({
          message: isApiError(cause) ? cause.message : "Tidak dapat membuat tautan struk.",
          tone: "bata"
        });
      }
    });
  };

  return (
    <div className="flex max-w-3xl flex-col gap-6">
      <PageHeader
        title="Detail batch"
        breadcrumb={[{ label: "Batch", to: "/batches" }, { label: batch.id.slice(0, 8) }]}
        description={formatDateTime(batch.dikeluarkanAt)}
      />

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-garis pb-5">
        <KgValue value={batch.weightKg} className="text-2xl text-ink" />
        {batch.gateStatus === null ? null : <Stamp verdict={batch.gateStatus} />}
        <span className="text-sm text-ink-lemah">
          {BATCH_STATUS_LABELS[batch.status]} · {FLOW_LABELS[batch.aliran]}
        </span>
        {role === null ? null : (
          <div className="ml-auto flex flex-wrap gap-2">
            {appendOptions.length === 0 ? null : (
              <Button variant="secondary" size="sm" onClick={() => setAppendOpen(true)}>
                Catat peristiwa
              </Button>
            )}
            {canRegate ? (
              <Button variant="secondary" size="sm" onClick={() => setRegateOpen(true)}>
                Nilai ulang gerbang
              </Button>
            ) : null}
            <Button variant="secondary" size="sm" loading={mintStruk.isPending} onClick={handleMintStruk}>
              Bagikan struk
            </Button>
          </div>
        )}
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-ink">Perjalanan batch</h2>
        <PitaPaspor
          events={events}
          transfer={transfer}
          chainIssue={verifyQuery.data?.chainIssue ?? null}
          ongoing={ongoing}
        />
      </section>

      {batch.aliran === "organik" ? (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-ink">Komposisi</h2>
          <FractionBar values={batch.fractions} />
        </section>
      ) : null}

      {batch.photoHash === null ? null : (
        <section className="flex flex-col gap-2">
          <h2 className="text-sm font-medium text-ink">Foto bukti</h2>
          <PhotoBukti sha256={batch.photoHash} />
        </section>
      )}

      <section className="flex flex-col">
        <h2 className="pb-2 text-sm font-medium text-ink">Catatan batch</h2>
        <dl className="flex flex-col">
          <MetaRow label="Waktu kejadian">{formatDateTime(batch.dikeluarkanAt)}</MetaRow>
          <MetaRow label="Kadar air">{moisture ?? "Tidak diuji"}</MetaRow>
          <MetaRow label="Berminyak">{batch.visibleOil ? "Ya" : "Tidak"}</MetaRow>
          <MetaRow label="Tingkat putusan">
            {batch.tier === null ? "Belum ada" : `${batch.tier} · ${TIER_LABELS[batch.tier]}`}
          </MetaRow>
          <MetaRow label="Foto">
            {batch.photoHash === null ? "Belum ada" : <HashTag hash={batch.photoHash} />}
          </MetaRow>
        </dl>
      </section>

      <LedgerVerifyPanel batchId={batch.id} />

      <section className="flex flex-col gap-2">
        <h2 className="text-sm font-medium text-ink">Peristiwa ledger</h2>
        <LedgerEventList events={events} />
      </section>

      <AppendEventSheet
        open={appendOpen}
        onOpenChange={setAppendOpen}
        batchId={batch.id}
        batchWeightKg={batch.weightKg}
        status={batch.status}
        role={role}
      />

      <RegateSheet
        open={regateOpen}
        onOpenChange={setRegateOpen}
        batchId={batch.id}
        currentMoistureProxy={batch.moistureProxy}
        currentVisibleOil={batch.visibleOil}
      />

      <StrukLinkSheet
        link={strukLink}
        onOpenChange={(open) => {
          if (!open) setStrukLink(null);
        }}
      />

      <p className="text-xs text-ink-lemah">
        <Link to="/batches" className="text-biru-tinta underline underline-offset-2">
          Kembali ke daftar batch
        </Link>
      </p>
    </div>
  );
}