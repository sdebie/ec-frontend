import { useState } from 'react'
import { toast } from '@/shared/ui/components/toast'
import { useStoreSettings } from '@/admin/hooks/settings/useStoreSettings'
import { useUpdateSetting } from '@/admin/hooks/settings/useUpdateSetting'
import type { StoreSetting } from '@/admin/hooks/settings/types'
import { Input } from '@/shared/ui/primitives'

interface AnnouncementFormValues {
  enabled: boolean
  text: string
  backgroundColor: string
  textColor: string
}

const SETTING_KEY = 'storefront.header'

const DEFAULT_VALUES: AnnouncementFormValues = {
  enabled: false,
  text: '',
  backgroundColor: '#1a1f35',
  textColor: '#ffffff',
}

function parseHeaderSetting(settings: StoreSetting[]): AnnouncementFormValues {
  const row = settings.find((s) => s.key === SETTING_KEY)
  if (!row) return DEFAULT_VALUES

  try {
    const parsed = JSON.parse(row.value)
    const ann = parsed?.announcement
    if (!ann) return DEFAULT_VALUES

    return {
      enabled: ann.enabled ?? false,
      text: ann.text ?? '',
      backgroundColor: ann.backgroundColor || '#1a1f35',
      textColor: ann.textColor || '#ffffff',
    }
  } catch {
    return DEFAULT_VALUES
  }
}

export function AnnouncementEditorPage() {
  const { data: settings, isLoading, isError } = useStoreSettings()
  const updateSetting = useUpdateSetting()

  const initialValues = settings ? parseHeaderSetting(settings) : DEFAULT_VALUES

  const [form, setForm] = useState<AnnouncementFormValues>(DEFAULT_VALUES)
  const [initialized, setInitialized] = useState(false)

  if (settings && !initialized) {
    setForm(initialValues)
    setInitialized(true)
  }

  function handleSave() {
    const payload = JSON.stringify({
      announcement: {
        enabled: form.enabled,
        text: form.text,
        backgroundColor: form.backgroundColor,
        textColor: form.textColor,
      },
    })
    updateSetting.mutate(
      { key: SETTING_KEY, value: payload },
      { onSuccess: () => toast.success('Announcement settings saved') },
    )
  }

  if (isLoading) {
    return <div className="p-8 text-sm text-(--c-text-muted)">Loading announcement settings…</div>
  }

  if (isError) {
    return <div className="p-8 text-sm text-(--c-status-red-text)">Failed to load settings. Please try again.</div>
  }

  return (
    <div className="max-w-2xl space-y-8 p-8">
      <div>
        <h1 className="text-2xl font-semibold">Announcement Banner</h1>
        <p className="mt-1 text-sm text-(--c-text-muted)">
          Configure the announcement banner displayed above the storefront header.
        </p>
      </div>

      {/* Live Preview */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-(--c-text)">Preview</label>
        <div
          style={{
            backgroundColor: form.backgroundColor,
            color: form.textColor,
          }}
          className="w-full rounded py-2 px-4 text-center text-sm"
        >
          {form.text || 'Preview text will appear here'}
        </div>
      </div>

      {/* Enable/Disable Toggle */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          role="switch"
          aria-checked={form.enabled}
          onClick={() => setForm((prev) => ({ ...prev, enabled: !prev.enabled }))}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ${
            form.enabled ? 'bg-(--c-accent)' : 'bg-(--c-surface-hover)'
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-(--c-panel) shadow ring-0 transition-transform duration-200 ${
              form.enabled ? 'translate-x-5' : 'translate-x-0'
            }`}
          />
        </button>
        <span className="text-sm font-medium text-(--c-text)">
          {form.enabled ? 'Enabled' : 'Disabled'}
        </span>
      </div>

      {/* Text Input */}
      <div className="space-y-1">
        <label htmlFor="announcement-text" className="text-sm font-medium text-(--c-text)">
          Announcement Text
        </label>
        <Input
          id="announcement-text"
          type="text"
          value={form.text}
          onChange={(e) => setForm((prev) => ({ ...prev, text: e.target.value }))}
          placeholder="e.g. Free shipping on orders over R500!"
        />
      </div>

      {/* Colour Pickers */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label htmlFor="bg-color" className="text-sm font-medium text-(--c-text)">
            Background Colour
          </label>
          <div className="flex items-center gap-2">
            <input
              id="bg-color"
              type="color"
              value={form.backgroundColor}
              onChange={(e) => setForm((prev) => ({ ...prev, backgroundColor: e.target.value }))}
              className="h-9 w-9 cursor-pointer rounded border border-(--c-border)"
            />
            <span className="text-sm text-(--c-text-muted)">{form.backgroundColor}</span>
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="text-color" className="text-sm font-medium text-(--c-text)">
            Text Colour
          </label>
          <div className="flex items-center gap-2">
            <input
              id="text-color"
              type="color"
              value={form.textColor}
              onChange={(e) => setForm((prev) => ({ ...prev, textColor: e.target.value }))}
              className="h-9 w-9 cursor-pointer rounded border border-(--c-border)"
            />
            <span className="text-sm text-(--c-text-muted)">{form.textColor}</span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div>
        <button
          type="button"
          onClick={handleSave}
          disabled={updateSetting.isPending}
          className="rounded bg-(--c-accent) px-4 py-2 text-sm font-medium text-(--c-accent-text) hover:bg-(--c-accent-hover) disabled:opacity-50"
        >
          {updateSetting.isPending ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}
