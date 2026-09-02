import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'

import { PageLayout, toast } from '@/shared/ui/components'
import { useBreadcrumb } from '@/admin/context/BreadcrumbContext'
import { Button } from '@/shared/ui/primitives'
import { useCan } from '@/shared/auth/adminPermissions'
import { useSageImport } from '@/admin/hooks/imports/useSageImport'
import { AlertCircle } from 'lucide-react'

export default function SagePriceImportPage() {
  const navigate = useNavigate()
  const { mutateAsync, isPending } = useSageImport()
  const [isConfirming, setIsConfirming] = useState(false)

  const canMutate = useCan('import:manage')

  useBreadcrumb([
    { label: 'Home', href: '/admin' },
    { label: 'Bulk Imports', href: '/admin/imports' },
    { label: 'Import from Sage' },
  ])

  if (!canMutate) return <Navigate to="/admin/imports/products/price/list" replace />

  const handleImport = async () => {
    try {
      const response = await mutateAsync()

      if (!response?.batchId) {
        toast.error('Sage import started but no batch ID was returned', { duration: 0 })
        return
      }

      toast.success('Sage import started - fetching prices from Sage API')
      navigate(`/admin/imports/products/price/bulk-upload/review/${response.batchId}`)
    } catch (err) {
      console.error(err)
      const errorMsg = err instanceof Error ? err.message : 'Failed to start Sage import'
      toast.error(errorMsg, { duration: 0 })
    }
  }

  return (
    <PageLayout title="Import Prices from Sage">
      <div className="space-y-6">
        {/* Info Banner */}
        <div className="flex gap-4 p-4 bg-(--c-bg-secondary) border border-(--c-border) rounded-lg">
          <AlertCircle className="h-5 w-5 text-(--c-text-muted) flex-shrink-0 mt-0.5" />
          <div className="space-y-2 flex-1">
            <p className="text-sm font-medium text-(--c-text)">
              This will fetch the latest prices from your Sage ERP system
            </p>
            <p className="text-xs text-(--c-text-muted)">
              Make sure your Sage API credentials are configured before proceeding.
              The import will fetch items and stage them for review before applying.
            </p>
          </div>
        </div>

        {/* Import Details */}
        <div className="space-y-4 p-4 bg-(--c-bg-secondary) rounded-lg border border-(--c-border)">
          <div>
            <h3 className="text-sm font-semibold text-(--c-text) mb-2">Import Details</h3>
            <ul className="space-y-2 text-sm text-(--c-text-muted)">
              <li className="flex items-center gap-2">
                <span className="text-lg">•</span>
                <span>Fetches all items from Sage Item/Get API</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-lg">•</span>
                <span>Extracts retail and wholesale prices</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-lg">•</span>
                <span>Stages items for review before applying</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-lg">•</span>
                <span>Supports pagination for large datasets</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          {!isConfirming ? (
            <>
              <Button
                variant="solid"
                onClick={() => setIsConfirming(true)}
                disabled={isPending}
              >
                {isPending ? 'Starting Import...' : 'Start Sage Import'}
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate('/admin/imports')}
                disabled={isPending}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <div className="text-sm text-(--c-text-muted)">
                Are you sure? This will fetch prices from Sage and stage them for review.
              </div>
              <Button
                variant="solid"
                onClick={handleImport}
                disabled={isPending}
              >
                {isPending ? 'Importing...' : 'Confirm'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsConfirming(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>
    </PageLayout>
  )
}
