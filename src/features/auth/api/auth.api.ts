import { apiGet, apiPost } from "@/api/axios-client";
import { endpoints } from "@/api/endpoints";
import type { LoginInput, LoginResult, UserProfile } from "@/shared/types/auth.types";

export function login(input: LoginInput): Promise<LoginResult> {
  return apiPost<LoginResult>(endpoints.auth.login, input);
}

export function fetchMe(): Promise<UserProfile> {
  return apiGet<UserProfile>(endpoints.auth.me);
}