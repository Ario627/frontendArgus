import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { LifeBuoyIcon, RouteIcon, ZapIcon, Undo2Icon } from "lucide-react";
import { RecoveryTriggerButton } from "../components/recovery-trigger-button";
import { RecoveryAssignForm } from "../components/recovery-assign-form";
import { RecoveryResultCard } from "../components/recovery-result-card";
import { useTriggerRecovery } from "../hooks/use-trigger-recovery";
import { useAssignRecovery } from "../hooks/use-assign-recovery";
import { DialogContent, Dialog, DialogHeader, DialogTitle } from "../../../shared/components/ui/dialog";
import { EmptyState } from "../../../shared/components/feedback/empty-state";
import { Button } from "../../../shared/components/ui/button";
import { Skeleton } from "../../../shared/components/ui/skeleton";
import { useAuthStore } from "../../auth/store/auth.store";
import { useFleetList } from "../../fleet/hooks/use-fleet-list";
import { recoveryApi, type RecoverySuggestion } from "../api/recovery.api";
import type { RecoveryResult } from "../../../shared/types/recovery.types";
import type { RecoveryAssignFormValues } from "../schemas/recovery-assign.schema";

function computeAutoAssignment(
  suggestion: RecoverySuggestion,
): RecoveryAssignFormValues | null {
  const stops = [...suggestion.pendingStops].sort((a, b) => b.priority - a.priority);
  const candidates = [...suggestion.candidates].sort((a, b) => a.distanceKm - b.distanceKm);
  const remaining = new Map(candidates.map((c) => [c.fleetId, c.remainingCapacityKg]));

  const receiverSet = new Set<string>();
  const stopSet = new Set<string>();
  const assignments = new Map<string, string[]>();

  for (const stop of stops) {
    let assigned = false;
    for (const candidate of candidates) {
      const cap = remaining.get(candidate.fleetId) ?? 0;
      if (cap >= stop.demandKg) {
        remaining.set(candidate.fleetId, cap - stop.demandKg);
        receiverSet.add(candidate.fleetId);
        stopSet.add(stop.destId);
        const list = assignments.get(candidate.fleetId) ?? [];
        list.push(stop.destId);
        assignments.set(candidate.fleetId, list);
        assigned = true;
        break;
      }
    }
    if (!assigned) stopSet.add(stop.destId);
  }

  if (stopSet.size === 0) return null;

  return {
    brokenFleetId: suggestion.brokenFleetId,
    receivingFleetIds: Array.from(receiverSet),
    redistributedStopIds: Array.from(stopSet),
  };
}

