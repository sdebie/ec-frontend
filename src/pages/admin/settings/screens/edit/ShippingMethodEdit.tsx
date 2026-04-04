import {Button, Checkbox, Dialog, DialogContent, DialogFooter, DialogHeader, Form, FormItem, Input} from "@/components";
import {ShippingMethod} from "@/types/admin/SettingsTypes.ts";
import {z} from "zod";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useEffect, useState} from "react";
import useEditShippingMethod from "@/pages/admin/settings/hooks/useEditShippingMethod.ts";
import {AlertCircle, ChevronDown, ChevronUp} from "lucide-react";
import {toast} from "@/components/shared/toast";

type ShippingMethodEditProps = {
    method?: ShippingMethod;
    isDialogOpen: boolean;
    setIsDialogOpen: (open: boolean) => void;
    onSuccess?: () => void;
};

const formSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(2, 'Name must be at least 2 characters'),
    baseFee: z.number().min(0, 'Base fee must be 0 or greater'),
    estimatedDays: z.string().min(1, 'Estimated delivery is required'),
    active: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

const ShippingMethodEdit = ({method, isDialogOpen, setIsDialogOpen, onSuccess}: ShippingMethodEditProps) => {
    const isEditing = !!method;
    const [showDetails, setShowDetails] = useState(false);

    const {updateShippingMethod, isLoading, errorMsg, technicalDetails} = useEditShippingMethod({
        onSuccess: () => {
            toast.success('Shipping method updated successfully!');
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
            baseFee: 0,
            estimatedDays: '',
            active: true,
        },
    });

    useEffect(() => {
        if (!isDialogOpen) return;

        if (method) {
            reset({
                id: method.id ?? '',
                name: method.name ?? '',
                baseFee: method.baseFee ?? 0,
                estimatedDays: method.estimatedDays ?? '',
                active: method.active ?? true,
            });
        } else {
            reset({
                id: '',
                name: '',
                baseFee: 0,
                estimatedDays: '',
                active: true,
            });
        }
    }, [method, isDialogOpen, reset]);

    const handleClose = () => {
        reset();
        setShowDetails(false);
        setIsDialogOpen(false);
    };

    async function onSubmit(data: FormValues) {
        if (!isEditing || !method?.id) return;

        await updateShippingMethod({
            id: method.id,
            name: data.name,
            baseFee: data.baseFee,
            estimatedDays: data.estimatedDays,
            active: data.active,
        });
    }

    return (
        <Dialog open={isDialogOpen} onClose={handleClose} size="xl">
            <DialogHeader title={isEditing ? 'Edit Shipping Method' : 'Create Shipping Method'}/>
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
                                        {...field}
                                        placeholder="e.g. Standard Shipping"
                                        className="w-full"
                                    />
                                </FormItem>
                            )}
                        />
                        <Controller
                            name="baseFee"
                            control={control}
                            render={({field}) => (
                                <FormItem
                                    label="Base Fee ($)"
                                    required
                                    errorMessage={errors.baseFee?.message}
                                    invalid={!!errors.baseFee}
                                >
                                    <Input
                                        type="number"
                                        min={0}
                                        step={0.01}
                                        placeholder="0.00"
                                        className="w-full"
                                        value={field.value}
                                        onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                                    />
                                </FormItem>
                            )}
                        />
                        <Controller
                            name="estimatedDays"
                            control={control}
                            render={({field}) => (
                                <FormItem
                                    label="Estimated Delivery"
                                    required
                                    errorMessage={errors.estimatedDays?.message}
                                    invalid={!!errors.estimatedDays}
                                >
                                    <Input
                                        {...field}
                                        placeholder="e.g. 3-5 business days"
                                        className="w-full"
                                    />
                                </FormItem>
                            )}
                        />
                        <Controller
                            name="active"
                            control={control}
                            render={({field}) => (
                                <FormItem
                                    label="Active"
                                    errorMessage={errors.active?.message}
                                    invalid={!!errors.active}
                                >
                                    <Checkbox
                                        checked={field.value}
                                        onChange={field.onChange}
                                        label="Enable this shipping method"
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
                                                        className="mt-2 max-h-32 overflow-y-auto rounded bg-red-100 dark:bg-red-950/50 p-2 text-xs text-red-800 dark:text-red-300 wrap-break-word whitespace-pre-wrap"
                                                    >
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
                    disabled={isLoading || isSubmitting}
                >
                    {isEditing ? 'Save Changes' : 'Create Shipping Method'}
                </Button>
            </DialogFooter>
        </Dialog>
    );
};

export default ShippingMethodEdit;

