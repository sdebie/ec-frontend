import {zodResolver} from "@hookform/resolvers/zod";
import {useEffect} from "react";
import {Controller, useForm} from "react-hook-form";
import {z} from "zod";

import {Button, Dialog, DialogContent, DialogFooter, DialogHeader, Form, FormItem, ImageUpload} from "@/components";
import {toast} from "@/components/shared/toast";
import {IMAGE_BASE_URL} from "@/constants/api.constant.ts";
import useCreateBrand from "@/pages/admin/brands/hooks/useCreateBrand.ts";
import {Input} from "@/primitives/input";

const formSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    description: z.string().min(1, 'Description is required'),
    slug: z.string().min(1, 'Slug is required'),
    logoUrl: z.string().optional().or(z.literal("")),
});

type FormValues = z.infer<typeof formSchema>;

interface BrandCreateProps {
    isDialogOpen: boolean;
    setIsDialogOpen: (open: boolean) => void;
    onSuccess?: () => void;
}

const BrandCreate = ({isDialogOpen, setIsDialogOpen, onSuccess}: BrandCreateProps) => {

    const {createBrand, isLoading} = useCreateBrand({
        onSuccess: () => {
            toast.success('Brand created successfully!');
            onSuccess?.();
            handleClose();
        },
        onError: () => {
            toast.error("We couldn't create the brand. Please try again.", {
                title: 'Create failed',
            });
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
            name: '',
            description: '',
            slug: '',
            logoUrl: '',
        },
    });

    useEffect(() => {
        reset({
            name: '',
            description: '',
            slug: '',
            logoUrl: '',
        });
    }, [reset]);

    async function onSubmit(data: FormValues) {
        await createBrand({
            name: data.name,
            description: data.description,
            slug: data.slug,
            logoUrl: data.logoUrl || null,
        });
    }

    const handleClose = () => {
        reset();
        setIsDialogOpen(false);
    };


    return (
        <Dialog open={isDialogOpen} onClose={handleClose} size="xl">
            <Form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <DialogHeader title={'Create Brand'}/>
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
                        Create Brand
                    </Button>
                </DialogFooter>
            </Form>
        </Dialog>
    )
}

export default BrandCreate;