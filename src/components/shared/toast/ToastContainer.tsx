import {createPortal} from 'react-dom';
import {cn} from '@/utils/cn';
import type {ToastSlideFrom} from './Toast';
import {Toast} from './Toast';
import {type ToastPosition, useToastStore} from './toastStore';

// ─── Position → CSS classes ────────────────────────────────────────────────────

/**
 * Fixed-position classes for each toast stack location.
 * Centre positions use `left-1/2 -translate-x-1/2` so the stack is always
 * pixel-perfect centred regardless of viewport width.
 */
const POSITION_CLASSES: Record<ToastPosition, string> = {
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
};

/**
 * Slide direction for each position — top positions slide in from above,
 * bottom positions from below, left/right edges from their respective side.
 */
const SLIDE_FROM: Record<ToastPosition, ToastSlideFrom> = {
    'top-left': 'top',
    'top-center': 'top',
    'top-right': 'top',
    'bottom-left': 'bottom',
    'bottom-center': 'bottom',
    'bottom-right': 'bottom',
};

// ─── Component ─────────────────────────────────────────────────────────────────

type ToastContainerProps = {
    /**
     * Where the toast stack appears on screen.
     *
     * @default 'bottom-center'
     *
     * @example
     * // Storefront default (bottom-centre)
     * <ToastContainer />
     *
     * // Admin portal override
     * <ToastContainer position="top-right" />
     */
    position?: ToastPosition;
};

/**
 * Renders all active toasts in a fixed portal.
 * Mount once at the app root. Override `position` to reposition the stack.
 *
 * Stack ordering:
 *  - top-* positions: newest toast appears at the top of the stack.
 *  - bottom-* positions: newest toast appears at the bottom of the stack.
 */
export function ToastContainer({position = 'top-center'}: ToastContainerProps) {
    const toasts = useToastStore((s) => s.toasts);
    const slideFrom = SLIDE_FROM[position];

    // Top positions render newest-first so the latest toast is closest to the edge.
    // Bottom positions keep insertion order so the latest toast is nearest the bottom.
    const displayToasts = position.startsWith('top') ? [...toasts].reverse() : toasts;

    return createPortal(
        <div
            className={cn(
                'fixed z-[9999] flex flex-col gap-2 pointer-events-none',
                POSITION_CLASSES[position],
            )}
            aria-label="Notifications"
            aria-relevant="additions"
            aria-live="polite"
        >
            {displayToasts.map((item) => (
                <div key={item.id} className="pointer-events-auto">
                    <Toast {...item} slideFrom={slideFrom}/>
                </div>
            ))}
        </div>,
        document.body,
    );
}
