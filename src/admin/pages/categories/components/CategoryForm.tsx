import { useEffect, useRef, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { Form, FormItem, Textarea, Select } from '@/shared/ui/components'
import { Button, Card, Input } from '@/shared/ui/primitives'
import { toSlug } from '@/admin/utils/slug'
import { getParentCategoryOptions } from '@/admin/utils/categoryOptions'
import { useCategoryList } from '@/admin/hooks/categories'

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers, and hyphens'),
  description: z.string().optional().or(z.literal('')),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  parentId: z.string().nullable().optional(),
})

export type CategoryFormValues = z.infer<typeof categorySchema>

interface CategoryFormProps {
  defaultValues?: Partial<CategoryFormValues>
  onSubmit: (values: CategoryFormValues) => void
  isSubmitting?: boolean
  editingCategoryId?: string
}

export function CategoryForm({ defaultValues, onSubmit, isSubmitting = false, editingCategoryId }: CategoryFormProps) {
  const navigate = useNavigate()
  const slugManuallyEdited = useRef(false)
  const [slugTouched, setSlugTouched] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      imageUrl: '',
      parentId: null,
      ...defaultValues,
    },
  })

  // Fetch all categories for the parent dropdown
  const { data: categoryData } = useCategoryList({ pageIndex: 0, pageSize: 100 })
  const parentOptions = getParentCategoryOptions(
    categoryData?.content ?? [],
    editingCategoryId,
  )

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

  const parentSelectOptions = [
    { value: '', label: 'None (top-level)' },
    ...parentOptions.map((cat) => ({ value: cat.id, label: cat.name })),
  ]

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <Card.Header>Overview</Card.Header>
        <Card.Body className="space-y-4">
          {/* Name */}
          <FormItem
            label="Name"
            required
            invalid={!!errors.name}
            errorMessage={errors.name?.message}
          >
            <Input
              {...register('name')}
              placeholder="Category name"
              variant={errors.name ? 'error' : 'default'}
              className="bg-(--c-input-bg)"
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
              placeholder="category-slug"
              variant={errors.slug ? 'error' : 'default'}
              className="bg-(--c-input-bg)"
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
              placeholder="Category description (optional)"
              className="bg-(--c-input-bg)"
            />
          </FormItem>

          {/* Image URL */}
          <FormItem
            label="Image URL"
            invalid={!!errors.imageUrl}
            errorMessage={errors.imageUrl?.message}
            helperText="Full URL to the category image"
          >
            <Input
              {...register('imageUrl')}
              placeholder="https://example.com/image.png"
              variant={errors.imageUrl ? 'error' : 'default'}
              className="bg-(--c-input-bg)"
            />
          </FormItem>

          {/* Parent Category */}
          <FormItem
            label="Parent Category"
            invalid={!!errors.parentId}
            errorMessage={errors.parentId?.message}
            helperText="Assign to a top-level category or leave as top-level"
          >
            <Controller
              name="parentId"
              control={control}
              render={({ field }) => (
                <Select
                  options={parentSelectOptions}
                  value={field.value ?? ''}
                  onChange={(val) => field.onChange(val || null)}
                  placeholder="Select parent category"
                  triggerClassName="bg-(--c-input-bg)"
                />
              )}
            />
          </FormItem>
        </Card.Body>
      </Card>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4">
        <Button
          type="submit"
          variant="solid"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Category'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/admin/products/categories')}
        >
          Cancel
        </Button>
      </div>
    </Form>
  )
}
