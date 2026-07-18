import { useEffect, useRef, useState, useCallback } from 'react'
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
  priceId: z.string().optional(),
  sku: z.string().min(1, 'SKU is required'),
  price: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid price (e.g. 99.99)')
    .refine((val) => parseFloat(val) > 0, 'Price must be greater than 0'),
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
  imageIds: z.record(z.string()).default({}),
  variants: z.array(variantSchema).min(1, 'At least one variant is required'),
}).superRefine((data, ctx) => {
  // Validate duplicate SKUs within the form
  const skus = data.variants.map((v) => v.sku).filter(Boolean)
  const seen = new Set<string>()
  for (let i = 0; i < skus.length; i++) {
    if (seen.has(skus[i])) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Duplicate SKU',
        path: ['variants', i, 'sku'],
      })
    }
    seen.add(skus[i])
  }
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
    imageIds: values.imageIds,
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
  onSubmit: (values: ProductFormValues) => void | Promise<void>
  isSubmitting: boolean
  categories: Category[]
  mode: 'create' | 'edit'
  onUpload: (file: File) => Promise<string>
  onCleanup: (filePath: string) => Promise<void>
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
  onCleanup,
  serverErrors,
}: ProductFormProps) {
  const navigate = useNavigate()
  const slugManuallyEdited = useRef(false)
  const [slugTouched, setSlugTouched] = useState(false)

  // Track newly uploaded file paths during this session for cleanup on cancel/failure.
  // These are paths uploaded in this editing session that haven't been saved yet.
  const sessionUploadsRef = useRef<Set<string>>(new Set())

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
      imageIds: {},
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

  /**
   * Clean up every file uploaded in this editing session unless the mutation has
   * completed successfully. Existing saved images are never in this set.
   */
  const cleanupAbandonedUploads = useCallback(async () => {
    for (const filePath of sessionUploadsRef.current) {
      try {
        await onCleanup(filePath)
      } catch {
        // Best-effort cleanup — don't block the user
      }
    }
    sessionUploadsRef.current.clear()
  }, [onCleanup])

  const handleUpload = async (file: File) => {
    const fileName = await onUpload(file)
    // Track this upload for potential cleanup
    sessionUploadsRef.current.add(fileName)
    imagesController.field.onChange([...imagesController.field.value, fileName])
  }

  const handleRemove = async (imageUrl: string) => {
    // Only change local form state — do NOT delete the storage file or DB association.
    // The server handles association persistence on successful save.
    // Abandoned session uploads are cleaned up on cancel/failure.
    imagesController.field.onChange(
      imagesController.field.value.filter((url) => url !== imageUrl),
    )
  }

  /**
   * On successful save, clear the session uploads tracker since those files are
   * now associated with the product. The server owns association persistence.
   */
  const handleFormSubmit = async (values: ProductFormValues) => {
    try {
      await onSubmit(values)
      sessionUploadsRef.current.clear()
    } catch {
      await cleanupAbandonedUploads()
    }
  }

  const handleCancel = async () => {
    await cleanupAbandonedUploads()
    navigate('/admin/products')
  }

  const slugError = errors.slug?.message || serverErrors?.slug

  return (
    <Form onSubmit={handleSubmit(handleFormSubmit)}>
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
          onClick={handleCancel}
        >
          Cancel
        </Button>
      </div>
    </Form>
  )
}
