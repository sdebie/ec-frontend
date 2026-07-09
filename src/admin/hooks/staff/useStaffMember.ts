import { useQuery } from '@tanstack/react-query'

import { adminGraphqlClient } from '@/shared/api/graphql/adminGraphqlClient'
import { STAFF_BY_ID } from './queries'
import type { StaffMember } from './types'

interface StaffByIdResponse {
  staffById: StaffMember | null
}

export function useStaffMember(id: string) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'staff', id],
    queryFn: () =>
      adminGraphqlClient.request<StaffByIdResponse>(STAFF_BY_ID, { id }),
    enabled: !!id,
  })

  return {
    data: data?.staffById ?? null,
    isLoading,
    error,
  }
}
