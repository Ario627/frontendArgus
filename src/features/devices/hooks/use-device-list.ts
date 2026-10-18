import { useQuery } from "@tanstack/react-query";
import { qk } from "@/api/query-keys";
import { fetchDeviceList, type DeviceQuery } from "@/features/devices/api/devices.api";
import type { DeviceType } from "@/shared/constants/device.constant";

export interface DeviceFilterState {
  readonly tipe?: DeviceType;
  readonly revoked?: boolean;
}

const LIST_LIMIT = 100;

export function useDeviceList(filters: DeviceFilterState, enabled = true) {
  const query: Omit<DeviceQuery, "page" | "limit"> = {
    ...(filters.tipe === undefined ? {} : { tipe: filters.tipe }),
    ...(filters.revoked === undefined ? {} : { revoked: filters.revoked })
  };

  return useQuery({
    queryKey: qk.devices.list(query),
    queryFn: () => fetchDeviceList({ ...query, limit: LIST_LIMIT }),
    staleTime: 15_000,
    enabled
  });
}
