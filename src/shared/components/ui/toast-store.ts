import { create } from "zustand";
import { newId } from "@/shared/lib/id";

export const TOAST_DURATION_MS = 4000;

export type ToastTone = "netral" | "bata";

export interface ToastAction {
  readonly label: string;
  readonly onClick: () => void;
}

export interface ToastMessage {
  readonly id: string;
  readonly message: string;
  readonly tone: ToastTone;
  readonly action?: ToastAction;
}

export interface ShowToastInput {
  readonly message: string;
  readonly tone?: ToastTone;
  readonly action?: ToastAction;
}

interface ToastState {
  readonly current: ToastMessage | null;
  readonly show: (input: ShowToastInput) => void;
  readonly dismiss: () => void;
}

let dismissTimer: ReturnType<typeof setTimeout> | null = null;

function clearDismissTimer(): void {
  if (dismissTimer === null) return;
  clearTimeout(dismissTimer);
  dismissTimer = null;
}

export const useToastStore = create<ToastState>()((set) => ({
  current: null,
  show: (input) => {
    clearDismissTimer();
    set({
      current: {
        id: newId(),
        message: input.message,
        tone: input.tone ?? "netral",
        action: input.action
      }
    });
    dismissTimer = setTimeout(() => {
      dismissTimer = null;
      set({ current: null });
    }, TOAST_DURATION_MS);
  },
  dismiss: () => {
    clearDismissTimer();
    set({ current: null });
  }
}));