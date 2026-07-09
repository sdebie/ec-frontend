import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogHeader, DialogContent, DialogFooter, Form, FormItem, Switcher } from '@/shared/ui/components'
import { Button, Input } from '@/shared/ui/primitives'
import { useSaveShippingMethod } from '@/admin/hooks/settings/useSaveShippingMethod'
import { shippingMethodSchema, type ShippingMethodFormValues } from './shippingMethodSchema'
import type { ShippingMethod } from '@/admin/hooks/settings/types'

export interface ShippingMethodDialogProps {
  open: boolean
  mode: 'create' | 'edit'
  method?: ShippingMethod
  onClose: () => void
}

export function ShippingMethodDialog({ open, mode, method, onClose }: ShippingMethodDialogProps) {
  const mutation = useSaveShippingMethod()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<ShippingMethodFormValues>({
    resolver: zodResolver(shippingMethodSchema),
    defaultValues:
      mode === 'edit' && method
        ? {
            name: method.name ?? '',
            baseFee: method.baseFee ?? 0,
            estimatedDays: method.estimatedDays ?? '',
            isActive: method.isActive ?? true,
          }
        : {
            name: '',
            baseFee: 0,
            estimatedDays: '',
            isActive: true,
          },
  })

  const onSubmit = (values: ShippingMethodFormValues) => {
    const methodDto: ShippingMethod = {
      id: mode === 'edit' && method ? method.id : null,
      name: values.name,
      baseFee: values.baseFee,
      estimatedDays: values.estimatedDays,
      isActive: values.isActive,
    }

    mutation.mutate(methodDto, {
      onSuccess: () => {
        onClose()
      },
    })
  }

  return (
    <Dialog open={open} onClose={onClose} size="sm">
      <DialogHeader title={mode === 'create' ? 'Add Shipping Method' : 'Edit Shipping Method'} />
      <DialogContent>
        <Form onSubmit={handleSubmit(onSubmit)}>
          <FormItem
            label="Name"
            required
            invalid={!!errors.name}
            errorMessage={errors.name?.message}
          >
            <Input
              {...register('name')}
              placeholder="e.g. Standard Delivery"
              variant={errors.name ? 'error' : 'default'}
            />
          </FormItem>

          <FormItem
            label="Base Fee"
            required
            invalid={!!errors.baseFee}
            errorMessage={errors.baseFee?.message}
          >
            <Input
              {...register('baseFee')}
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              variant={errors.baseFee ? 'error' : 'default'}
            />
          </FormItem>

          <FormItem
            label="Estimated Days"
            required
            invalid={!!errors.estimatedDays}
            errorMessage={errors.estimatedDays?.message}
          >
            <Input
              {...register('estimatedDays')}
              placeholder="e.g. 2-3 business days"
              variant={errors.estimatedDays ? 'error' : 'default'}
            />
          </FormItem>

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

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="solid" disabled={mutation.isPending}>
              {mode === 'create' ? 'Create' : 'Save'}
            </Button>
          </DialogFooter>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
