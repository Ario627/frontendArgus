import { apiGet, apiPost, apiUpload } from "@/api/axios-client";
import { endpoints } from "@/api/endpoints";
import type {
  CreatePublicTicketInput,
  PublicSppgDto,
  PublicTicketCreatedDto
} from "@/shared/types/ticket.types";

export interface PublicPhotoResult {
  readonly fotoHash: string;
  readonly duplicate: boolean;
}

export function fetchPublicSppg(slug: string): Promise<PublicSppgDto> {
  return apiGet<PublicSppgDto>(endpoints.public.sppg(slug));
}

export function uploadPublicPhoto(file: Blob): Promise<PublicPhotoResult> {
  const formData = new FormData();
  formData.append("foto", file, "laporan.jpg");
  return apiUpload<PublicPhotoResult>(endpoints.public.photos, formData);
}

export function submitPublicTicket(input: CreatePublicTicketInput): Promise<PublicTicketCreatedDto> {
  return apiPost<PublicTicketCreatedDto>(endpoints.public.tickets, input);
}