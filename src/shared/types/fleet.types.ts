import type { FleetStatus, HardwareStatus } from "@/shared/constants/fleet.constant";

export interface FleetDto {
  readonly id: string;
  readonly kode: string;
  readonly plat: string | null;
  readonly driverNama: string | null;
  readonly driverKontak: string | null;
  readonly kapasitasKg: number | null;
  readonly statusOperasional: FleetStatus;
  readonly lastLat: number | null;
  readonly lastLng: number | null;
  readonly lastDeviceTimestamp: string | null;
  readonly stalenessSeconds: number | null;
  readonly aktif: boolean;
  readonly isDemo: boolean;
}

export interface TelemetryPointDto {
  readonly fleetId: string;
  readonly deviceTimestamp: string;
  readonly receivedAt: string;
  readonly lat: number | null;
  readonly lng: number | null;
  readonly speedKmh: number | null;
  readonly volumePercent: number | null;
  readonly hardwareStatus: HardwareStatus | null;
}

export interface TelemetryLatestReport {
  readonly fleetId: string;
  readonly kode: string;
  readonly status: FleetStatus;
  readonly stalenessSeconds: number | null;
  readonly latest: TelemetryPointDto | null;
}

export interface FleetPositionReport {
  readonly fleetId: string;
  readonly from: string;
  readonly to: string;
  readonly points: readonly TelemetryPointDto[];
}

export interface CreateFleetInput {
  readonly kode: string;
  readonly plat?: string;
  readonly driverNama?: string;
  readonly kapasitasKg?: number;
}

export interface UpdateFleetInput {
  readonly kode?: string;
  readonly plat?: string | null;
  readonly driverNama?: string | null;
  readonly kapasitasKg?: number | null;
  readonly aktif?: boolean;
}