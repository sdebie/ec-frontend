import { X } from 'lucide-react'
import { Dialog, DialogContent } from '@/shared/ui/components/dialog/Dialog'
import { CustomerLoginForm } from './CustomerLoginForm'

export interface CustomerLoginModalProps {
  isOpen: boolean
  onClose: () => void
  onForgotPassword: () => void
}

export function CustomerLoginModal({ isOpen, onClose, onForgotPassword }: CustomerLoginModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="max-w-xl" aria-label="Sign in">
      <DialogContent className="relative p-8">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 text-(--sf-muted-text) hover:text-(--sf-text)"
        >
          <X className="h-5 w-5" />
        </button>

        <CustomerLoginForm onSuccess={onClose} onForgotPassword={onForgotPassword} />
      </DialogContent>
    </Dialog>
  )
}
