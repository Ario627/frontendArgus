import { apiGet, apiPut } from "@/api/axios-client";
import { endpoints } from "@/api/endpoints";
import type { ParameterDto, UpdateParameterInput } from "@/shared/types/parameter.types";

export function fetchParameters(): Promise<readonly ParameterDto[]> {
  return apiGet<readonly ParameterDto[]>(endpoints.parameters.list);
}

export function updateParameter(
  kunci: string,
  input: UpdateParameterInput
): Promise<ParameterDto> {
  return apiPut<ParameterDto>(endpoints.parameters.update(kunci), input);
}