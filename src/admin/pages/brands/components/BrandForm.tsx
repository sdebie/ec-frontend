import {useEffect, useRef, useState} from 'react'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {z} from 'zod'
import {useNavigate} from 'react-router-dom'
import {Form, FormItem, ImageUpload, Textarea} from '@/shared/ui/components'
import {Button, Card, Input} from '@/shared/ui/primitives'
import {toast} from '@/shared/ui/components/toast'
import {toSlug} from '@/admin/utils/slug'
import {useUploadBrandLogo} from '@/admin/hooks/images'
import {resolveImageUrl} from '@/shared/utils/imageUrl'

const brandSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers, and hyphens'),
    description: z.string().optional().or(z.literal('')),
    logoUrl: z.string().optional().or(z.literal('')),
})

export type BrandFormValues = z.infer<typeof brandSchema>

interface BrandFormProps {
    defaultValues?: Partial<BrandFormValues>
    onSubmit: (values: BrandFormValues) => void
    isSubmitting?: boolean
}

export function BrandForm({defaultValues, onSubmit, isSubmitting = false}: BrandFormProps) {
    const navigate = useNavigate()
    const slugManuallyEdited = useRef(false)
    const [slugTouched, setSlugTouched] = useState(false)
    const {mutate: uploadLogo, isPending: isUploading} = useUploadBrandLogo()

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: {errors},
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
    const logoUrlValue = watch('logoUrl')

    const handleLogoUpload = async (file: File) => {
        try {
            // Copy the bytes up front: Safari revokes file handles used async, and
            // cloud-placeholder files (iCloud "online-only") fail here with NotReadableError.
            const buffer = await file.arrayBuffer()
            const stableFile = new File([buffer], file.name, {type: file.type})
            uploadLogo(stableFile, {
                onSuccess: (fileName) => {
                    setValue('logoUrl', fileName, {shouldValidate: true})
                },
            })
        } catch {
            toast.error('Could not read the file. If it is stored in iCloud/Dropbox, download it locally first and try again.')
        }
    }

    // Auto-generate slug from name when not manually edited
    useEffect(() => {
        if (!slugManuallyEdited.current && !slugTouched) {
            setValue('slug', toSlug(nameValue), {shouldValidate: nameValue.length > 0})
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
            <Card>
                <Card.Header>
                    Brand Details
                </Card.Header>
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
                            placeholder="Brand name"
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
                            placeholder="brand-slug"
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
                            placeholder="Brand description (optional)"
                            className="bg-(--c-input-bg)"
                        />
                    </FormItem>

                    {/* Logo */}
                    <ImageUpload
                        label={isUploading ? 'Logo — uploading…' : 'Logo'}
                        images={logoUrlValue && resolveImageUrl(logoUrlValue) ? [resolveImageUrl(logoUrlValue)!] : []}
                        onUpload={handleLogoUpload}
                        onRemove={() => setValue('logoUrl', '', {shouldValidate: true})}
                        disabled={isUploading}
                        maxImages={1}
                    />
                </Card.Body>
            </Card>


            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
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
