import { useEffect, useState } from "react";

const DEFAULT_DELAY_MS = 300;

export function useDelayedLoading(active: boolean, delayMs: number = DEFAULT_DELAY_MS): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!active) {
      setVisible(false);
      return;
    }
    const timer = setTimeout(() => setVisible(true), delayMs);
    return () => clearTimeout(timer);
  }, [active, delayMs]);

  return visible;
}