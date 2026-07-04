export type UserRole = "admin" | "supervisor" | "driver";
export type HardwareStatus = "normal" | "broken";
export type OperationalStatus =
  | "ONLINE_NORMAL"
  | "ONLINE_BROKEN"
  | "STALE"
  | "OFFLINE";
export type DestinationType = "TPA" | "RDF" | "TPS_3R";

export interface AuthenticatedUser {
  readonly id: string;
  readonly username: string;
  readonly role: UserRole;
  readonly fleetId: string | null;
}

export interface HealthResponse {
  readonly status: "ok" | "degraded" | "down";
  readonly db: boolean;
  readonly mqtt: boolean;
  readonly timestamp: string;
}

export interface PaginatedResponse<T> {
  readonly data: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly limit: number;
  readonly hasNext: boolean;
}
