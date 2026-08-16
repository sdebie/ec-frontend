import { useState } from 'react'
import { Pencil } from 'lucide-react'

import { PageLoadingSpinner } from '@/shared/ui/components'
import { useCan } from '@/shared/auth/adminPermissions'
import { useStoreSettings } from '@/admin/hooks/settings'
import type { StoreSetting } from '@/admin/hooks/settings'
import { StoreSettingEditDialog } from './StoreSettingEditDialog'

export function StoreSettingsPage() {
  const canMutate = useCan('settings:write')

  const { data: settings, isLoading, isError, refetch } = useStoreSettings()

  const [editingSetting, setEditingSetting] = useState<StoreSetting | null>(null)

  const handleEdit = (setting: StoreSetting) => {
    setEditingSetting(setting)
  }

  const handleClose = () => {
    setEditingSetting(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-(--c-text)">Store Settings</h1>
      </div>

      {isError && (
        <div className="flex flex-col items-center justify-center py-16 text-(--c-text-muted)">
          <p className="text-sm">Failed to load. <button onClick={() => refetch()}>Retry</button></p>
        </div>
      )}

      {isLoading && <PageLoadingSpinner />}

      {!isError && !isLoading && settings && (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-(--c-border)">
              <th className="text-left py-3 px-4 font-medium text-(--c-text-muted)">Key</th>
              <th className="text-left py-3 px-4 font-medium text-(--c-text-muted)">Value</th>
              <th className="text-left py-3 px-4 font-medium text-(--c-text-muted)">Description</th>
              {canMutate && <th className="w-12"></th>}
            </tr>
          </thead>
          <tbody>
            {settings.map((setting) => (
              <tr key={setting.key} className="border-b border-(--c-border)">
                <td className="py-3 px-4 font-mono text-xs text-(--c-text)">{setting.key}</td>
                <td className="py-3 px-4 text-(--c-text)">{setting.value}</td>
                <td className="py-3 px-4 text-(--c-text-muted)">{setting.description ?? '—'}</td>
                {canMutate && (
                  <td className="py-3 px-4">
                    <button onClick={() => handleEdit(setting)}>
                      <Pencil className="h-4 w-4 text-(--c-text-muted) hover:text-(--c-text)" />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <StoreSettingEditDialog
        open={editingSetting !== null}
        setting={editingSetting}
        onClose={handleClose}
      />
    </div>
  )
}
