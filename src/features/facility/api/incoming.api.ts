import { apiGet } from "@/api/axios-client";
import { endpoints } from "@/api/endpoints";
import type { DispositionQueueItem } from "@/shared/types/disposition.types";

export function fetchDispositionQueue(date: string): Promise<readonly DispositionQueueItem[]> {
  return apiGet<readonly DispositionQueueItem[]>(
    `${endpoints.dispositions.list}?date=${encodeURIComponent(date)}`
  );
}