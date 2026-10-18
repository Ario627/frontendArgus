import { apiGet } from "@/api/axios-client";
import { endpoints } from "@/api/endpoints";
import type { PublicStrukDto } from "@/shared/types/struk.types";

export function fetchPublicStruk(token: string): Promise<PublicStrukDto> {
  return apiGet<PublicStrukDto>(endpoints.public.struk(token));
}