import { useEffect, useRef, useState } from 'react'
import { useForm, useFieldArray, useController } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { Form, FormItem, Textarea, Select, SearchableSelect, ImageUpload } from '@/shared/ui/components'
import { Button, Input } from '@/shared/ui/primitives'
import { ProductStatus } from '@/shared/types/enums'
import { toSlug } from '@/admin/utils/slug'
import { VariantFields } from './VariantFields'
import type { ProductPayload } from '@/admin/hooks/products/useCreateProduct'

const variantSchema = z.object({
  id: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  price: z.string().regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid price (e.g. 99.99)'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
})

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers, and hyphens'),
  shortDescription: z.string().max(200).optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
  status: z.string().refine((val) => Object.values(ProductStatus).includes(val as ProductStatus)),
  categoryId: z.string().min(1, 'Category is required'),
  images: z.array(z.string()),
  variants: z.array(variantSchema).min(1, 'At least one variant is required'),
})

export type ProductFormValues = z.infer<typeof productSchema>

// Maps validated form values to the API payload: the schema guarantees `status`
// is a valid ProductStatus, and optional text fields collapse to empty strings.
export function toProductPayload(values: ProductFormValues): ProductPayload {
  return {
    name: values.name,
    slug: values.slug,
    shortDescription: values.shortDescription ?? '',
    description: values.description ?? '',
    status: values.status as ProductStatus,
    categoryId: values.categoryId,
    images: values.images,
    variants: values.variants,
  }
}

// Re-export toSlug for backward compatibility — canonical source is @/admin/utils/slug
export { toSlug } from '@/admin/utils/slug'

interface Category {
  id: string
  name: string
}

interface ProductFormProps {
  defaultValues?: Partial<ProductFormValues>
  onSubmit: (values: ProductFormValues) => void
  isSubmitting: boolean
  categories: Category[]
  mode: 'create' | 'edit'
  onUpload: (file: File) => Promise<string>
  onRemove: (imageUrl: string) => Promise<void>
  serverErrors?: Record<string, string>
}

const CREATE_STATUS_OPTIONS = [
  { value: ProductStatus.PENDING, label: 'Pending' },
  { value: ProductStatus.ACTIVE, label: 'Active' },
]

const EDIT_STATUS_OPTIONS = [
  { value: ProductStatus.PENDING, label: 'Pending' },
  { value: ProductStatus.ACTIVE, label: 'Active' },
  { value: ProductStatus.DISABLED, label: 'Disabled' },
]

export function ProductForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  categories,
  mode,
  onUpload,
  onRemove,
  serverErrors,
}: ProductFormProps) {
  const navigate = useNavigate()
  const slugManuallyEdited = useRef(false)
  const [slugTouched, setSlugTouched] = useState(false)

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      slug: '',
      shortDescription: '',
      description: '',
      status: ProductStatus.PENDING,
      categoryId: '',
      images: [],
      variants: [{ sku: '', price: '', stock: 0 }],
      ...defaultValues,
    },
  })

  const { control, register, handleSubmit, watch, setValue, formState: { errors } } = form

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'variants',
  })

  const categoryController = useController({
    control,
    name: 'categoryId',
  })

  const statusController = useController({
    control,
    name: 'status',
  })

  const imagesController = useController({
    control,
    name: 'images',
  })

  const nameValue = watch('name')

  // Auto-generate slug from name when not manually edited
  useEffect(() => {
    if (!slugManuallyEdited.current && !slugTouched) {
      setValue('slug', toSlug(nameValue), { shouldValidate: nameValue.length > 0 })
    }
  }, [nameValue, setValue, slugTouched])

  // If defaultValues include a slug in edit mode, mark as manually edited
  useEffect(() => {
    if (mode === 'edit' && defaultValues?.slug) {
      slugManuallyEdited.current = true
      setSlugTouched(true)
    }
  }, [mode, defaultValues?.slug])

  const categoryOptions = categories.map((cat) => ({
    value: cat.id,
    label: cat.name,
  }))

  const statusOptions = mode === 'create' ? CREATE_STATUS_OPTIONS : EDIT_STATUS_OPTIONS

  const handleUpload = async (file: File) => {
    const url = await onUpload(file)
    imagesController.field.onChange([...imagesController.field.value, url])
  }

  const handleRemove = async (imageUrl: string) => {
    // Optimistic removal — update UI immediately, then call API
    imagesController.field.onChange(
      imagesController.field.value.filter((url) => url !== imageUrl),
    )
    await onRemove(imageUrl)
  }

  const slugError = errors.slug?.message || serverErrors?.slug

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
          placeholder="Product name"
          variant={errors.name ? 'error' : 'default'}
        />
      </FormItem>

      {/* Slug */}
      <FormItem
        label="Slug"
        required
        invalid={!!slugError}
        errorMessage={slugError}
        helperText="URL-safe identifier. Auto-generated from name unless manually edited."
      >
        <Input
          {...register('slug', {
            onChange: () => {
              slugManuallyEdited.current = true
              setSlugTouched(true)
            },
          })}
          placeholder="product-slug"
          variant={slugError ? 'error' : 'default'}
        />
      </FormItem>

      {/* Short Description */}
      <FormItem
        label="Short Description"
        invalid={!!errors.shortDescription}
        errorMessage={errors.shortDescription?.message}
        helperText="Max 200 characters"
      >
        <Input
          {...register('shortDescription')}
          placeholder="Brief product summary"
          variant={errors.shortDescription ? 'error' : 'default'}
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
          placeholder="Detailed product description"
        />
      </FormItem>

      {/* Category */}
      <FormItem
        label="Category"
        required
        invalid={!!categoryController.fieldState.error}
        errorMessage={categoryController.fieldState.error?.message}
      >
        <SearchableSelect
          options={categoryOptions}
          value={categoryController.field.value}
          onChange={categoryController.field.onChange}
          placeholder="Select a category"
        />
      </FormItem>

      {/* Status */}
      <FormItem
        label="Status"
        required
        invalid={!!statusController.fieldState.error}
        errorMessage={statusController.fieldState.error?.message}
      >
        <Select
          options={statusOptions}
          value={statusController.field.value}
          onChange={statusController.field.onChange}
          placeholder="Select status"
        />
      </FormItem>

      {/* Images */}
      <ImageUpload
        images={imagesController.field.value}
        onUpload={handleUpload}
        onRemove={handleRemove}
        label="Product Images"
      />

      {/* Variants */}
      <VariantFields
        control={control}
        fields={fields}
        append={append}
        remove={remove}
      />

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4">
        <Button
          type="submit"
          variant="solid"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Product' : 'Save Changes'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate('/admin/products')}
        >
          Cancel
        </Button>
      </div>
    </Form>
  )
}
