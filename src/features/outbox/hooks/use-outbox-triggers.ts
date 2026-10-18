import { useEffect } from "react";
import { useOutboxStore } from "@/features/outbox/outbox.store";
import { env } from "@/shared/lib/env";

export function useOutboxTriggers(): void {
  const hydrate = useOutboxStore((state) => state.hydrate);
  const syncNow = useOutboxStore((state) => state.syncNow);

  useEffect(() => {
    let active = true;
    void hydrate().then(() => {
      if (active && navigator.onLine) void syncNow();
    });
    return () => {
      active = false;
    };
  }, [hydrate, syncNow]);

  useEffect(() => {
    const handleOnline = () => {
      void syncNow();
    };
    window.addEventListener("online", handleOnline);
    return () => {
      window.removeEventListener("online", handleOnline);
    };
  }, [syncNow]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      void syncNow();
    }, env.VITE_OUTBOX_SYNC_MS);
    return () => {
      clearInterval(interval);
    };
  }, [syncNow]);
}