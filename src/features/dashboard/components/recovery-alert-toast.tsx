import { useEffect, useRef } from "react";
import { toast } from "sonner";
import type { DashboardSummary } from "../../../shared/types/dashboard.types";

interface RecoveryAlertToastProps {
  summary: DashboardSummary | undefined;
}

export function RecoveryAlertToast({ summary }: RecoveryAlertToastProps) {
  const prevCountRef = useRef<number | null>(null);

  useEffect(() => {
    if (!summary) return;

    const currentCount = summary.recoveryCountToday;

    if (prevCountRef.current !== null && currentCount > prevCountRef.current) {
      const diff = currentCount - prevCountRef.current;
      const message =
        diff === 1
          ? "1 recovery baru tercatat hari ini"
          : `${diff} recovery baru tercatat hari ini`;

      toast.success(message, {
        id: "recovery-alert-toast",
        duration: 5000,
      });
    }

    prevCountRef.current = currentCount;
  }, [summary?.recoveryCountToday]);

  return null;
}