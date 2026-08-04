import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { Form, FormItem, Select, Switcher, PageLoadingSpinner, toast } from '@/shared/ui/components'
import { Button, Input } from '@/shared/ui/primitives'
import { useAdminAuthStore } from '@/shared/auth/adminAuthStore'
import { useStaffMember, useUpdateStaff } from '@/admin/hooks/staff'
import { AdminNotFoundPage } from '@/admin/pages/AdminNotFoundPage'
import { staffEditSchema } from './staffSchema'
import type { StaffEditFormValues } from './staffSchema'

const ROLE_OPTIONS = [
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'CATALOG_MANAGER', label: 'Catalog Manager' },
  { value: 'ORDER_MANAGER', label: 'Order Manager' },
  { value: 'VIEWER', label: 'Viewer' },
]

export function StaffEditPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const userId = useAdminAuthStore((s) => s.userId)
  const { data: staff, isLoading } = useStaffMember(id!)
  const { mutate: updateStaff, isPending } = useUpdateStaff()

  const isSelf = userId === id

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<StaffEditFormValues>({
    resolver: zodResolver(staffEditSchema),
    defaultValues: {
      email: '',
      fullName: '',
      role: 'VIEWER',
      isActive: true,
    },
  })

  // Pre-populate form when staff data loads
  useEffect(() => {
    if (staff) {
      reset({
        email: staff.email,
        fullName: staff.fullName ?? '',
        role: staff.role,
        isActive: staff.active,
      })
    }
  }, [staff, reset])

  if (isLoading) {
    return <PageLoadingSpinner />
  }

  if (!staff) {
    return <AdminNotFoundPage />
  }

  const onSubmit = (values: StaffEditFormValues) => {
    updateStaff(
      {
        id: id!,
        staffDto: {
          email: values.email,
          fullName: values.fullName,
          role: values.role,
          isActive: values.isActive,
          resetPassword: false,
        },
      },
      {
        onSuccess: () => {
          toast.success('Staff member updated successfully')
          navigate('/admin/staff')
        },
      },
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-(--c-text)">Edit Staff Member</h1>

      <Form onSubmit={handleSubmit(onSubmit)}>
        {/* Email */}
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

        {/* Full Name */}
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

        {/* Role */}
        <FormItem
          label="Role"
          required
          invalid={!!errors.role}
          errorMessage={errors.role?.message}
        >
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Select
                options={ROLE_OPTIONS}
                value={field.value}
                onChange={(val) => field.onChange(val)}
                placeholder="Select a role"
                disabled={isSelf}
              />
            )}
          />
        </FormItem>

        <FormItem label="Active">
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <Switcher
                checked={field.value}
                onChange={(checked) => field.onChange(checked)}
                disabled={isSelf}
                label={field.value ? 'Active' : 'Inactive'}
              />
            )}
          />
        </FormItem>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4">
          <Button type="submit" variant="solid" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/admin/staff')}
          >
            Cancel
          </Button>
        </div>
      </Form>
    </div>
  )
}
