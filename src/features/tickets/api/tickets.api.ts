import { apiGet, apiPost } from "@/api/axios-client";
import { endpoints } from "@/api/endpoints";
import { toSearchParams } from "@/shared/lib/search-params";
import type { PaginatedItems } from "@/shared/types/api.types";
import type {
  CloseTicketInput,
  PhotoLinkDto,
  RespondTicketInput,
  TicketDetailDto,
  TicketDto,
  VerifyTicketInput
} from "@/shared/types/ticket.types";

export type TicketQuery = {
  readonly status?: string;
  readonly jenis?: string;
  readonly sppgId?: string;
  readonly page?: number;
  readonly limit?: number;
};

export function fetchTickets(query: TicketQuery): Promise<PaginatedItems<TicketDto>> {
  return apiGet<PaginatedItems<TicketDto>>(`${endpoints.tickets.list}${toSearchParams(query)}`);
}

export function fetchTicketDetail(ticketId: string): Promise<TicketDetailDto> {
  return apiGet<TicketDetailDto>(endpoints.tickets.detail(ticketId));
}

export function fetchPhotoLink(sha256: string): Promise<PhotoLinkDto> {
  return apiGet<PhotoLinkDto>(endpoints.photos.byHash(sha256));
}

export function verifyTicket(ticketId: string, input: VerifyTicketInput): Promise<TicketDetailDto> {
  return apiPost<TicketDetailDto>(endpoints.tickets.verify(ticketId), input);
}

export function respondTicket(ticketId: string, input: RespondTicketInput): Promise<TicketDetailDto> {
  return apiPost<TicketDetailDto>(endpoints.tickets.respond(ticketId), input);
}

export function closeTicket(ticketId: string, input: CloseTicketInput): Promise<TicketDetailDto> {
  return apiPost<TicketDetailDto>(endpoints.tickets.close(ticketId), input);
}