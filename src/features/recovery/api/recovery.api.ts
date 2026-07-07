import { apiClient } from "../../../api/axios-client";
import { API_ENDPOINTS } from "../../../api/endpoints";
import type {
  RecoveryResult,
  RecoveryAssignPayload,
  RecoveryTriggerPayload,
} from "../../../shared/types/recovery.types";

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

  result: async (brokenFleetId: string): Promise<RecoveryResult> => {
    const response = await apiClient.get<RecoveryResult>(
      API_ENDPOINTS.recovery.result(brokenFleetId),
    );
    return response.data;
  },
});
