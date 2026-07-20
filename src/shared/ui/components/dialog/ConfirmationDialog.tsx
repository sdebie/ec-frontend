import { AlertTriangle, HelpCircle } from 'lucide-react'
import * as React from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader } from './Dialog'
import { Button } from '@/shared/ui/primitives'
import { cn } from '@/shared/utils/cn'

export interface ConfirmationDialogProps {
  /** Controls dialog visibility. */
  open: boolean
  /** Called when the dialog requests to close (ESC, overlay click, cancel button, or ✕). */
  onClose: () => void
  /** Called when the primary confirm action is triggered. */
  onConfirm: () => void
  /** Dialog heading. */
  title: string
  /** Body copy / description rendered below the heading. */
  description?: string
  /**
   * Label for the confirm button.
   * @default 'Confirm'
   */
  confirmLabel?: string
  /**
   * Label for the cancel button.
   * @default 'Cancel'
   */
  cancelLabel?: string
  /**
   * Visual variant — drives the icon colour and confirm-button styling.
   * `danger` uses destructive red styling.
   * @default 'default'
   */
  variant?: 'danger' | 'default'
  /**
   * Puts the confirm button into a loading/spinner state and disables it.
   * @default false
   */
  isLoading?: boolean
}

type VariantConfig = {
  DefaultIcon: React.ElementType
  iconClass: string
  badgeClass: string
  confirmClass: string
}

const VARIANT_CONFIG: Record<NonNullable<ConfirmationDialogProps['variant']>, VariantConfig> = {
  default: {
    DefaultIcon: HelpCircle,
    iconClass: 'text-(--c-accent)',
    badgeClass: 'bg-(--c-accent)/10',
    confirmClass: '',
  },
  danger: {
    DefaultIcon: AlertTriangle,
    iconClass: 'text-[var(--c-danger,#ef4444)]',
    badgeClass: 'bg-[var(--c-danger,#ef4444)]/10',
    confirmClass:
      'bg-[var(--c-danger,#ef4444)] hover:bg-[var(--c-danger-hover,#dc2626)] text-[var(--c-danger-text,#fff)] focus-visible:ring-[var(--c-danger,#ef4444)]',
  },
}

export function ConfirmationDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  isLoading = false,
}: ConfirmationDialogProps) {
  const { DefaultIcon, iconClass, badgeClass, confirmClass } = VARIANT_CONFIG[variant]

  return (
    <Dialog open={open} onClose={onClose} size="sm">
      <DialogHeader title={title} className="border-b-0 pb-3" />

      <DialogContent className="pt-2 pb-3">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              'flex shrink-0 items-center justify-center w-10 h-10 rounded-full mt-0.5',
              badgeClass
            )}
            aria-hidden="true"
          >
            <DefaultIcon className={cn('h-5 w-5', iconClass)} aria-hidden="true" />
          </div>

          {description != null && (
            <p className="text-sm text-(--c-text-muted) leading-relaxed self-center">
              {description}
            </p>
          )}
        </div>
      </DialogContent>

      <DialogFooter className="border-t-0 bg-transparent pt-2 pb-5 space-x-3">
        <Button variant="ghost" onClick={onClose} disabled={isLoading}>
          {cancelLabel}
        </Button>
        <Button
          variant="solid"
          onClick={onConfirm}
          isLoading={isLoading}
          className={confirmClass}
        >
          {confirmLabel}
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
