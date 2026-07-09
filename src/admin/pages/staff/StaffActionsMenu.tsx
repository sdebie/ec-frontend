import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { EllipsisVertical } from 'lucide-react'

import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import { DropdownMenu, DropdownItem, ConfirmationDialog } from '@/shared/ui/components'
import { useUpdateStaff } from '@/admin/hooks/staff'
import type { StaffMember } from '@/admin/hooks/staff'

export interface StaffActionsMenuProps {
  staff: StaffMember
}

export function StaffActionsMenu({ staff }: StaffActionsMenuProps) {
  const navigate = useNavigate()
  const userId = useAdminAuthStore((s) => s.userId)
  const { mutate: updateStaff, isPending } = useUpdateStaff()
  const [deactivateOpen, setDeactivateOpen] = useState(false)

  const isSelf = userId === staff.id

  function buildDto(isActive: boolean) {
    return {
      email: staff.email,
      fullName: staff.fullName ?? '',
      role: staff.role,
      isActive,
      resetPassword: false,
    }
  }

  function handleDeactivate() {
    updateStaff(
      { id: staff.id, staffDto: buildDto(false) },
      { onSuccess: () => setDeactivateOpen(false) }
    )
  }

  function handleActivate() {
    updateStaff({ id: staff.id, staffDto: buildDto(true) })
  }

  return (
    <div data-testid="staff-actions-menu">
      <DropdownMenu
        trigger={
          <span className="inline-flex items-center justify-center p-1 rounded-lg hover:bg-(--c-surface-hover)">
            <EllipsisVertical className="h-5 w-5 text-(--c-text-muted)" />
          </span>
        }
      >
        <DropdownItem onClick={() => navigate(`/admin/staff/${staff.id}/edit`)}>
          Edit
        </DropdownItem>

        {!isSelf && staff.active && (
          <DropdownItem onClick={() => setDeactivateOpen(true)} destructive>
            Deactivate
          </DropdownItem>
        )}

        {!isSelf && !staff.active && (
          <DropdownItem onClick={handleActivate}>
            Activate
          </DropdownItem>
        )}
      </DropdownMenu>

      <ConfirmationDialog
        open={deactivateOpen}
        onClose={() => setDeactivateOpen(false)}
        onConfirm={handleDeactivate}
        title="Deactivate staff member"
        description={`Are you sure you want to deactivate ${staff.fullName ?? staff.email}? They will no longer be able to sign in.`}
        confirmLabel="Deactivate"
        variant="danger"
        isLoading={isPending}
      />
    </div>
  )
}
