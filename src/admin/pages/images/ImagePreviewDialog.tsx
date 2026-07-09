import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@/shared/ui/components'
import { Button } from '@/shared/ui/primitives'
import { resolveImageUrl } from '@/shared/utils/imageUrl'

interface ImagePreviewDialogProps {
  open: boolean
  onClose: () => void
  filename: string | null
}

export function ImagePreviewDialog({ open, onClose, filename }: ImagePreviewDialogProps) {
  if (!filename) return null

  return (
    <Dialog open={open} onClose={onClose} size="full">
      <DialogHeader title="Image Preview" />

      <DialogContent>
        <div className="flex flex-col items-center gap-4">
          <img
            src={resolveImageUrl(filename) ?? ''}
            alt={filename}
            className="max-h-[75vh] w-auto max-w-full object-contain"
          />
          <p className="text-sm text-(--c-text-muted) break-all text-center">{filename}</p>
        </div>
      </DialogContent>

      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
