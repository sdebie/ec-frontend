import {Controller, useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {useEffect} from "react";
import useCreateShippingMethod from "@/pages/admin/settings/hooks/useCreateShippingMethod.ts";
import {toast} from "@/components/shared/toast";
import {Button, Checkbox, Dialog, DialogContent, DialogFooter, DialogHeader, Form, FormItem, Input} from "@/components";

const formSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    baseFee: z.number().min(0, 'Base fee must be 0 or greater'),
    estimatedDays: z.string().min(1, 'Estimated delivery is required'),
    active: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface ShippingMethodCreateProps {
    isDialogOpen: boolean;
    setIsDialogOpen: (open: boolean) => void;
    onSuccess?: () => void;
}

const ShippingMethodCreate = ({isDialogOpen, setIsDialogOpen, onSuccess}: ShippingMethodCreateProps) => {

    const {createShippingMethod, isLoading} = useCreateShippingMethod({
        onSuccess: () => {
            toast.success('Shipping method created successfully!');
            onSuccess?.();
            handleClose();
        },
        onError: () => {
            toast.error("We couldn't create the shipping method. Please try again.", {
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
            baseFee: 0,
            estimatedDays: '',
            active: true,
        },
    });

    useEffect(() => {
        reset({
            name: '',
            baseFee: 0,
            estimatedDays: '',
            active: true,
        });
    }, [reset]);

    async function onSubmit(data: FormValues) {
        await createShippingMethod({
            name: data.name,
            baseFee: data.baseFee,
            estimatedDays: data.estimatedDays,
            active: data.active,
        });
    }

    const handleClose = () => {
        reset();
        setIsDialogOpen(false);
    };

    return (
        <Dialog open={isDialogOpen} onClose={handleClose} size="xl">
            <Form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <DialogHeader title={'Create Shipping Method'}/>
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
                                    label="Base Fee"
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
                    </div>
                </DialogContent>
                <DialogFooter>
                    <Button variant="ghost" onClick={handleClose} disabled={isLoading || isSubmitting}>
                        Cancel
                    </Button>
                    <Button variant="solid" type={"submit"} disabled={isLoading || isSubmitting}>
                        Create Shipping Method
                    </Button>
                </DialogFooter>
            </Form>
        </Dialog>
    );
};

export default ShippingMethodCreate;

