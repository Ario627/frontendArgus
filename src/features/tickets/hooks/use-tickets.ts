import { useInfiniteQuery } from "@tanstack/react-query";
import { qk } from "@/api/query-keys";
import { fetchTickets, type TicketQuery } from "@/features/tickets/api/tickets.api";
import type { TicketKind, TicketStatus } from "@/shared/constants/ticket.constant";
import { env } from "@/shared/lib/env";

export interface TicketFilterState {
  readonly status?: TicketStatus;
  readonly jenis?: TicketKind;
}

const PAGE_LIMIT = 20;

export function useTickets(filters: TicketFilterState) {
  const baseQuery: Omit<TicketQuery, "page" | "limit"> = {
    ...(filters.status === undefined ? {} : { status: filters.status }),
    ...(filters.jenis === undefined ? {} : { jenis: filters.jenis })
  };

  return useInfiniteQuery({
    queryKey: qk.tickets.list(filters),
    queryFn: ({ pageParam }) => fetchTickets({ ...baseQuery, page: pageParam, limit: PAGE_LIMIT }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      const loaded = pages.reduce((sum, page) => sum + page.items.length, 0);
      return loaded < lastPage.total ? pages.length + 1 : undefined;
    },
    staleTime: 30_000,
    refetchInterval: env.VITE_POLL_OPERATIONAL_MS
  });
}