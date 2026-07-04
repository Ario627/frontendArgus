import type { DestinationType } from "./common.types";

export interface Destination {
  readonly id: string;
  readonly name: string;
  readonly type: DestinationType;
  readonly latitude: number;
  readonly longitude: number;
  readonly capacityKg: number;
  readonly priority: number;
  readonly lowVolumeFlag: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}