import { apiClient } from "../../../api/axios-client";
import { API_ENDPOINTS } from "../../../api/endpoints";
import type {
  RecoveryResult,
  RecoveryAssignPayload,
  RecoveryTriggerPayload,
} from "../../../shared/types/recovery.types";

export interface RecoverySuggestion {
  readonly brokenFleetId: string;
  readonly pendingStops: readonly {
    readonly destId: string;
    readonly destName: string;
    readonly demandKg: number;
    readonly priority: number;
  }[];
  readonly candidates: readonly {
    readonly fleetId: string;
    readonly plateNumber: string;
    readonly distanceKm: number;
    readonly remainingCapacityKg: number;
  }[];
}

export const recoveryApi = Object.freeze({
  trigger: async (payload: RecoveryTriggerPayload): Promise<RecoveryResult> => {
    const response = await apiClient.post<RecoveryResult>(
      API_ENDPOINTS.recovery.trigger,
      payload,
    );
    return response.data;
  },

  assign: async (payload: RecoveryAssignPayload): Promise<RecoveryResult> => {
    const response = await apiClient.post<RecoveryResult>(
      API_ENDPOINTS.recovery.assign,
      payload,
    );
    return response.data;
  },

  suggest: async (brokenFleetId: string): Promise<RecoverySuggestion> => {
    const response = await apiClient.get<RecoverySuggestion>(
      API_ENDPOINTS.recovery.suggest(brokenFleetId),
    );
    return response.data;
  },

  result: async (brokenFleetId: string): Promise<RecoveryResult> => {
    const response = await apiClient.get<RecoveryResult>(
      API_ENDPOINTS.recovery.result(brokenFleetId),
    );
    return response.data;
  },
});
