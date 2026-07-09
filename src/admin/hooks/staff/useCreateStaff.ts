import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ClientError } from 'graphql-request'
import { useNavigate } from 'react-router-dom'
import { toast } from '@/shared/ui/components/toast'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import { ADD_STAFF_USER } from './queries'
import type { StaffFormValues } from './types'

export function useCreateStaff() {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  return useMutation({
    mutationFn: (staffDto: StaffFormValues) =>
      adminGraphqlClient.request(ADD_STAFF_USER, { staffDto }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'staff'] })
      navigate('/admin/staff')
    },
    onError: (error) => {
      const message =
        error instanceof ClientError
          ? error.response.errors?.[0]?.message
          : undefined

      console.error(message ?? error)

      if (message && /duplicate.key/i.test(message)) {
        toast.error('A staff member with this email already exists', { duration: 0 })
      } else {
        toast.error('Failed to create staff member', { duration: 0 })
      }
    },
  })
}
