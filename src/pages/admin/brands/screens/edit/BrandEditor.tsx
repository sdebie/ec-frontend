import {zodResolver} from "@hookform/resolvers/zod";
import {AlertCircle, ChevronDown, ChevronUp} from "lucide-react";
import {useEffect, useState} from "react";
import {Controller, useForm} from "react-hook-form";
import {z} from "zod";

import {
    Button,
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    Form,
    FormItem,
    ImageUpload
} from "@/components";
import {toast} from "@/components/shared/toast";
import {IMAGE_BASE_URL} from "@/constants/api.constant.ts";
import useGetBrand from "@/pages/admin/brands/hooks/useGetBrand.ts";
import useUpdateBrand from "@/pages/admin/brands/hooks/useUpdateBrand.ts";
import {Input} from "@/primitives/input";
import {Brand} from "@/types/admin/BrandTypes.ts";

type BrandEditorProps = {
    brand?: Brand;
    isDialogOpen: boolean;
    setIsDialogOpen: (open: boolean) => void;
    onSuccess?: () => void;
}

const formSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().min(1, 'Description is required'),
    slug: z.string().min(1, 'Slug is required'),
    logoUrl: z.string().optional().or(z.literal('')),
});

type FormValues = z.infer<typeof formSchema>;

const BrandEditor = ({brand, isDialogOpen, setIsDialogOpen, onSuccess}: BrandEditorProps) => {

    const {
        brand: freshBrand,
        isLoading: isFetchingBrand,
    } = useGetBrand(brand?.id, isDialogOpen && !!brand);

    const isEditing = !!brand;
    const [showDetails, setShowDetails] = useState(false);

    const {updateBrand, isLoading, errorMsg, technicalDetails} = useUpdateBrand({
        onSuccess: () => {
            toast.success('Brand updated successfully!');
            handleClose();
            onSuccess?.();
        },
    });

    const {
        control,
        handleSubmit,
        reset,
        formState: {errors, isSubmitting, isDirty},
    } = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            id: '',
            name: '',
            description: '',
            slug: '',
            logoUrl: '',
        },
    });

    useEffect(() => {
        if (!isDialogOpen) return;

        if (freshBrand) {
            reset({
                id: freshBrand.id,
                name: freshBrand.name,
                description: freshBrand.description ?? '',
                slug: freshBrand.slug ?? '',
                logoUrl: freshBrand.logoUrl ?? '',
            });
        } else if (!brand) {
            reset({id: '', name: '', description: '', slug: '', logoUrl: ''});
        }
    }, [freshBrand, isDialogOpen, brand, reset]);

    const handleClose = () => {
        reset();
        setShowDetails(false);
        setIsDialogOpen(false);
    };

    async function onSubmit(data: FormValues) {
        if (isEditing) {
            await updateBrand({
                id: brand.id,
                name: data.name,
                description: data.description,
                slug: data.slug,
                logoUrl: data.logoUrl || null,
            });
        }
    }

    return (
        <Dialog open={isDialogOpen} onClose={handleClose} size="xl">
            <DialogHeader title={'Edit Brand'}/>
            <DialogContent>
                <Form onSubmit={handleSubmit(onSubmit)}>
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
                                        placeholder="Brand Name"
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
                                        placeholder="Brand Description"
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
                                        placeholder="brand-slug"
                                        className="w-full"
                                    />
                                </FormItem>
                            )}
                        />
                        <Controller
                            name="logoUrl"
                            control={control}
                            render={({field}) => (
                                <FormItem
                                    errorMessage={errors.logoUrl?.message}
                                    invalid={!!errors.logoUrl}
                                >
                                    <ImageUpload
                                        type="brand"
                                        onImageUpload={(fileName) => field.onChange(`${IMAGE_BASE_URL}${fileName}`.replace('//', '/'))}
                                        currentImageUrl={field.value || undefined}
                                    />
                                </FormItem>
                            )}
                        />
                        {errorMsg && (
                            <div
                                role="alert"
                                className="rounded-lg border border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-800 p-3 text-sm"
                            >
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-500" aria-hidden="true"/>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-red-700 dark:text-red-400">{errorMsg}</p>
                                        {technicalDetails && (
                                            <div className="mt-2">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowDetails(prev => !prev)}
                                                    className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 hover:underline focus:outline-none"
                                                >
                                                    {showDetails ? (
                                                        <><ChevronUp className="h-3 w-3"/>Hide details</>
                                                    ) : (
                                                        <><ChevronDown className="h-3 w-3"/>Show details</>
                                                    )}
                                                </button>
                                                {showDetails && (
                                                    <pre
                                                        className="mt-2 max-h-32 overflow-y-auto rounded bg-red-100 dark:bg-red-950/50 p-2 text-xs text-red-800 dark:text-red-300 wrap-break-word whitespace-pre-wrap">
                                                        {technicalDetails}
                                                    </pre>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </Form>
            </DialogContent>
            <DialogFooter>
                <Button variant="ghost" onClick={handleClose} disabled={isLoading || isSubmitting}>
                    Cancel
                </Button>
                <Button
                    variant="solid"
                    onClick={handleSubmit(onSubmit)}
                    disabled={isLoading || isSubmitting || isFetchingBrand || isDirty}
                >
                    {isEditing ? 'Save Changes' : 'Create Brand'}
                </Button>
            </DialogFooter>
        </Dialog>
    );
}

export default BrandEditor;