import * as React from 'react';
import {cn} from '@/utils/cn.ts';
import {X} from 'lucide-react';

interface DialogContextValue {
    onClose: () => void;
}

const DialogContext = React.createContext<DialogContextValue | null>(null);

function useDialog() {
    const context = React.useContext(DialogContext);
    if (!context) throw new Error('Dialog components must be used within a Dialog');
    return context;
}

export interface DialogProps {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    className?: string;
}

export function Dialog({open, onClose, children, size = 'md', className}: DialogProps) {
    React.useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
        }

        if (open) {
            document.addEventListener('keydown', handleKeyDown);

            // Measure the scrollbar width *before* hiding it so we can compensate.
            // window.innerWidth includes the scrollbar; clientWidth excludes it.
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

            // Lock the viewport scroll. `html { height: 100% }` (index.css) means
            // the true scroll container is <html>, not <body> — so we must target
            // documentElement, not just body, for the lock to take effect.
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';

            // Compensate for the now-hidden scrollbar so the layout doesn't shift.
            if (scrollbarWidth > 0) {
                document.body.style.paddingRight = `${scrollbarWidth}px`;
            }
        } else {
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
        };
    }, [open, onClose]);

    if (!open) return null;

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-[calc(100vw-10rem)] h-[calc(100vh-10rem)]',
    };

    return (
        <DialogContext.Provider value={{onClose}}>
            {/* Overlay */}
            <div
                className="fixed inset-0 z-50 bg-[#00000080] backdrop-blur-sm transition-opacity"
                aria-hidden="true"
                onClick={onClose}
            />

            {/* Container */}
            <div
                className="fixed inset-x-0  bottom-0 top-15 z-50 flex items-center justify-center p-4 pointer-events-none">
                <div
                    role="dialog"
                    aria-modal="true"
                    className={cn(
                        'flex flex-col w-full bg-admin-panel border border-admin-border rounded-xl shadow-2xl pointer-events-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200 max-h-[calc(100vh-6rem)]',
                        sizes[size],
                        className
                    )}
                    onClick={(e) => e.stopPropagation()}
                >
                    {children}
                </div>
            </div>
        </DialogContext.Provider>
    );
}

export function DialogHeader({
                                 title,
                                 description,
                                 className,
                             }: {
    title: React.ReactNode;
    description?: React.ReactNode;
    className?: string;
}) {
    const {onClose} = useDialog();

    return (
        <div className={cn('flex flex-col space-y-1.5 p-6 border-b border-admin-border relative', className)}>
            <div className="text-lg font-semibold leading-none tracking-tight text-admin-text pr-8">
                {title}
            </div>
            {description && (
                <div className="text-sm text-admin-text-muted">
                    {description}
                </div>
            )}
            <button
                type="button"
                onClick={onClose}
                className="absolute right-4 top-4 rounded-md p-2 opacity-70 transition-opacity hover:opacity-100 hover:bg-admin-sidebar-hover text-admin-text focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 focus:ring-offset-admin-panel"
            >
                <span className="sr-only">Close</span>
                <X className="h-4 w-4"/>
            </button>
        </div>
    );
}

export function DialogContent({className, children}: { className?: string; children: React.ReactNode }) {
    return (
        // overscroll-contain stops scroll events from propagating to the page
        // when the user reaches the top or bottom of the dialog content.
        <div className={cn('p-6 overflow-y-auto flex-1 min-h-0 overscroll-contain', className)}>
            {children}
        </div>
    );
}

export function DialogFooter({className, children}: { className?: string; children: React.ReactNode }) {
    return (
        <div
            className={cn('flex items-center justify-end space-x-2 p-6 border-t border-admin-border bg-admin-sidebar-bg', className)}>
            {children}
        </div>
    );
}
