import {useMutation, useQueryClient} from '@tanstack/react-query'
import {ClientError} from 'graphql-request'
import {toast} from '@/shared/ui/components/toast'
import {adminGraphqlClient} from '@/shared/api/graphql/adminGraphqlClient'
import {ADD_STAFF_USER} from './queries'
import type {StaffFormValues} from './types'

export function useCreateStaff() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({isActive, ...rest}: StaffFormValues & { resetPassword?: boolean }) =>
            // StaffDtoInput uses `active` (Boolean!), not the UI's `isActive`.
            adminGraphqlClient.request(ADD_STAFF_USER, {
                staffDto: {...rest, active: isActive, resetPassword: rest.resetPassword ?? false},
            }),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ['admin', 'staff']})
        },
        onError: (error) => {
            const message =
                error instanceof ClientError
                    ? error.response.errors?.[0]?.message
                    : undefined

            if (message && /duplicate.key/i.test(message)) {
                toast.error('A staff member with this email already exists', {duration: 0})
            } else {
                toast.error('Failed to create staff member', {duration: 0})
            }
        },
    })
}
