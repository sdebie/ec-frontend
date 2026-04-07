import { create } from 'zustand';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export type ToastOptions = {
    title?: string;
    /**
     * Auto-dismiss duration in ms.
     * Pass 0 to keep the toast until manually dismissed.
     * Defaults: success/info → 4 000 ms, warning → 6 000 ms, error → 0 (persistent).
     */
    duration?: number;
};

export interface ToastItem {
    id: string;
    variant: ToastVariant;
    title?: string;
    message: string;
    duration: number;
}

interface ToastStore {
    toasts: ToastItem[];
    add: (toast: Omit<ToastItem, 'id'>) => string | null;
    remove: (id: string) => void;
}

const DEFAULT_DURATIONS: Record<ToastVariant, number> = {
    success: 4000,
    info: 4500,
    warning: 6000,
    error: 0,
};

const MAX_VISIBLE = 5;

export const useToastStore = create<ToastStore>((set, get) => ({
    toasts: [],

    add: (incoming) => {
        // Deduplicate: skip if the exact same variant+message is already visible
        const isDuplicate = get().toasts.some(
            (t) => t.variant === incoming.variant && t.message === incoming.message,
        );
        if (isDuplicate) return null;

        const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

        set((state) => ({
            toasts: [
                // Keep only the last (MAX_VISIBLE - 1) so the new one makes MAX_VISIBLE total
                ...state.toasts.slice(-(MAX_VISIBLE - 1)),
                { ...incoming, id },
            ],
        }));

        return id;
    },

    remove: (id) =>
        set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

// ─── Imperative API ────────────────────────────────────────────────────────────
// Usable anywhere — inside React components, hooks, or plain JS modules.

function addToast(variant: ToastVariant, message: string, options?: ToastOptions) {
    return useToastStore.getState().add({
        variant,
        message,
        title: options?.title,
        duration: options?.duration ?? DEFAULT_DURATIONS[variant],
    });
}

export const toast = {
    success: (message: string, options?: ToastOptions) => addToast('success', message, options),
    error:   (message: string, options?: ToastOptions) => addToast('error',   message, options),
    warning: (message: string, options?: ToastOptions) => addToast('warning', message, options),
    info:    (message: string, options?: ToastOptions) => addToast('info',    message, options),
};

