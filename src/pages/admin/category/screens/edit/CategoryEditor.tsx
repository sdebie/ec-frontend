import {zodResolver} from "@hookform/resolvers/zod";
import {useEffect, useMemo} from "react";
import {Controller, useForm} from "react-hook-form";
import {z} from "zod";

import {
    Button, Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    Form,
    FormItem,
    ImageUpload,
    SearchableSelect,
    toast
} from "@/components";
import {IMAGE_BASE_URL} from "@/constants/api.constant.ts";
import useAllCategoryOptions from "@/pages/admin/category/hooks/useAllCategoryOptions.ts";
import useGetCategory from "@/pages/admin/category/hooks/useGetCategory.ts";
import useUpdateCategory from "@/pages/admin/category/hooks/useUpdateCategory.ts";
import {Input} from "@/primitives/input";
import {Category} from "@/types/admin/CategoryTypes.ts";

type CategoryEditorProps = {
    category?: Category;
    isDialogOpen: boolean;
    setIsDialogOpen: (open: boolean) => void;
    onSuccess?: () => void;
}

const formSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().min(1, 'Description is required'),
    slug: z.string().min(1, 'Slug is required'),
    imageUrl: z.string().optional().or(z.literal("")),
    parentId: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const CategoryEditor = ({category, isDialogOpen, setIsDialogOpen, onSuccess}: CategoryEditorProps) => {

    const {category: freshCategory} = useGetCategory(category?.id, isDialogOpen && !!category);

    const handleClose = () => {
        reset();
        setIsDialogOpen(false);
    };

    const {updateCategory, isLoading} = useUpdateCategory({
        onSuccess: () => {
            toast.success('Category updated successfully!');
            handleClose();
            onSuccess?.();
        },
    });

    const {
        control,
        handleSubmit,
        reset,
        formState: {errors, isSubmitting},
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: '',
            name: '',
            description: '',
            slug: '',
            imageUrl: '',
            parentId: ''
        },
    });

    useEffect(() => {
        if (!isDialogOpen) return;

        if (freshCategory) {
            reset({
                id: freshCategory.id,
                name: freshCategory.name,
                description: freshCategory.description ?? '',
                slug: freshCategory.slug ?? '',
                imageUrl: freshCategory.imageUrl ?? '',
                parentId: freshCategory.parent?.id ?? '',
            });
        } else if (!freshCategory) {
            reset({id: '', name: '', description: '', slug: '', imageUrl: ''});
        }
    }, [freshCategory, isDialogOpen, category, reset]);

    async function onSubmit(data: FormValues) {
        if (!category?.id) return;

        let parentCategory: Category | null = null;

        if (data.parentId) {
            const parentOption = categoryOptions.find(opt => opt.value === data.parentId);
            if (parentOption) {
                parentCategory = {
                    id: parentOption.value,
                    name: parentOption.label,
                    slug: '',
                    description: '',
                    parent: null,
                    imageUrl: null,
                };
            }
        }

        await updateCategory({
            id: category.id,
            name: data.name,
            description: data.description,
            slug: data.slug,
            imageUrl: data.imageUrl || null,
            parent: parentCategory,
        });
    }

    const {options: categoryOptions, isLoading: isCategoriesLoading} = useAllCategoryOptions();
    const categoryOptionsWithNone = useMemo(() => (
        categoryOptions.some((option) => option.value === '')
            ? categoryOptions :
            [
                {
                    value: '',
                    label: 'None'
                }, ...categoryOptions
            ]), [categoryOptions]
    );

    return (
        <Dialog open={isDialogOpen} onClose={handleClose} size="xl">
            <Form onSubmit={handleSubmit(onSubmit)} className="flex flex-col h-full min-h-0">
                <DialogHeader title={'Edit Category'}/>
                <DialogContent>
                    <div className="grid grid-cols-1 gap-4">
                        <Controller
                            name="name"
                            control={control}
                            render={({field}) => (
                                <FormItem
                                    label="Name"
                                    required
                                    errorMessage={errors.name?.message}
                                    invalid={!!errors.name}
                                >
                                    <Input
                                        size="lg"
                                        {...field}
                                        placeholder="Category Name"
                                        className="w-full"
                                    />
                                </FormItem>
                            )}
                        />
                        <Controller
                            name="description"
                            control={control}
                            render={({field}) => (
                                <FormItem
                                    label="Description"
                                    required
                                    errorMessage={errors.description?.message}
                                    invalid={!!errors.description}
                                >
                                    <Input
                                        size="lg"
                                        {...field}
                                        placeholder="Category Description"
                                        className="w-full"
                                    />
                                </FormItem>
                            )}
                        />
                        <Controller
                            name="slug"
                            control={control}
                            render={({field}) => (
                                <FormItem
                                    label="Slug"
                                    required
                                    errorMessage={errors.slug?.message}
                                    invalid={!!errors.slug}
                                >
                                    <Input
                                        size="lg"
                                        {...field}
                                        placeholder="category-slug"
                                        className="w-full"
                                    />
                                </FormItem>
                            )}
                        />
                        <Controller
                            name="parentId"
                            control={control}
                            render={({field}) => (
                                <FormItem
                                    label="Parent Category"
                                    errorMessage={errors.parentId?.message}
                                    invalid={!!errors.parentId}
                                >
                                    <SearchableSelect
                                        options={categoryOptionsWithNone}
                                        value={field.value ?? ""}
                                        onChange={field.onChange}
                                        disabled={isCategoriesLoading}
                                        placeholder="Select parent category"
                                        searchPlaceholder="Type to search categories"
                                        emptyText="No categories found"
                                        clearAriaLabel="Clear parent category"
                                    />
                                </FormItem>
                            )}
                        />
                        <Controller
                            name="imageUrl"
                            control={control}
                            render={({field}) => (
                                <FormItem
                                    errorMessage={errors.imageUrl?.message}
                                    invalid={!!errors.imageUrl}
                                >
                                    <ImageUpload
                                        type="category"
                                        onImageUpload={(fileName) => field.onChange(`${IMAGE_BASE_URL}${fileName}`)}
                                        currentImageUrl={field.value || undefined}
                                    />
                                </FormItem>
                            )}
                        />
                    </div>
                </DialogContent>
                <DialogFooter>
                    <Button variant="ghost" onClick={handleClose} disabled={isLoading || isSubmitting}>
                        Cancel
                    </Button>
                    <Button variant="solid" type={"submit"} disabled={isLoading || isSubmitting}>
                        Update Category
                    </Button>
                </DialogFooter>
            </Form>
        </Dialog>
    );
}

export default CategoryEditor;