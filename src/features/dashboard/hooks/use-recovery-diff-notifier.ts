import { useEffect, useRef } from "react";
import { toast } from "sonner";
import type { DashboardSummary } from "../../../shared/types/dashboard.types";

const RECOVERY_TOAST_ID = "recovery-count-increase";

export function useRecoveryDiffNotifier(
  data: NoInfer<DashboardSummary> | undefined,
) {
  const prevCountRef = useRef<number | null>(null);

  useEffect(() => {
    if (!data) return;

    const currentCount = data.recoveryCountToday;
    const prevCount = prevCountRef.current;

    if (prevCount !== null && currentCount > prevCount) {
      const diff = currentCount - prevCount;
      toast.success(`${diff} recovery baru hari ini (total: ${currentCount})`, {
        id: RECOVERY_TOAST_ID,
      });
    }

    prevCountRef.current = currentCount;
  }, [data]);
}
