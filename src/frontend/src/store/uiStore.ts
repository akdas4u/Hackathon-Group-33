import { create } from 'zustand';

export type ToastVariant = 'info' | 'success' | 'error';

export interface Toast {
  readonly id: string;
  readonly message: string;
  readonly variant: ToastVariant;
}

export interface UiState {
  readonly isLoading: boolean;
  readonly errorMessage: string | null;
  readonly toasts: readonly Toast[];
  readonly setLoading: (isLoading: boolean) => void;
  readonly setError: (message: string | null) => void;
  readonly pushToast: (message: string, variant?: ToastVariant) => void;
  readonly dismissToast: (id: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  isLoading: false,
  errorMessage: null,
  toasts: [],

  setLoading: (isLoading: boolean) => set({ isLoading }),

  setError: (message: string | null) => set({ errorMessage: message }),

  pushToast: (message: string, variant: ToastVariant = 'info') =>
    set((state) => ({
      toasts: [
        ...state.toasts,
        { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, message, variant },
      ],
    })),

  dismissToast: (id: string) =>
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) })),
}));
