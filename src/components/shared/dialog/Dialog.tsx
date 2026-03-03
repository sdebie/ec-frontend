import * as React from "react";
import {createPortal} from "react-dom";
import {clsx} from 'clsx';
import {Button} from "@/components/shared/button/Button.tsx";

type DialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title?: string;
    description?: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: "sm" | "md" | "lg";
};

const sizes = {
    sm: "max-w-md",
    md: "max-w-xl",
    lg: "max-w-3xl",
};

export function Dialog({
                           open,
                           onOpenChange,
                           title,
                           description,
                           children,
                           footer,
                           size = "md",
                       }: DialogProps) {
    React.useEffect(() => {
        function onKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") onOpenChange(false);
        }

        if (open) document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [open, onOpenChange]);

    if (!open) return null;

    return createPortal(
        <div className="fixed inset-0 z-50">
            <div
                className="absolute inset-0 bg-black/40"
                onMouseDown={() => onOpenChange(false)}
                aria-hidden="true"
            />
            <div className="absolute inset-0 flex items-center justify-center p-4">
                <div
                    role="dialog"
                    aria-modal="true"
                    className={clsx(
                        "w-full rounded-xl bg-white shadow-lg border border-slate-200",
                        sizes[size]
                    )}
                    onMouseDown={(e) => e.stopPropagation()}
                >
                    {(title || description) && (
                        <div className="px-5 pt-5">
                            {title && <h2 className="text-base font-semibold text-slate-900">{title}</h2>}
                            {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
                        </div>
                    )}
                    <div className="px-5 py-4">{children}</div>
                    <div className="px-5 pb-5 flex items-center justify-end gap-2">
                        {footer ?? (
                            <>
                                <Button variant="secondary" onClick={() => onOpenChange(false)}>
                                    Cancel
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}