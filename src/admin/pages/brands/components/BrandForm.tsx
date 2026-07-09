import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { Form, FormItem, Textarea } from '@/shared/ui/components'
import { Button, Input } from '@/shared/ui/primitives'
import { toSlug } from '@/admin/utils/slug'

const brandSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers, and hyphens'),
  description: z.string().optional().or(z.literal('')),
  logoUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})

export type BrandFormValues = z.infer<typeof brandSchema>

interface BrandFormProps {
  defaultValues?: Partial<BrandFormValues>
  onSubmit: (values: BrandFormValues) => void
  isSubmitting?: boolean
}

export function BrandForm({ defaultValues, onSubmit, isSubmitting = false }: BrandFormProps) {
  const navigate = useNavigate()
  const slugManuallyEdited = useRef(false)
  const [slugTouched, setSlugTouched] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      logoUrl: '',
      ...defaultValues,
    },
  })

  const nameValue = watch('name')

  // Auto-generate slug from name when not manually edited
  useEffect(() => {
    if (!slugManuallyEdited.current && !slugTouched) {
      setValue('slug', toSlug(nameValue), { shouldValidate: nameValue.length > 0 })
    }
  }, [nameValue, setValue, slugTouched])

  // If defaultValues include a slug (edit mode), mark as manually edited
  useEffect(() => {
    if (defaultValues?.slug) {
      slugManuallyEdited.current = true
      setSlugTouched(true)
    }
  }, [defaultValues?.slug])

  const isEditMode = !!defaultValues?.name

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      {/* Name */}
      <FormItem
        label="Name"
        required
        invalid={!!errors.name}
        errorMessage={errors.name?.message}
      >
        <Input
          {...register('name')}
          placeholder="Brand name"
          variant={errors.name ? 'error' : 'default'}
        />
      </FormItem>

      {/* Slug */}
      <FormItem
        label="Slug"
        required
        invalid={!!errors.slug}
        errorMessage={errors.slug?.message}
        helperText="URL-safe identifier. Auto-generated from name unless manually edited."
      >
        <Input
          {...register('slug', {
            onChange: () => {
              slugManuallyEdited.current = true
              setSlugTouched(true)
            },
          })}
          placeholder="brand-slug"
          variant={errors.slug ? 'error' : 'default'}
        />
      </FormItem>

      {/* Description */}
      <FormItem
        label="Description"
        invalid={!!errors.description}
        errorMessage={errors.description?.message}
      >
        <Textarea
          {...register('description')}
          placeholder="Brand description (optional)"
        />
      </FormItem>

      {/* Logo URL */}
      <FormItem
        label="Logo URL"
        invalid={!!errors.logoUrl}
        errorMessage={errors.logoUrl?.message}
        helperText="Full URL to the brand logo image"
      >
        <Input
          {...register('logoUrl')}
          placeholder="https://example.com/logo.png"
          variant={errors.logoUrl ? 'error' : 'default'}
        />
      </FormItem>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4">
        <Button
          type="submit"
          variant="solid"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Brand'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/admin/products/brands')}
        >
          Cancel
        </Button>
      </div>
    </Form>
  )
}
