import {type ReactNode, useEffect, useRef, useState} from 'react'
import {useController, useForm} from 'react-hook-form'
import {zodResolver} from '@hookform/resolvers/zod'
import {z} from 'zod'
import {useNavigate} from 'react-router-dom'
import {ChevronLeft, ChevronRight, Loader, Search} from 'lucide-react'
import {
    Form,
    FormItem,
    ImageGalleryPicker,
    ImageUpload,
    Label,
    SearchableSelect,
    Textarea,
    ToggleGroup,
} from '@/shared/ui/components'
import {Button, Card, Input} from '@/shared/ui/primitives'
import {toast} from '@/shared/ui/components/toast'
import {toSlug} from '@/admin/utils/slug'
import {getParentCategoryOptions} from '@/admin/utils/categoryOptions'
import {useImageListPage, useUploadImageAsset} from '@/admin/hooks/images'
import {thumbnailUrl} from '@/shared/utils/imageUrl'
import {useCategoryList} from '../hooks/useCategoryList'

const categorySchema = z.object({
    name: z.string().min(1, 'Name is required'),
    slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers, and hyphens'),
    description: z.string().optional().or(z.literal('')),
    // A storage-relative filename written by the upload/library picker, not a
    // full URL — resolveImageUrl prefixes it at render time.
    imageUrl: z.string().optional().or(z.literal('')),
    parentId: z.string().nullable().optional(),
})

type ImageMode = 'upload' | 'library'

const IMAGE_MODE_OPTIONS = [
    {value: 'upload', label: 'Upload New'},
    {value: 'library', label: 'Choose from Library'},
]

// Category images live under the "categories/" storage directory: uploads land
// here and the picker browses only here, so it isn't the entire platform's
// image library.
const IMAGE_LIBRARY_DIRECTORY = 'categories'
// 2 full rows at the picker's 6-column grid — a page never ends mid-row.
const IMAGE_LIBRARY_PAGE_SIZE = 12
const IMAGE_LIBRARY_SEARCH_DEBOUNCE_MS = 300

// How many categories to load for the parent dropdown and the duplicate
// name/slug pre-check. The page holds ALL categories (top-level filtering
// happens client-side afterwards), so this must cover the whole tree —
// getCategories caps pageSize at 500. A category beyond the cap would only
// be missing from the picker/pre-check; the server still validates on save.
const CATEGORY_LOOKUP_PAGE_SIZE = 500

export type CategoryFormValues = z.infer<typeof categorySchema>

interface CategoryFormProps {
    defaultValues?: Partial<CategoryFormValues>
    onSubmit: (values: CategoryFormValues) => void
    isSubmitting?: boolean
    editingCategoryId?: string
    backButton?: ReactNode
}

