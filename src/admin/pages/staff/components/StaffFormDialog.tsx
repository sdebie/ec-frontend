import type {Resolver} from 'react-hook-form'
import {Controller, useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    Form,
    FormItem,
    Select,
    Switcher
} from '@/shared/ui/components'
import {Button, Input} from '@/shared/ui/primitives'
import {useAdminAuthStore} from '@/shared/auth/adminAuthStore'
import {StaffRoleOptions} from '@/shared/types/enums/StaffRoles'
import {useCreateStaff} from '../hooks/useCreateStaff'
import {useUpdateStaff} from '../hooks/useUpdateStaff'
import type {StaffCreateFormValues} from '../staffSchema'
import {staffCreateSchema, staffEditSchema} from '../staffSchema'
import type {StaffMember} from '../types'

export interface StaffFormDialogProps {
    open: boolean
    mode: 'create' | 'edit'
    staff?: StaffMember
    onClose: () => void
}

export function StaffFormDialog({open, mode, staff, onClose}: StaffFormDialogProps) {
    const userId = useAdminAuthStore((s) => s.userId)
    const isSelf = mode === 'edit' && userId === staff?.id

    const createStaff = useCreateStaff()
    const updateStaff = useUpdateStaff()
    const isPending = mode === 'create' ? createStaff.isPending : updateStaff.isPending

    const {
        register,
        handleSubmit,
        control,
        formState: {errors},
    } = useForm<StaffCreateFormValues>({
        // Edit mode validates against staffEditSchema, which has no temporaryPassword key —
        // its Resolver type doesn't structurally match Resolver<StaffCreateFormValues>, so this
        // needs an explicit cast. The password field is never registered outside create mode, so
        // an edit-mode submission never actually depends on that key being present.
        resolver: (
            mode === 'create' ? zodResolver(staffCreateSchema) : zodResolver(staffEditSchema)
        ) as Resolver<StaffCreateFormValues>,
        defaultValues:
            mode === 'edit' && staff
                ? {
                    email: staff.email,
                    fullName: staff.fullName ?? '',
                    role: staff.role,
                    isActive: staff.active,
                    temporaryPassword: '',
                }
                : {
                    email: '',
                    fullName: '',
                    role: undefined,
                    isActive: true,
                    temporaryPassword: '',
                },
    })

    const onSubmit = (values: StaffCreateFormValues) => {
        if (mode === 'create') {
            createStaff.mutate(
                {
                    email: values.email,
                    fullName: values.fullName,
                    role: values.role,
                    isActive: values.isActive,
                    temporaryPassword: values.temporaryPassword,
                    resetPassword: false,
                },
                {onSuccess: () => onClose()},
            )
            return
        }

        if (!staff) return
        updateStaff.mutate(
            {
                id: staff.id,
                staffDto: {
                    email: values.email,
                    fullName: values.fullName,
                    role: values.role,
                    isActive: values.isActive,
                    resetPassword: false,
                },
            },
            {onSuccess: () => onClose()},
        )
    }

    return (
        <Dialog open={open} onClose={onClose} size="sm">
            <DialogHeader title={mode === 'create' ? 'Add Staff Member' : 'Edit Staff Member'}/>
            <DialogContent>
                <Form onSubmit={handleSubmit(onSubmit)}>
                    <FormItem
                        label="Email"
                        required
                        invalid={!!errors.email}
                        errorMessage={errors.email?.message}
                    >
                        <Input
                            {...register('email')}
                            type="email"
                            placeholder="staff@example.com"
                            variant={errors.email ? 'error' : 'default'}
                        />
                    </FormItem>

                    <FormItem
                        label="Full Name"
                        required
                        invalid={!!errors.fullName}
                        errorMessage={errors.fullName?.message}
                    >
                        <Input
                            {...register('fullName')}
                            placeholder="Full name"
                            variant={errors.fullName ? 'error' : 'default'}
                        />
                    </FormItem>

                    <FormItem
                        label="Role"
                        required
                        invalid={!!errors.role}
                        errorMessage={errors.role?.message}
                    >
                        <Controller
                            name="role"
                            control={control}
                            render={({field}) => (
                                <Select
                                    options={StaffRoleOptions}
                                    value={field.value ?? ''}
                                    onChange={(val) => field.onChange(val)}
                                    placeholder="Select a role"
                                    disabled={isSelf}
                                />
                            )}
                        />
                    </FormItem>

                    {mode === 'create' && (
                        <FormItem
                            label="Temporary Password"
                            required
                            invalid={!!errors.temporaryPassword}
                            errorMessage={errors.temporaryPassword?.message}
                        >
                            <Input
                                {...register('temporaryPassword')}
                                type="password"
                                placeholder="Minimum 8 characters"
                                variant={errors.temporaryPassword ? 'error' : 'default'}
                            />
                        </FormItem>
                    )}

                    <FormItem label="Active">
                        <Controller
                            name="isActive"
                            control={control}
                            render={({field}) => (
                                <Switcher
                                    checked={field.value}
                                    onChange={(checked) => field.onChange(checked)}
                                    disabled={isSelf}
                                    label={field.value ? 'Active' : 'Inactive'}
                                />
                            )}
                        />
                    </FormItem>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="solid" disabled={isPending}>
                            {isPending ? 'Saving...' : mode === 'create' ? 'Create' : 'Save'}
                        </Button>
                    </DialogFooter>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
