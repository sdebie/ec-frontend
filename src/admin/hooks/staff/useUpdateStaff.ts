import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ClientError } from 'graphql-request'
import { toast } from '@/shared/ui/components/toast'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import { UPDATE_STAFF_USER } from './queries'
import type { StaffMember } from './types'

interface UpdateStaffPayload {
  id: string
  staffDto: {
    email: string
    fullName: string
    role: StaffMember['role']
    isActive: boolean
    resetPassword: boolean
    temporaryPassword?: string
    createdAt?: string | null
  }
}

export function useUpdateStaff() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, staffDto }: UpdateStaffPayload) => {
      const { isActive, ...rest } = staffDto
      // StaffDtoInput uses `active` (Boolean!), not the UI's `isActive`.
      return adminGraphqlClient.request(UPDATE_STAFF_USER, {
        id,
        staffDto: { ...rest, active: isActive },
      })
    },
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'staff'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'staff', id] })
    },
    onError: (error) => {
      console.error(error instanceof ClientError ? error.response.errors?.[0]?.message : error)
      toast.error('Failed to update staff member', { duration: 0 })
    },
  })
}