export function RecoveryPage() {
  const user = useAuthStore((s) => s.user);
  const triggerMutation = useTriggerRecovery();
  const assignMutation = useAssignRecovery();
  const { data: fleetPage, isLoading: fleetLoading } = useFleetList({ page: 1, limit: 100 });

  const [brokenFleetId, setBrokenFleetId] = useState<string>("");
  const [assignDialogOpen, setAssignDialogOpen] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<RecoveryResult | null>(null);
  const [useAutoAssign, setUseAutoAssign] = useState<boolean>(true);
  const [manualOverrides, setManualOverrides] = useState<RecoveryAssignFormValues | null>(null);

  const suggestQuery = useQuery<RecoverySuggestion>({
    queryKey: ["recovery", "suggest", brokenFleetId],
    queryFn: () => recoveryApi.suggest(brokenFleetId),
    enabled: assignDialogOpen && brokenFleetId.length > 0,
    staleTime: 30_000,
  });

  const isDriver = user?.role === "driver";
  const driverFleetId = user?.fleetId ?? "";

  const fleetOptions = useMemo(() => {
    if (!fleetPage?.data) return [];
    return fleetPage.data
      .filter((f) => f.operationalStatus === "ONLINE_BROKEN")
      .map((f) => ({
        id: f.id,
        label: `${f.plateNumber} — Rusak (${f.driverName})`,
      }));
  }, [fleetPage]);

  const candidateFleets = useMemo(() => {
    if (!suggestQuery.data?.candidates) return [];
    return suggestQuery.data.candidates.map((c) => ({
      id: c.fleetId,
      label: `${c.plateNumber} — ${c.distanceKm} km — ${c.remainingCapacityKg} kg`,
    }));
  }, [suggestQuery.data]);

  const pendingStops = useMemo(() => {
    if (!suggestQuery.data?.pendingStops) return [];
    return suggestQuery.data.pendingStops.map((s) => ({
      id: s.destId,
      label: `${s.destName} — ${s.demandKg} kg (P${s.priority})`,
    }));
  }, [suggestQuery.data]);

  const autoValues = useMemo(() => {
    if (!suggestQuery.data || !useAutoAssign) return null;
    return computeAutoAssignment(suggestQuery.data);
  }, [suggestQuery.data, useAutoAssign]);

  const effectiveAssignValues = manualOverrides ?? autoValues;
  const hasAutoSuggestion = autoValues !== null;

  const handleTrigger = useCallback(
    (fleetId: string) => {
      if (!fleetId.trim()) return;
      triggerMutation.mutate(
        { brokenFleetId: fleetId.trim(), manual: true },
        {
          onSuccess: (data) => {
            setLastResult(data);
            setManualOverrides(null);
            setUseAutoAssign(true);
            if (data.status === "no_receiver") {
              setAssignDialogOpen(true);
            }
          },
        },
      );
    },
    [triggerMutation],
  );

  const handleAssignSubmit = useCallback(
    (values: RecoveryAssignFormValues) => {
      assignMutation.mutate(values, {
        onSuccess: (data) => {
          setLastResult(data);
          setAssignDialogOpen(false);
          setManualOverrides(null);
          setUseAutoAssign(true);
        },
      });
    },
    [assignMutation],
  );

  const handleAssignManual = useCallback(() => {
    setAssignDialogOpen(true);
  }, []);

  const handleManualOverride = useCallback(
    (values: RecoveryAssignFormValues) => {
      setManualOverrides(values);
    },
    [],
  );

  const handleResetAuto = useCallback(() => {
    setManualOverrides(null);
    setUseAutoAssign(true);
  }, []);

  const hasStops = pendingStops.length > 0;
  const hasCandidates = candidateFleets.length > 0;
  const isSuggestLoading = suggestQuery.isLoading;

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-col gap-2 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center bg-status-fallback/10">
            <LifeBuoyIcon className="h-5 w-5 text-status-fallback" aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Recovery Armada
            </h1>
            <p className="text-sm text-muted-foreground">
              Trigger redistribusi rute saat armada mengalami kerusakan
            </p>
          </div>
        </div>
      </header>

      <section aria-label="Form trigger recovery">
        <div className="border border-border bg-background p-5 space-y-4">
          <div className="space-y-2">
            <label htmlFor="broken-fleet-id" className="text-sm font-medium text-foreground">
              Truk Rusak
            </label>
            {isDriver ? (
              <input
                id="broken-fleet-id"
                type="text"
                value={driverFleetId}
                readOnly
                disabled
                className="flex h-10 w-full border border-border bg-transparent px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-70"
              />
            ) : fleetLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <select
                id="broken-fleet-id"
                value={brokenFleetId}
                onChange={(e) => setBrokenFleetId(e.target.value)}
                className="flex h-10 w-full border border-border bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">— Pilih armada —</option>
                {fleetOptions.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            )}
            {isDriver && (
              <p className="text-xs text-muted-foreground">
                Sebagai driver, Anda hanya bisa trigger recovery untuk truk Anda sendiri.
              </p>
            )}
          </div>

          <RecoveryTriggerButton
            brokenFleetId={isDriver ? driverFleetId : brokenFleetId}
            onTrigger={handleTrigger}
            isTriggering={triggerMutation.isPending}
            disabled={isDriver ? !driverFleetId : !brokenFleetId.trim()}
          />
        </div>
      </section>

      {triggerMutation.isPending && !lastResult && (
        <section aria-label="Memproses recovery">
          <div className="flex items-center justify-center border border-border bg-muted/20 p-12">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
              <p className="text-sm text-muted-foreground">Memproses recovery, mohon tunggu...</p>
            </div>
          </div>
        </section>
      )}

      {lastResult && !triggerMutation.isPending && (
        <section aria-label="Hasil recovery">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <RouteIcon className="h-4 w-4 text-brand" aria-hidden />
              <h2 className="text-lg font-semibold text-foreground">Hasil Recovery</h2>
            </div>
            <RecoveryResultCard
              result={lastResult}
              onAssignManual={handleAssignManual}
            />
          </div>
        </section>
      )}

      {!lastResult && !triggerMutation.isPending && (
        <EmptyState
          icon={LifeBuoyIcon}
          title="Belum ada proses recovery"
          description="Pilih armada rusak dari dropdown di atas dan klik Trigger Recovery."
        />
      )}

      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-130">
          <DialogHeader>
            <DialogTitle>Assign Manual Recovery</DialogTitle>
          </DialogHeader>

          {isSuggestLoading && (
            <div className="space-y-3 py-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          )}

          {!isSuggestLoading && !hasStops && (
            <div className="py-4 text-center text-sm text-muted-foreground">
              <p>Truk ini tidak memiliki stop yang perlu didistribusi ulang.</p>
              <p className="mt-1 text-xs">Pastikan rute harian sudah dibuat untuk truk ini.</p>
            </div>
          )}

          {!isSuggestLoading && hasStops && (
            <>
              {hasAutoSuggestion && effectiveAssignValues === autoValues && (
                <div className="flex items-center gap-2 rounded bg-brand/10 px-3 py-2 text-xs text-brand">
                  <ZapIcon className="h-3.5 w-3.5 shrink-0" />
                  <span>
                    Auto-assignment tersedia — {autoValues.receivingFleetIds.length} penerima,{" "}
                    {autoValues.redistributedStopIds.length} stop. Anda bisa mengubahnya secara manual.
                  </span>
                </div>
              )}

              {manualOverrides !== null && (
                <div className="flex items-center justify-between rounded bg-amber-500/10 px-3 py-2 text-xs text-amber-600">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    Mode override manual — assignment tidak otomatis.
                  </span>
                  <button
                    type="button"
                    onClick={handleResetAuto}
                    className="flex items-center gap-1 font-medium hover:text-amber-700 transition-colors"
                  >
                    <Undo2Icon className="h-3.5 w-3.5" />
                    Reset ke auto
                  </button>
                </div>
              )}

              {hasAutoSuggestion && (
                <RecoveryAssignForm
                  key={`assign-${brokenFleetId}-${manualOverrides ? "manual" : "auto"}`}
                  brokenFleetId={brokenFleetId}
                  candidateFleets={candidateFleets}
                  pendingStops={pendingStops}
                  autoValues={manualOverrides ?? autoValues}
                  onSubmit={(values) => {
                    if (manualOverrides) {
                      handleAssignSubmit(values);
                    } else {
                      handleManualOverride(values);
                    }
                  }}
                  onCancel={() => setAssignDialogOpen(false)}
                  isSubmitting={assignMutation.isPending}
                  isAutoMode={!manualOverrides && useAutoAssign}
                />
              )}

              {!hasAutoSuggestion && (
                <div className="py-2 text-center text-xs text-amber-600">
                  Tidak dapat menghitung auto-assignment. Silakan pilih penerima dan stop secara manual.
                </div>
              )}
            </>
          )}

          {!isSuggestLoading && hasStops && !hasCandidates && (
            <div className="py-2 text-center text-xs text-amber-600">
              Tidak ada truk penerima yang tersedia. Pastikan ada armada aktif dengan kapasitas cukup.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
