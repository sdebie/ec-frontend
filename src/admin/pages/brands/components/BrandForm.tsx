import {useEffect, useRef, useState} from 'react'
import {useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {z} from 'zod'
import {useNavigate} from 'react-router-dom'
import {ChevronLeft, ChevronRight, Loader, Search} from 'lucide-react'
import {Form, FormItem, ImageGalleryPicker, ImageUpload, Label, Textarea, ToggleGroup} from '@/shared/ui/components'
import {Button, Card, Input} from '@/shared/ui/primitives'
import {toast} from '@/shared/ui/components/toast'
import {toSlug} from '@/admin/utils/slug'
import {useImageListPage} from '@/admin/hooks/images/useImageListPage'
import {useUploadImageAsset} from '@/admin/hooks/images/useUploadImageAsset'
import {thumbnailUrl} from '@/shared/utils/imageUrl'

const brandSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers, and hyphens'),
    description: z.string().optional().or(z.literal('')),
    logoUrl: z.string().optional().or(z.literal('')),
})

type LogoMode = 'upload' | 'library'

const LOGO_MODE_OPTIONS = [
    {value: 'upload', label: 'Upload New'},
    {value: 'library', label: 'Choose from Library'},
]

// Brand logos live under the "brands/" storage directory: uploads land here and
// the picker browses only here, so it isn't the entire platform's image library.
const LOGO_LIBRARY_DIRECTORY = 'brands'
// 2 full rows at the picker's 6-column grid — a page never ends mid-row.
const LOGO_LIBRARY_PAGE_SIZE = 12
const LOGO_LIBRARY_SEARCH_DEBOUNCE_MS = 300

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
    const {mutate: uploadLogo, isPending: isUploading} = useUploadImageAsset(LOGO_LIBRARY_DIRECTORY)
    const [logoMode, setLogoMode] = useState<LogoMode>('upload')
    const [librarySearchInput, setLibrarySearchInput] = useState('')
    const [debouncedLibrarySearch, setDebouncedLibrarySearch] = useState('')
    const [libraryPage, setLibraryPage] = useState(0)

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedLibrarySearch(librarySearchInput), LOGO_LIBRARY_SEARCH_DEBOUNCE_MS)
        return () => clearTimeout(timer)
    }, [librarySearchInput])

    // A new search starts from page 1 — staying on e.g. page 3 of the old
    // result set would likely just show "no images" against the new one.
    useEffect(() => {
        setLibraryPage(0)
    }, [debouncedLibrarySearch])

    const {
        data: libraryData,
        isLoading: isLoadingLibraryImages,
        isFetching: isFetchingLibraryImages
    } = useImageListPage({
        page: libraryPage,
        pageSize: LOGO_LIBRARY_PAGE_SIZE,
        search: debouncedLibrarySearch,
        directory: LOGO_LIBRARY_DIRECTORY,
        enabled: logoMode === 'library',
    })

    const libraryTotalPages = libraryData ? Math.max(1, Math.ceil(libraryData.totalCount / LOGO_LIBRARY_PAGE_SIZE)) : 1

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

    // The picker displays/identifies images by thumbnail URL, but logoUrl must stay
    // the raw storage-relative filename (matching what upload writes) — this map
    // recovers the filename behind a selected thumbnail without parsing URL strings.
    const libraryFilenames = libraryData?.images ?? []
    const libraryThumbnailUrls = libraryFilenames.map((filename) => thumbnailUrl(filename))
    const libraryUrlToFilename = new Map(libraryThumbnailUrls.map((url, i) => [url, libraryFilenames[i]]))

    const handleLibrarySelect = (url: string) => {
        const filename = libraryUrlToFilename.get(url)
        if (filename) setValue('logoUrl', filename, {shouldValidate: true})
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
                <Card.Body className="space-y-3 px-4 pb-4 pt-2">
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
                        helperText={
                            isEditMode
                                ? 'The slug is locked once a brand is created, since changing it would break any existing links to it.'
                                : 'Creates a simple, unique name used to identify this page. It is automatically created from the name, but you can change it.'
                        }
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
                            readOnly={isEditMode}
                            aria-readonly={isEditMode}
                            tabIndex={isEditMode ? -1 : undefined}
                            className={isEditMode ? 'cursor-not-allowed opacity-60' : undefined}
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
                            className="min-h-16"
                        />
                    </FormItem>
                    {/* Logo */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                            <Label className="mb-0">{isUploading ? 'Logo — uploading…' : 'Logo'}</Label>
                            <ToggleGroup
                                options={LOGO_MODE_OPTIONS}
                                value={logoMode}
                                onChange={(value) => setLogoMode(value as LogoMode)}
                                disabled={isUploading}
                                size="sm"
                            />
                        </div>

                        {logoMode === 'upload' ? (
                            <ImageUpload
                                label=""
                                images={logoUrlValue ? [thumbnailUrl(logoUrlValue)] : []}
                                onUpload={handleLogoUpload}
                                onRemove={() => setValue('logoUrl', '', {shouldValidate: true})}
                                disabled={isUploading}
                                maxImages={1}
                            />
                        ) : (
                            <div className="space-y-3">
                                <div className="relative">
                                    <Search
                                        className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--c-text-muted)"/>
                                    <Input
                                        placeholder="Search library images..."
                                        value={librarySearchInput}
                                        onChange={(e) => setLibrarySearchInput(e.target.value)}
                                        className="pl-9"
                                    />
                                </div>
                                <div className="relative">
                                    <ImageGalleryPicker
                                        images={libraryThumbnailUrls}
                                        selectedImage={logoUrlValue ? thumbnailUrl(logoUrlValue) : null}
                                        onSelect={handleLibrarySelect}
                                        isLoading={isLoadingLibraryImages}
                                    />
                                    {/* Paging keeps the previous page's images visible (placeholderData:
                                        keepPreviousData) rather than blanking the grid — this is just a
                                        subtle "still working" cue over them, not a full loading state. */}
                                    {isFetchingLibraryImages && !isLoadingLibraryImages && (
                                        <div
                                            className="absolute inset-0 flex items-center justify-center bg-(--c-panel)/60 rounded-md">
                                            <Loader className="h-5 w-5 animate-spin text-(--c-text-muted)"/>
                                        </div>
                                    )}
                                </div>
                                {libraryTotalPages > 1 && (
                                    <div className="flex items-center justify-center gap-3">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setLibraryPage((p) => p - 1)}
                                            disabled={libraryPage === 0 || isFetchingLibraryImages}
                                            aria-label="Previous page"
                                        >
                                            <ChevronLeft className="h-4 w-4"/>
                                        </Button>
                                        <span className="text-xs text-(--c-text-muted)">
                                            Page {libraryPage + 1} of {libraryTotalPages}
                                        </span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setLibraryPage((p) => p + 1)}
                                            disabled={libraryPage + 1 >= libraryTotalPages || isFetchingLibraryImages}
                                            aria-label="Next page"
                                        >
                                            <ChevronRight className="h-4 w-4"/>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </Card.Body>

                {/* Actions */}
                <Card.Footer className="flex items-center justify-end gap-3 mt-2 p-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate(-1)}
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        variant="solid"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Brand'}
                    </Button>
                </Card.Footer>
            </Card>
        </Form>
    )
}
