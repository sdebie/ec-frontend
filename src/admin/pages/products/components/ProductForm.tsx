import {useCallback, useEffect, useRef, useState} from 'react'
import {type FieldErrors, useController, useFieldArray, useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {z} from 'zod'
import {useNavigate} from 'react-router-dom'
import {Boxes, FileText, Image as ImageIcon} from 'lucide-react'
import type {SectionTabItem} from '@/shared/ui/components'
import {Form, FormItem, ImageGalleryManager, MultiSelect, SectionTabs, Select, Textarea, toast} from '@/shared/ui/components'
import {Button, Input} from '@/shared/ui/primitives'
import {resolveImageUrl} from '@/shared/utils/imageUrl'
import {ProductStatus} from '@/shared/types/enums'
import {toSlug} from '@/admin/utils/slug'
import {VariantFields} from './VariantFields'
import {serializeAttributes} from '../hooks/mappers'
import type {ProductPayload} from '../types'

// Matches the `product_variants.attributes` VARCHAR(254) column — validated
// here (against the same serializer the mapper submits) so an overlong
// attribute list is caught as a form error, not a backend truncation.
const MAX_ATTRIBUTES_JSON_LENGTH = 254

const attributeSchema = z.object({
    key: z.string().trim().min(1, 'Name is required').max(40, 'Keep the name under 40 characters'),
    value: z.string().trim().min(1, 'Value is required').max(60, 'Keep the value under 60 characters'),
})

const variantSchema = z.object({
    id: z.string().optional(),
    priceId: z.string().optional(),
    sku: z.string().min(1, 'SKU is required'),
    price: z.string()
        .regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid price (e.g. 99.99)')
        .refine((val) => parseFloat(val) > 0, 'Price must be greater than 0'),
    wholesalePriceId: z.string().optional(),
    // Optional: blank means the variant has no wholesale tier (or keeps its
    // existing one — the backend never deletes omitted price rows).
    wholesalePrice: z.string()
        .regex(/^\d+(\.\d{1,2})?$/, 'Enter a valid price (e.g. 99.99)')
        .refine((val) => parseFloat(val) > 0, 'Price must be greater than 0')
        .optional()
        .or(z.literal('')),
    stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
    // Deliberately no `.default([])` here: a zod default makes the field
    // optional on INPUT but required on OUTPUT, and that divergence breaks
    // zodResolver's type unification with useForm<ProductFormValues>(). Every
    // call site (form defaults, handleAppend, the server-hydration mapper)
    // already supplies `attributes: []` explicitly, so a plain required array
    // costs nothing and keeps the schema's input/output shapes identical.
    attributes: z.array(attributeSchema),
}).superRefine((variant, ctx) => {
    // Attribute names must be unique within a variant (case-insensitive) —
    // a JSON object can't carry two "Colour" keys, so a second one would
    // silently overwrite the first at submit time otherwise.
    const seenKeys = new Set<string>()
    variant.attributes.forEach((attribute, i) => {
        const normalizedKey = attribute.key.toLowerCase()
        if (seenKeys.has(normalizedKey)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Attribute name is already used on this variant',
                path: ['attributes', i, 'key'],
            })
        }
        seenKeys.add(normalizedKey)
    })

    const serializedLength = serializeAttributes(variant.attributes).length
    if (serializedLength > MAX_ATTRIBUTES_JSON_LENGTH) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Attributes are too long once combined (${serializedLength}/${MAX_ATTRIBUTES_JSON_LENGTH} characters) — shorten a name or value`,
            path: ['attributes'],
        })
    }
})

export const productSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers, and hyphens'),
    shortDescription: z.string().max(200).optional().or(z.literal('')),
    description: z.string().optional().or(z.literal('')),
    status: z.string().refine((val) => Object.values(ProductStatus).includes(val as ProductStatus)),
    categoryIds: z.array(z.string()).min(1, 'At least one category is required'),
    images: z.array(z.object({url: z.string(), altText: z.string()})),
    imageIds: z.record(z.string()),
    variants: z.array(variantSchema).min(1, 'At least one variant is required'),
}).superRefine((data, ctx) => {
    // Validate duplicate SKUs within the form. Blank SKUs are skipped (already
    // reported by the per-row 'required' rule) WITHOUT compacting the array,
    // so `i` always stays the real index into `data.variants` — compacting
    // first would shift a later duplicate's index onto an unrelated blank row.
    const seen = new Set<string>()
    data.variants.forEach((variant, i) => {
        if (!variant.sku) return
        if (seen.has(variant.sku)) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Duplicate SKU',
                path: ['variants', i, 'sku'],
            })
        }
        seen.add(variant.sku)
    })
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
        categoryIds: values.categoryIds,
        images: values.images,
        imageIds: values.imageIds,
        variants: values.variants,
    }
}

// Re-export toSlug for backward compatibility — canonical source is @/admin/utils/slug
export {toSlug} from '@/admin/utils/slug'

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

// Which form fields belong to which editor section, used to surface a
// section-level error state and to jump to the first offending section
// when submission fails validation.
const SECTION_FIELDS = {
    details: ['name', 'slug', 'shortDescription', 'description', 'categoryIds', 'status'],
    images: ['images', 'imageIds'],
    variants: ['variants'],
} as const satisfies Record<string, readonly (keyof ProductFormValues)[]>

type ProductSectionId = keyof typeof SECTION_FIELDS

const SECTION_ORDER: ProductSectionId[] = ['details', 'images', 'variants']

function sectionHasErrors(sectionId: ProductSectionId, errors: FieldErrors<ProductFormValues>) {
    return SECTION_FIELDS[sectionId].some((field) => field in errors)
}

const CREATE_STATUS_OPTIONS = [
    {value: ProductStatus.PENDING, label: 'Pending'},
    {value: ProductStatus.ACTIVE, label: 'Active'},
]

const EDIT_STATUS_OPTIONS = [
    {value: ProductStatus.PENDING, label: 'Pending'},
    {value: ProductStatus.ACTIVE, label: 'Active'},
    {value: ProductStatus.DISABLED, label: 'Disabled'},
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
    const [activeSectionId, setActiveSectionId] = useState<string>('details')

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
            categoryIds: [],
            images: [],
            imageIds: {},
            variants: [{sku: '', price: '', wholesalePrice: '', stock: 0, attributes: []}],
            ...defaultValues,
        },
    })

    const {control, register, handleSubmit, watch, setValue, formState: {errors}} = form

    const {fields, append, remove} = useFieldArray({
        control,
        name: 'variants',
    })

    const categoryController = useController({
        control,
        name: 'categoryIds',
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
            setValue('slug', toSlug(nameValue), {shouldValidate: nameValue.length > 0})
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

    // Uploads run sequentially so the gallery order matches the selection order.
    // A failed file is skipped (with a toast) without abandoning the rest.
    const handleUploadFiles = async (files: File[]) => {
        let current = [...imagesController.field.value]
        for (const file of files) {
            try {
                const fileName = await onUpload(file)
                // Track this upload for potential cleanup
                sessionUploadsRef.current.add(fileName)
                current = [...current, {url: fileName, altText: ''}]
                imagesController.field.onChange(current)
            } catch {
                toast.error(`Failed to upload ${file.name}`)
            }
        }
    }

    const handleRemove = async (imageUrl: string) => {
        // Only change local form state — do NOT delete the storage file or DB association.
        // The server handles association persistence on successful save.
        // Abandoned session uploads are cleaned up on cancel/failure.
        imagesController.field.onChange(
            imagesController.field.value.filter((image) => image.url !== imageUrl),
        )
    }

    const handleAltTextChange = (imageUrl: string, altText: string) => {
        imagesController.field.onChange(
            imagesController.field.value.map((image) =>
                image.url === imageUrl ? {...image, altText} : image,
            ),
        )
    }

    // Replace keeps the image's position and alt text but swaps the file. The
    // replaced URL drops out of the manifest, so the server deletes its old
    // association on save; the storage file itself is untouched (same rule as
    // remove).
    const handleReplace = async (imageUrl: string, file: File) => {
        try {
            const fileName = await onUpload(file)
            sessionUploadsRef.current.add(fileName)
            imagesController.field.onChange(
                imagesController.field.value.map((image) =>
                    image.url === imageUrl ? {...image, url: fileName} : image,
                ),
            )
        } catch {
            toast.error(`Failed to upload ${file.name}`)
        }
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

    // A failed submit lands the user on the first section that carries errors,
    // so a validation message can never hide behind an inactive panel.
    const handleInvalidSubmit = (invalidErrors: FieldErrors<ProductFormValues>) => {
        const firstErrorSection = SECTION_ORDER.find((sectionId) => sectionHasErrors(sectionId, invalidErrors))
        if (firstErrorSection) setActiveSectionId(firstErrorSection)
    }

    const slugError = errors.slug?.message || serverErrors?.slug

    const detailsContent = (
        <div className="space-y-6">
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

            {/* Categories */}
            <FormItem
                label="Categories"
                required
                invalid={!!categoryController.fieldState.error}
                errorMessage={categoryController.fieldState.error?.message}
            >
                <MultiSelect
                    options={categoryOptions}
                    value={categoryController.field.value}
                    onChange={categoryController.field.onChange}
                    placeholder="Select one or more categories"
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
        </div>
    )

    const sections: SectionTabItem[] = [
        {
            id: 'details',
            label: 'Product Details',
            icon: <FileText/>,
            status: sectionHasErrors('details', errors) ? 'error' : 'default',
            content: detailsContent,
        },
        {
            id: 'images',
            label: 'Product Images',
            icon: <ImageIcon/>,
            badge: imagesController.field.value.length || undefined,
            status: sectionHasErrors('images', errors) ? 'error' : 'default',
            content: (
                <ImageGalleryManager
                    images={imagesController.field.value}
                    onUpload={handleUploadFiles}
                    onRemove={handleRemove}
                    onReorder={imagesController.field.onChange}
                    onAltTextChange={handleAltTextChange}
                    onReplace={handleReplace}
                    resolveSrc={resolveImageUrl}
                    description="The first image is the primary photo shown in listings and search."
                />
            ),
        },
        {
            id: 'variants',
            label: 'Product Variants',
            icon: <Boxes/>,
            badge: fields.length || undefined,
            status: sectionHasErrors('variants', errors) ? 'error' : 'default',
            content: (
                <VariantFields
                    control={control}
                    fields={fields}
                    append={append}
                    remove={remove}
                />
            ),
        },
    ]

    return (
        <Form onSubmit={handleSubmit(handleFormSubmit, handleInvalidSubmit)}>
            <SectionTabs
                sections={sections}
                activeSectionId={activeSectionId}
                onActiveSectionChange={setActiveSectionId}
                footer={
                    <div className="flex items-center gap-3">
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
                }
            />
        </Form>
    )
}
