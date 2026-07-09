import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { Form, FormItem, PageLayout, Select, Switcher } from '@/shared/ui/components'
import { useBreadcrumb } from '@/admin/context/BreadcrumbContext'
import { Button, Input } from '@/shared/ui/primitives'
import { useCreateStaff } from '@/admin/hooks/staff'
import { staffCreateSchema, type StaffCreateFormValues } from './staffSchema'

const ROLE_OPTIONS = [
  { value: 'SUPER_ADMIN', label: 'Super Admin' },
  { value: 'CATALOG_MANAGER', label: 'Catalog Manager' },
  { value: 'ORDER_MANAGER', label: 'Order Manager' },
  { value: 'VIEWER', label: 'Viewer' },
]

export function StaffCreatePage() {
  const navigate = useNavigate()
  const mutation = useCreateStaff()

  useBreadcrumb([
    { label: 'Home', href: '/admin' },
    { label: 'Staff', href: '/admin/staff' },
    { label: 'New Staff Member' },
  ])

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<StaffCreateFormValues>({
    resolver: zodResolver(staffCreateSchema),
    defaultValues: {
      email: '',
      fullName: '',
      role: undefined,
      temporaryPassword: '',
      isActive: true,
    },
  })

  const onSubmit = (values: StaffCreateFormValues) => {
    const staffDto = {
      ...values,
      resetPassword: false,
    }
    mutation.mutate(staffDto)
  }

  return (
    <PageLayout title="Create Staff Member">
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
                value={field.value ?? ''}
                onChange={(val) => field.onChange(val)}
                placeholder="Select a role"
              />
            )}
          />
        </FormItem>

        {/* Temporary Password */}
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

        {/* Is Active */}
        <FormItem
          label="Active"
          invalid={!!errors.isActive}
          errorMessage={errors.isActive?.message}
        >
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <Switcher
                checked={field.value}
                onChange={(checked) => field.onChange(checked)}
                label={field.value ? 'Active' : 'Inactive'}
              />
            )}
          />
        </FormItem>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4">
          <Button
            type="submit"
            variant="solid"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Creating...' : 'Create Staff Member'}
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
    </PageLayout>
  )
}
