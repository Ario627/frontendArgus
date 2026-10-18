import { apiGet, apiPost } from "@/api/axios-client";
import { endpoints } from "@/api/endpoints";
import { toSearchParams } from "@/shared/lib/search-params";
import type { PaginatedItems } from "@/shared/types/api.types";
import type { DeviceType } from "@/shared/constants/device.constant";
import type {
  CreateDeviceInput,
  DeviceCreatedDto,
  DeviceDto,
  RevokeDeviceResult
} from "@/shared/types/device.types";

export interface DeviceQuery {
  readonly tipe?: DeviceType;
  readonly sppgId?: string;
  readonly fleetId?: string;
  readonly revoked?: boolean;
  readonly page?: number;
  readonly limit?: number;
}

export function fetchDeviceList(query: DeviceQuery = {}): Promise<PaginatedItems<DeviceDto>> {
  return apiGet<PaginatedItems<DeviceDto>>(
    `${endpoints.devices.list}${toSearchParams({ ...query })}`
  );
}

export function fetchDeviceDetail(id: string): Promise<DeviceDto> {
  return apiGet<DeviceDto>(endpoints.devices.detail(id));
}

export function createDevice(input: CreateDeviceInput): Promise<DeviceCreatedDto> {
  return apiPost<DeviceCreatedDto>(endpoints.devices.create, input);
}

export function revokeDevice(id: string): Promise<RevokeDeviceResult> {
  return apiPost<RevokeDeviceResult>(endpoints.devices.revoke(id));
}

export function rotateDeviceSecret(id: string): Promise<DeviceCreatedDto> {
  return apiPost<DeviceCreatedDto>(endpoints.devices.rotateSecret(id));
}
