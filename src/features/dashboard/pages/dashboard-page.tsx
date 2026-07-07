import { useMemo, useRef, useState } from "react";
import { useDashboardSummary } from "../hooks/use-dashboard-summary";
import { useFleetPositions } from "../hooks/use-fleet-positions";
import { useRecoveryDiffNotifier } from "../hooks/use-recovery-diff-notifier";
import { useDashboardLayout } from "../hooks/use-dashboard-layout";
import { SummaryCards } from "../components/summary-cards";
import { LlmSummaryBanner } from "../components/llm-summary-banner";
import { FleetMap, type FleetMapRef } from "../components/fleet-map";
import { useAuthStore } from "../../auth/store/auth.store";
import { Button } from "../../../shared/components/ui/button";
import { Icon } from "../../../shared/components/ui/icon";
import { cn } from "../../../lib/cn";

interface SectionHeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

function SectionHeader({ title, description, action }: SectionHeaderProps) {
  return (
    <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-sm font-semibold tracking-tight text-foreground">
          {title}
        </h2>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

function OperatorBadge({
  username,
  role,
}: {
  username: string;
  role: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 shadow-sm">
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand/10 text-[10px] font-bold text-brand">
        {username.charAt(0).toUpperCase()}
      </span>
      <div className="flex items-center gap-1.5">
        <span className="max-w-25 truncate text-xs font-medium text-foreground">
          {username}
        </span>
        <span className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">
          {role}
        </span>
      </div>
    </div>
  );
}

function LayoutToolbar({
  visible,
  onToggle,
}: {
  visible: Record<string, boolean>;
  onToggle: (id: "metrics" | "narrative") => void;
}) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card p-1 shadow-sm">
      <TogglePill
        active={visible.metrics}
        onClick={() => onToggle("metrics")}
        icon="gauge"
        label="Metrik"
      />
      <TogglePill
        active={visible.narrative}
        onClick={() => onToggle("narrative")}
        icon="file-text"
        label="Naratif"
      />
    </div>
  );
}

function TogglePill({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: "gauge" | "file-text";
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors",
        active
          ? "bg-brand/10 text-brand"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
      aria-pressed={active}
    >
      <Icon name={active ? "eye" : "eye-off"} size={12} />
      {label}
    </button>
  );
}

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const summaryQuery = useDashboardSummary();
  const fleetPositionsQuery = useFleetPositions();
  const { visibleCards, toggleCard } = useDashboardLayout();
  const mapRef = useRef<FleetMapRef>(null);
  const [refreshSpin, setRefreshSpin] = useState(false);

  useRecoveryDiffNotifier(summaryQuery.data);

  const summaryGeneratedAt = useMemo(
    () => summaryQuery.data?.generatedAt ?? null,
    [summaryQuery.data?.generatedAt],
  );

  const fleetCount = useMemo(
    () => fleetPositionsQuery.data?.length ?? 0,
    [fleetPositionsQuery.data?.length],
  );

  const canRefresh =
    !summaryQuery.isFetching && !fleetPositionsQuery.isFetching;

  const handleRefresh = () => {
    setRefreshSpin(true);
    summaryQuery.refetch();
    fleetPositionsQuery.refetch();
    setTimeout(() => setRefreshSpin(false), 600);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 animate-fade-in">
      <header className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Dashboard Operasional
          </h1>
          <p className="text-sm text-muted-foreground">
            Monitoring armada sampah secara real-time
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {user && <OperatorBadge username={user.username} role={user.role} />}
          <LayoutToolbar visible={visibleCards} onToggle={toggleCard} />
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={!canRefresh}
            aria-label="Muat ulang data dashboard"
          >
            <Icon
              name="refresh"
              size={14}
              className={cn(
                "transition-transform",
                refreshSpin && "animate-spin",
                (summaryQuery.isFetching || fleetPositionsQuery.isFetching) &&
                  "animate-spin",
              )}
            />
            <span className="hidden sm:inline">
              {summaryQuery.isFetching || fleetPositionsQuery.isFetching
                ? "Memperbarui..."
                : "Muat Ulang"}
            </span>
          </Button>
        </div>
      </header>

      <section aria-label="Peta posisi armada">
        <SectionHeader
          title="Peta Posisi Armada"
          description={`${fleetCount} armada aktif dilacak`}
          action={
            fleetPositionsQuery.isFetching && !fleetPositionsQuery.isLoading ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-sm">
                <span
                  className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand"
                  aria-hidden
                />
                Memperbarui posisi...
              </span>
            ) : undefined
          }
        />
        <FleetMap
          ref={mapRef}
          positions={fleetPositionsQuery.data}
          isLoading={fleetPositionsQuery.isLoading}
          isError={fleetPositionsQuery.isError}
          onRetry={() => fleetPositionsQuery.refetch()}
          isRetrying={fleetPositionsQuery.isFetching}
        />
      </section>

      {visibleCards.metrics && (
        <section aria-label="Ringkasan operasional">
          <SectionHeader
            title="Metrik Operasional"
            description="Status armada dalam operasi hari ini"
            action={
              <button
                type="button"
                onClick={() => toggleCard("metrics")}
                className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Sembunyikan
              </button>
            }
          />
          <SummaryCards
            summary={summaryQuery.data}
            isLoading={summaryQuery.isLoading}
            isError={summaryQuery.isError}
          />
        </section>
      )}

      {visibleCards.narrative && (
        <section aria-label="Ringkasan naratif">
          <SectionHeader
            title="Ringkasan Operasional"
            description="Analisis naratif otomatis dari sistem"
            action={
              <button
                type="button"
                onClick={() => toggleCard("narrative")}
                className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Sembunyikan
              </button>
            }
          />
          <LlmSummaryBanner
            llmSummary={summaryQuery.data?.llmSummary ?? null}
            generatedAt={summaryGeneratedAt}
            isLoading={summaryQuery.isLoading}
          />
        </section>
      )}

      {!visibleCards.metrics && !visibleCards.narrative && (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center">
          <p className="text-sm font-medium text-foreground">
            Semua panel tambahan disembunyikan
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Aktifkan kembali melalui tombol di pojok kanan atas.
          </p>
        </div>
      )}
    </div>
  );
}
