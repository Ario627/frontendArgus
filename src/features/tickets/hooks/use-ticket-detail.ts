import { useQuery } from "@tanstack/react-query";
import { qk } from "@/api/query-keys";
import { fetchTicketDetail } from "@/features/tickets/api/tickets.api";

export function useTicketDetail(ticketId: string | undefined) {
  return useQuery({
    queryKey: qk.tickets.detail(ticketId ?? "kosong"),
    queryFn: () => fetchTicketDetail(ticketId ?? ""),
    enabled: ticketId !== undefined,
    staleTime: 15_000
  });
}