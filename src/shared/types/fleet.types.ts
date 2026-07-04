import type { HardwareStatus, OperationalStatus } from "./common.types";

export interface Fleet {
  readonly id: string;
  readonly plateNumber: string;
  readonly driverName: string;
  readonly driverContact: string | null;
  readonly capacityKg: number;
  readonly statusHardware: HardwareStatus;
  readonly operationalStatus: OperationalStatus;
  readonly lastDeviceTimestamp: string | null;
  readonly lastLat: number | null;
  readonly lastLng: number | null;
  readonly lastVolumePercent: number | null;
  readonly lastHardwareStatus: HardwareStatus | null;
  readonly deviceRevokedAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface FleetPosition {
  readonly fleetId: string;
  readonly plateNumber: string;
  readonly latitude: number;
  readonly longitude: number;
  readonly operationalStatus: OperationalStatus;
  readonly lastDeviceTimestamp: string;
  readonly stalenessSeconds: number;
  readonly isRealTime: boolean;
  readonly volumePercent: number;
  readonly hardwareStatus: HardwareStatus;
}

export interface FleetFilters {
  readonly search: string;
  readonly status: OperationalStatus | "all";
}