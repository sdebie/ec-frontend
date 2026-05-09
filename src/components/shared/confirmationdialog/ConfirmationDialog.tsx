import { AlertTriangle, CheckCircle2, HelpCircle, Info, XCircle } from 'lucide-react';
import * as React from 'react';

import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@/components/shared/dialog';
import { Button } from '@/primitives/button';
import { cn } from '@/utils/cn';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ConfirmationDialogVariant = 'default' | 'error' | 'warning' | 'info' | 'success';

export interface ConfirmationDialogProps {
    /** Controls dialog visibility. */
    open: boolean;
    /** Called when the dialog requests to close (ESC, overlay click, cancel button, or ✕). */
    onClose: () => void;
    /** Called when the primary confirm action is triggered. */
    onConfirm: () => void;
    /** Dialog heading. Accepts a plain string or any React node. */
    title: React.ReactNode;
    /** Body copy / description rendered below the heading. */
    message?: React.ReactNode;
    /**
     * Label for the confirm button.
     * @default 'Confirm'
     */
    confirmText?: string;
    /**
     * Label for the cancel button.
     * @default 'Cancel'
     */
    cancelText?: string;
    /**
     * Visual variant — drives the icon colour and confirm-button styling.
     * @default 'default'
     */
    variant?: ConfirmationDialogVariant;
    /**
     * Override the leading icon.
     * - Omit (or `undefined`) → the variant's default icon is used.
     * - Pass `null` → no icon is rendered.
     * - Pass a `ReactNode` → that node is used as the icon.
     */
    icon?: React.ReactNode | null;
    /**
     * Puts the confirm button into a loading/spinner state and disables it.
     * @default false
     */
    loading?: boolean;
    /**
     * Hides the cancel button.
     * Useful for acknowledgement / notification-only dialogs.
     * @default false
     */
    hideCancelButton?: boolean;
    /**
     * Forwarded to the underlying `Dialog` `size` prop.
     * @default 'sm'
     */
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
}

// ─── Variant configuration ────────────────────────────────────────────────────

type VariantConfig = {
    /** Lucide icon used when no `icon` override is supplied. */
    DefaultIcon: React.ElementType;
    /** Tailwind colour class applied to the default icon. */
    iconClass: string;
    /** Background class for the small circular icon badge. */
    badgeClass: string;
    /**
     * Extra Tailwind classes forwarded to the confirm `Button`.
     * Empty string → button inherits the standard `solid` (primary) style.
     */
    confirmClass: string;
};

const VARIANT_CONFIG: Record<ConfirmationDialogVariant, VariantConfig> = {
    default: {
        DefaultIcon: HelpCircle,
        iconClass: 'text-primary',
        badgeClass: 'bg-primary-subtle',
        confirmClass: '',
    },
    error: {
        DefaultIcon: XCircle,
        iconClass: 'text-red-500',
        badgeClass: 'bg-red-500/10',
        confirmClass: 'bg-red-500 hover:bg-rose-600 focus:ring-rose-600',
    },
    warning: {
        DefaultIcon: AlertTriangle,
        iconClass: 'text-amber-500',
        badgeClass: 'bg-amber-500/10',
        confirmClass: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-500',
    },
    info: {
        DefaultIcon: Info,
        iconClass: 'text-blue-500',
        badgeClass: 'bg-blue-500/10',
        confirmClass: '',
    },
    success: {
        DefaultIcon: CheckCircle2,
        iconClass: 'text-emerald-500',
        badgeClass: 'bg-emerald-500/10',
        confirmClass: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
    },
};

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * `ConfirmationDialog` is a reusable confirm / notification modal built on top
 * of the existing `Dialog` primitive. It supports five visual variants
 * (default, destructive, warning, info, success), an optional leading icon, a
 * loading state for the confirm action, and an acknowledge-only mode that hides
 * the cancel button.
 *
 * It inherits all admin-portal styling (tokens, spacing, typography, radius,
 * shadows, dark/light behaviour) from the underlying `Dialog` components and
 * introduces no new design primitives.
 *
 * @example – Delete confirmation
 * ```tsx
 * <ConfirmationDialog
 *   open={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onConfirm={handleDelete}
 *   title="Delete Brand"
 *   message={`Are you sure you want to delete "${name}"? This action cannot be undone.`}
 *   confirmText="Delete"
 *   cancelText="Cancel"
 *   variant="destructive"
 *   loading={isDeleting}
 * />
 * ```
 *
 * @example – Notification / acknowledgement
 * ```tsx
 * <ConfirmationDialog
 *   open={saved}
 *   onClose={() => setSaved(false)}
 *   onConfirm={() => setSaved(false)}
 *   title="Changes Saved"
 *   message="Your changes have been saved successfully."
 *   confirmText="OK"
 *   variant="success"
 *   hideCancelButton
 * />
 * ```
 */
export function ConfirmationDialog({
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'default',
    icon,
    loading = false,
    hideCancelButton = false,
    size = 'sm',
}: ConfirmationDialogProps) {
    const { DefaultIcon, iconClass, badgeClass, confirmClass } = VARIANT_CONFIG[variant];

    // Resolve the icon to render:
    //   icon === null      → no icon
    //   icon === undefined → use the variant's default icon
    //   icon === <node>    → render the caller-supplied node
    const resolvedIcon: React.ReactNode | null =
        icon === null
            ? null
            : icon !== undefined
              ? icon
              : <DefaultIcon className={cn('h-5 w-5', iconClass)} aria-hidden="true" />;

    return (
        <Dialog open={open} onClose={onClose} size={size}>
            {/*
             * border-b-0  — removes the heavy divider line under the title
             * pb-3        — replaces the visual separation with tighter spacing
             */}
            <DialogHeader title={title} className="border-b-0 pb-3" />

            {/*
             * pt-2 pb-3   — collapses the excessive double-padding gap that
             *               stacks when two p-6 blocks sit adjacent
             */}
            <DialogContent className="pt-2 pb-3">
                <div className="flex items-start gap-4">
                    {/* Icon badge — mt-0.5 nudges it into optical alignment with the first text line */}
                    {resolvedIcon != null && (
                        <div
                            className={cn(
                                'flex shrink-0 items-center justify-center w-10 h-10 rounded-full mt-0.5',
                                badgeClass,
                            )}
                            aria-hidden="true"
                        >
                            {resolvedIcon}
                        </div>
                    )}

                    {/* Body copy */}
                    {message != null && (
                        <p className="text-sm text-admin-text-muted leading-relaxed self-center">
                            {message}
                        </p>
                    )}
                </div>
            </DialogContent>

            {/*
             * border-t-0   — removes the divider line above the button row
             * bg-transparent — drops the two-tone panel effect (sidebar bg vs panel bg)
             * pt-2 pb-5    — keeps comfortable breathing room without the border
             * space-x-3    — slightly more generous gap between Cancel and confirm
             */}
            <DialogFooter className="border-t-0 bg-transparent pt-2 pb-5 space-x-3">
                {!hideCancelButton && (
                    <Button variant="ghost" onClick={onClose} disabled={loading}>
                        {cancelText}
                    </Button>
                )}
                <Button
                    variant="solid"
                    onClick={onConfirm}
                    loading={loading}
                    className={confirmClass}
                >
                    {confirmText}
                </Button>
            </DialogFooter>
        </Dialog>
    );
}

