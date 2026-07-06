import { useState, useEffect, useRef, useCallback } from "react";

function computeStaleness(isoTimestamp: string): number {
  const deviceTime = Date.parse(isoTimestamp);
  if (Number.isNaN(deviceTime)) return 0;
  return Math.max(0, Math.floor((Date.now() - deviceTime) / 1000));
}

export function useLiveStaleness(lastDeviceTimestamp: string): number {
  const [staleness, setStaleness] = useState(() =>
    computeStaleness(lastDeviceTimestamp),
  );
  const timestampRef = useRef(lastDeviceTimestamp);

  const recalculate = useCallback(() => {
    setStaleness(computeStaleness(timestampRef.current));
  }, []);

  useEffect(() => {
    timestampRef.current = lastDeviceTimestamp;
    setStaleness(computeStaleness(lastDeviceTimestamp));
  }, [lastDeviceTimestamp]);

  useEffect(() => {
    const intervalId = setInterval(recalculate, 1000);
    return () => clearInterval(intervalId);
  }, [recalculate]);

  return staleness;
}