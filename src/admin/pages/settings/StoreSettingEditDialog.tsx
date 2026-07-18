import * as React from 'react'
import { Dialog, DialogHeader, DialogContent, DialogFooter } from '@/shared/ui/components'
import { Button, Input } from '@/shared/ui/primitives'
import { useUpdateSetting } from '@/admin/hooks/settings/useUpdateSetting'
import type { StoreSetting } from '@/admin/hooks/settings/types'

export interface StoreSettingEditDialogProps {
  open: boolean
  setting: StoreSetting | null
  onClose: () => void
}

function validateVatRate(value: string): string | null {
  const num = Number(value)
  if (isNaN(num) || num < 0 || num > 1) {
    return 'Value must be a decimal number between 0 and 1'
  }
  return null
}

export function StoreSettingEditDialog({ open, setting, onClose }: StoreSettingEditDialogProps) {
  if (!setting) return null

  // A keyed editor gives each open/setting pair a fresh form state. It replaces
  // the effect that copied props into state after render.
  return (
    <StoreSettingEditDialogForm
      key={`${setting.key}:${open ? 'open' : 'closed'}`}
      open={open}
      setting={setting}
      onClose={onClose}
    />
  )
}

interface StoreSettingEditDialogFormProps {
  open: boolean
  setting: StoreSetting
  onClose: () => void
}

function StoreSettingEditDialogForm({ open, setting, onClose }: StoreSettingEditDialogFormProps) {
  const [value, setValue] = React.useState(setting.value)
  const [error, setError] = React.useState<string | null>(null)
  const mutation = useUpdateSetting()

  const handleSave = () => {
    if (setting.key === 'vat_rate_percent') {
      const validationError = validateVatRate(value)
      if (validationError) {
        setError(validationError)
        return
      }
    }

    setError(null)
    mutation.mutate(
      { key: setting.key, value },
      {
        onSuccess: () => {
          onClose()
        },
      }
    )
  }

  const isTextarea = setting.key === 'payment_methods_allowed'

  return (
    <Dialog open={open} onClose={onClose} size="sm">
      <DialogHeader title={`Edit: ${setting.key}`} />
      <DialogContent>
        <div className="space-y-2">
          <label className="text-sm font-medium text-(--c-text)">Value</label>
          {isTextarea ? (
            <textarea
              className="w-full rounded-(--c-radius) border border-(--c-border) bg-(--c-panel) text-(--c-text) px-4 py-2 font-mono text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--c-ring) focus-visible:ring-offset-1 focus-visible:ring-offset-(--c-bg) min-h-32 resize-y"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          ) : (
            <Input
              value={value}
              onChange={(e) => {
                setValue(e.target.value)
                if (setting.key === 'vat_rate_percent') {
                  setError(validateVatRate(e.target.value))
                }
              }}
              variant={error ? 'error' : 'default'}
            />
          )}
          {error && (
            <p className="text-xs text-(--c-error)">{error}</p>
          )}
        </div>
      </DialogContent>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          variant="solid"
          disabled={mutation.isPending || !!error}
          onClick={handleSave}
        >
          Save
        </Button>
      </DialogFooter>
    </Dialog>
  )
}
