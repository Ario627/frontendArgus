import { useState, useCallback, useMemo } from "react";
import { LifeBuoyIcon, RouteIcon } from "lucide-react";
import { RecoveryTriggerButton } from "../components/recovery-trigger-button";
import { RecoveryAssignForm } from "../components/recovery-assign-form";
import { RecoveryResultCard } from "../components/recovery-result-card";
import { useTriggerRecovery } from "../hooks/use-trigger-recovery";
import { useAssignRecovery } from "../hooks/use-assign-recovery";
import { DialogContent, Dialog, DialogHeader, DialogTitle } from "../../../shared/components/ui/dialog";
import { EmptyState } from "../../../shared/components/feedback/empty-state";
import { useAuthStore } from "../../auth/store/auth.store";
import type { RecoveryResult } from "../../../shared/types/recovery.types";

const CANDIDATE_FLEETS = Object.freeze([
  { id: "TRK-002", label: "TRK-002 — Kapasitas 5000 kg" },
  { id: "TRK-003", label: "TRK-003 — Kapasitas 4500 kg" },
  { id: "TRK-004", label: "TRK-004 — Kapasitas 6000 kg" },
] as const);

const PENDING_STOPS = Object.freeze([
  { id: "TPS-12", label: "TPS-12 — Demand 800 kg" },
  { id: "TPS-15", label: "TPS-15 — Demand 600 kg" },
  { id: "TPS-22", label: "TPS-22 — Demand 1200 kg" },
] as const);

export function RecoveryPage() {
  const user = useAuthStore((s) => s.user);
  const triggerMutation = useTriggerRecovery();
  const assignMutation = useAssignRecovery();

  const [brokenFleetId, setBrokenFleetId] = useState<string>("");
  const [assignDialogOpen, setAssignDialogOpen] = useState<boolean>(false);
  const [lastResult, setLastResult] = useState<RecoveryResult | null>(null);

  const candidateFleets = useMemo(() => CANDIDATE_FLEETS, []);
  const pendingStops = useMemo(() => PENDING_STOPS, []);

  const handleTrigger = useCallback(
    (fleetId: string) => {
      if (!fleetId.trim()) return;
      triggerMutation.mutate(
        { brokenFleetId: fleetId.trim(), manual: true },
        {
          onSuccess: (data) => {
            setLastResult(data);
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
    (values: {
      brokenFleetId: string;
      receivingFleetIds: string[];
      redistributedStopIds: string[];
    }) => {
      assignMutation.mutate(values, {
        onSuccess: (data) => {
          setLastResult(data);
          setAssignDialogOpen(false);
        },
      });
    },
    [assignMutation],
  );

  const handleAssignManual = useCallback(() => {
    setAssignDialogOpen(true);
  }, []);

  const isDriver = user?.role === "driver";
  const driverFleetId = user?.fleetId ?? "";

  return (
    <div className="space-y-6 p-6">
      <header className="flex flex-col gap-2 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-status-fallback/10">
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
        <div className="rounded-lg border border-border bg-background p-5 space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="broken-fleet-id"
              className="text-sm font-medium text-foreground"
            >
              ID Truk Rusak
            </label>
            <input
              id="broken-fleet-id"
              type="text"
              value={isDriver ? driverFleetId : brokenFleetId}
              onChange={(e) => setBrokenFleetId(e.target.value)}
              placeholder="Contoh: TRK-001"
              readOnly={isDriver}
              disabled={isDriver}
              className="flex h-10 w-full rounded-md border border-border bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-70"
            />
            {isDriver && (
              <p className="text-xs text-muted-foreground">
                Sebagai driver, Anda hanya bisa trigger recovery untuk truk Anda
                sendiri.
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
          <div className="flex items-center justify-center rounded-lg border border-border bg-muted/20 p-12">
            <div className="flex flex-col items-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
              <p className="text-sm text-muted-foreground">
                Memproses recovery, mohon tunggu...
              </p>
            </div>
          </div>
        </section>
      )}

      {lastResult && !triggerMutation.isPending && (
        <section aria-label="Hasil recovery">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <RouteIcon className="h-4 w-4 text-brand" aria-hidden />
              <h2 className="text-lg font-semibold text-foreground">
                Hasil Recovery
              </h2>
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
          description="Masukkan ID truk rusak dan klik tombol trigger untuk memulai redistribusi rute."
        />
      )}

      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-130">
          <DialogHeader>
            <DialogTitle>Assign Manual Recovery</DialogTitle>
          </DialogHeader>
          <RecoveryAssignForm
            brokenFleetId={lastResult?.brokenFleetId ?? brokenFleetId}
            candidateFleets={candidateFleets}
            pendingStops={pendingStops}
            onSubmit={handleAssignSubmit}
            onCancel={() => setAssignDialogOpen(false)}
            isSubmitting={assignMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}