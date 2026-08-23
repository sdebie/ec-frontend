import { X } from 'lucide-react'
import { Dialog, DialogContent } from '@/shared/ui/components/dialog/Dialog'
import { ForgotPasswordForm } from './ForgotPasswordForm'

export interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
  onBackToLogin: () => void
}

export function ForgotPasswordModal({ isOpen, onClose, onBackToLogin }: ForgotPasswordModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="max-w-xl" aria-label="Reset your password">
      <DialogContent className="relative p-8">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-(--sf-muted-text) hover:text-(--sf-text)"
        >
          <X className="h-5 w-5" />
        </button>

        <ForgotPasswordForm onBackToLogin={onBackToLogin} />
      </DialogContent>
    </Dialog>
  )
}
