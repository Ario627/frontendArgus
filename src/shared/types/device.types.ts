import type { DeviceType } from "@/shared/constants/device.constant";

export interface DeviceDto {
  readonly id: string;
  readonly tipe: DeviceType;
  readonly fleetId: string | null;
  readonly sppgId: string | null;
  readonly mqttUsername: string;
  readonly firmware: string | null;
  readonly lastSeenAt: string | null;
  readonly lastWeightAt: string | null;
  readonly revokedAt: string | null;
  readonly aktif: boolean;
  readonly createdAt: string;
}

export interface DeviceProvisioningDto {
  readonly mqttUsername: string;
  readonly mqttPassword: string;
  readonly deviceSecret: string | null;
}

export interface DeviceCreatedDto {
  readonly device: DeviceDto;
  readonly provisioning: DeviceProvisioningDto;
}

export interface CreateDeviceInput {
  readonly tipe: DeviceType;
  readonly fleetId?: string;
  readonly sppgId?: string;
  readonly firmware?: string;
}

export interface RevokeDeviceResult {
  readonly device: DeviceDto;
  readonly alreadyRevoked: boolean;
}
