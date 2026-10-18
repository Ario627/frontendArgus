import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  closeTicket,
  respondTicket,
  verifyTicket
} from "@/features/tickets/api/tickets.api";
import type {
  CloseTicketInput,
  RespondTicketInput,
  VerifyTicketInput
} from "@/shared/types/ticket.types";

export interface VerifyVariables {
  readonly ticketId: string;
  readonly input: VerifyTicketInput;
}

export interface RespondVariables {
  readonly ticketId: string;
  readonly input: RespondTicketInput;
}

export interface CloseVariables {
  readonly ticketId: string;
  readonly input: CloseTicketInput;
}

function useInvalidateTickets() {
  const queryClient = useQueryClient();
  return (ticketId: string) => {
    void queryClient.invalidateQueries({ queryKey: ["tickets"] });
    void queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    return ticketId;
  };
}

export function useVerifyTicket() {
  const invalidate = useInvalidateTickets();
  return useMutation({
    mutationFn: (variables: VerifyVariables) => verifyTicket(variables.ticketId, variables.input),
    onSuccess: (_data, variables) => {
      invalidate(variables.ticketId);
    }
  });
}

export function useRespondTicket() {
  const invalidate = useInvalidateTickets();
  return useMutation({
    mutationFn: (variables: RespondVariables) => respondTicket(variables.ticketId, variables.input),
    onSuccess: (_data, variables) => {
      invalidate(variables.ticketId);
    }
  });
}

export function useCloseTicket() {
  const invalidate = useInvalidateTickets();
  return useMutation({
    mutationFn: (variables: CloseVariables) => closeTicket(variables.ticketId, variables.input),
    onSuccess: (_data, variables) => {
      invalidate(variables.ticketId);
    }
  });
}