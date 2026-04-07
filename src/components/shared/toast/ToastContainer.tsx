import { createPortal } from 'react-dom';
import { useToastStore } from './toastStore';
import { Toast } from './Toast';

/**
 * Renders all active toasts in a fixed top-right portal.
 * Mount this once at the root of the admin portal (e.g. in App.tsx).
 */
export function ToastContainer() {
    const toasts = useToastStore((s) => s.toasts);

    return createPortal(
        <div
            className="fixed top-4 right-4 z-9999 flex flex-col gap-2 pointer-events-none"
            aria-label="Notifications"
            aria-relevant="additions"
            aria-live="polite"
        >
            {toasts.map((item) => (
                <div key={item.id} className="pointer-events-auto">
                    <Toast {...item} />
                </div>
            ))}
        </div>,
        document.body,
    );
}