export function CategoryForm({
                                 defaultValues,
                                 onSubmit,
                                 isSubmitting = false,
                                 editingCategoryId,
                                 backButton,
                             }: CategoryFormProps) {
    const navigate = useNavigate()
    // Seeded from props, not synced by effect: the auto-slug effect below runs
    // before any effect could flip these, so an effect-based guard would let a
    // name-derived slug overwrite the stored (locked) slug on the first render
    // of edit mode whenever the name has diverged from the slug.
    const slugManuallyEdited = useRef(!!defaultValues?.slug)
    const [slugTouched, setSlugTouched] = useState(!!defaultValues?.slug)
    const {mutate: uploadImage, isPending: isUploading} = useUploadImageAsset(IMAGE_LIBRARY_DIRECTORY)
    const [imageMode, setImageMode] = useState<ImageMode>('upload')
    const [librarySearchInput, setLibrarySearchInput] = useState('')
    const [debouncedLibrarySearch, setDebouncedLibrarySearch] = useState('')
    const [libraryPage, setLibraryPage] = useState(0)

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedLibrarySearch(librarySearchInput), IMAGE_LIBRARY_SEARCH_DEBOUNCE_MS)
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
        pageSize: IMAGE_LIBRARY_PAGE_SIZE,
        search: debouncedLibrarySearch,
        directory: IMAGE_LIBRARY_DIRECTORY,
        enabled: imageMode === 'library',
    })

    const libraryTotalPages = libraryData ? Math.max(1, Math.ceil(libraryData.totalCount / IMAGE_LIBRARY_PAGE_SIZE)) : 1

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        setError,
        control,
        formState: {errors},
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

    const {data: categoryData} = useCategoryList({pageIndex: 0, pageSize: CATEGORY_LOOKUP_PAGE_SIZE})
    // getParentCategoryOptions returns a fresh filtered array, so sorting in
    // place is safe; the list arrives in insertion order otherwise.
    const parentOptions = getParentCategoryOptions(
        categoryData?.content ?? [],
        editingCategoryId,
    ).sort((a, b) => a.name.localeCompare(b.name))

    const parentSelectOptions = [
        {value: '', label: 'None (top-level)'},
        ...parentOptions.map((cat) => ({value: cat.id, label: cat.name})),
    ]

    const parentField = useController({name: 'parentId', control}).field

    const nameValue = watch('name')
    const imageUrlValue = watch('imageUrl')

    const handleImageUpload = async (file: File) => {
        try {
            // Copy the bytes up front: Safari revokes file handles used async, and
            // cloud-placeholder files (iCloud "online-only") fail here with NotReadableError.
            const buffer = await file.arrayBuffer()
            const stableFile = new File([buffer], file.name, {type: file.type})
            uploadImage(stableFile, {
                onSuccess: (fileName) => {
                    setValue('imageUrl', fileName, {shouldValidate: true})
                },
            })
        } catch {
            toast.error('Could not read the file. If it is stored in iCloud/Dropbox, download it locally first and try again.')
        }
    }

    // The picker displays/identifies images by thumbnail URL, but imageUrl must stay
    // the raw storage-relative filename (matching what upload writes) — this map
    // recovers the filename behind a selected thumbnail without parsing URL strings.
    const libraryFilenames = libraryData?.images ?? []
    const libraryThumbnailUrls = libraryFilenames.map((filename) => thumbnailUrl(filename))
    const libraryUrlToFilename = new Map(libraryThumbnailUrls.map((url, i) => [url, libraryFilenames[i]]))

    const handleLibrarySelect = (url: string) => {
        const filename = libraryUrlToFilename.get(url)
        if (filename) setValue('imageUrl', filename, {shouldValidate: true})
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

    // Mirrors CategoryService's case-insensitive uniqueness rules so a duplicate
    // surfaces as a field error before the request goes out. The server re-checks
    // regardless (and the DB's unique slug constraint decides concurrent creates),
    // so this is a UX guard, not the authority.
    const submitWithUniquenessCheck = (values: CategoryFormValues) => {
        const others = (categoryData?.content ?? []).filter((cat) => cat.id !== editingCategoryId)
        const nameTaken = others.some((cat) => cat.name.toLowerCase() === values.name.toLowerCase())
        const slugTaken = others.some((cat) => cat.slug.toLowerCase() === values.slug.toLowerCase())

        if (nameTaken) {
            setError('name', {type: 'duplicate', message: 'A category with this name already exists'}, {shouldFocus: true})
        }
        if (slugTaken) {
            setError('slug', {type: 'duplicate', message: 'This slug is already used by another category'}, {shouldFocus: !nameTaken})
        }
        if (nameTaken || slugTaken) return

        onSubmit(values)
    }

    return (
        <Form onSubmit={handleSubmit(submitWithUniquenessCheck)}>
            <Card>
                <Card.Header className="flex items-center gap-3 mb-1 pb-2">
                    {backButton}
                    {isEditMode ? 'Edit Category' : 'Create Category'}
                </Card.Header>
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
                            placeholder="Category name"
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
                                ? 'The slug is locked once a category is created, since changing it would break any existing links to it.'
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
                            placeholder="category-slug"
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
                            placeholder="Category description (optional)"
                            className="min-h-16"
                        />
                    </FormItem>

                    {/* Parent Category */}
                    <FormItem
                        label="Parent Category"
                        invalid={!!errors.parentId}
                        errorMessage={errors.parentId?.message}
                        helperText="Assign to a top-level category or leave as top-level"
                    >
                        {/* In-place menu (no portal): a body portal would sit outside the
                            [data-density] scope, so the menu's search input would lose its
                            --c-control-h-* height token (ThemeApplier mirrors surface/theme/
                            preset onto <body>, but not density). */}
                        <SearchableSelect
                            options={parentSelectOptions}
                            value={parentField.value ?? ''}
                            onChange={(val) => parentField.onChange(val || null)}
                            placeholder="Select parent category"
                            searchPlaceholder="Search categories..."
                            emptyText="No matching categories"
                            usePortal={false}
                        />
                    </FormItem>

                    {/* Image */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between gap-3">
                            <Label className="mb-0">{isUploading ? 'Image — uploading…' : 'Image'}</Label>
                            <ToggleGroup
                                options={IMAGE_MODE_OPTIONS}
                                value={imageMode}
                                onChange={(value) => setImageMode(value as ImageMode)}
                                disabled={isUploading}
                                size="sm"
                            />
                        </div>

                        {imageMode === 'upload' ? (
                            <ImageUpload
                                label=""
                                images={imageUrlValue ? [thumbnailUrl(imageUrlValue)] : []}
                                onUpload={handleImageUpload}
                                onRemove={() => setValue('imageUrl', '', {shouldValidate: true})}
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
                                        selectedImage={imageUrlValue ? thumbnailUrl(imageUrlValue) : null}
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
                <Card.Footer className="flex items-center justify-end gap-3 mt-2 pt-4">
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
                        {isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Category'}
                    </Button>
                </Card.Footer>
            </Card>
        </Form>
    )
}
