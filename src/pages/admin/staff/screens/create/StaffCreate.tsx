import {zodResolver} from "@hookform/resolvers/zod";
import {useEffect} from "react";
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
    Select,
    Switcher,
} from "@/components";
import {toast} from "@/components/shared/toast";
import useCreateStaff from "@/pages/admin/staff/hooks/useCreateStaff.ts";
import {Input} from "@/primitives/input";

import type {StaffRole} from "@/types/admin/StaffTypes.ts";


const roleOptions: { value: StaffRole; label: string }[] = [
    {value: "SUPER_ADMIN", label: "Super Admin"},
    {value: "CATALOG_MANAGER", label: "Catalog Manager"},
    {value: "ORDER_MANAGER", label: "Order Manager"},
    {value: "VIEWER", label: "Viewer"},
];

const formSchema = z.object({
    email: z.string().email("A valid email is required"),
    fullName: z.string().optional(),
    role: z.enum(["SUPER_ADMIN", "CATALOG_MANAGER", "ORDER_MANAGER", "VIEWER"]),
    active: z.boolean(),
    temporaryPassword: z.string().min(8, "Temporary password must be at least 8 characters"),
});

type FormValues = z.infer<typeof formSchema>;

interface StaffCreateProps {
    isDialogOpen: boolean;
    setIsDialogOpen: (open: boolean) => void;
    onSuccess?: () => void;
}

const StaffCreate = ({isDialogOpen, setIsDialogOpen, onSuccess}: StaffCreateProps) => {
    const {createStaff, isLoading} = useCreateStaff({
        onSuccess: () => {
            toast.success("Staff user created successfully!");
            onSuccess?.();
            handleClose();
        },
        onError: () => {
            toast.error("We couldn't create the staff user. Please try again.", {
                title: "Create failed",
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
            email: "",
            fullName: "",
            role: "VIEWER",
            active: true,
            temporaryPassword: "",
        },
    });

    useEffect(() => {
        if (!isDialogOpen) return;

        reset({
            email: "",
            fullName: "",
            role: "VIEWER",
            active: true,
            temporaryPassword: "",
        });
    }, [isDialogOpen, reset]);

    async function onSubmit(data: FormValues) {
        await createStaff({
            email: data.email.trim(),
            fullName: data.fullName?.trim() || null,
            role: data.role,
            active: data.active,
            temporaryPassword: data.temporaryPassword,
        });
    }

    const handleClose = () => {
        reset();
        setIsDialogOpen(false);
    };

    return (
        <Dialog open={isDialogOpen} onClose={handleClose} size="lg">
            <Form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 min-h-0 overflow-hidden">
                <DialogHeader title={"Create Staff"}/>
                <DialogContent>
                    <div className="grid grid-cols-1 gap-4">
                        <Controller
                            name="email"
                            control={control}
                            render={({field}) => (
                                <FormItem
                                    label="Email"
                                    required
                                    errorMessage={errors.email?.message}
                                    invalid={!!errors.email}
                                >
                                    <Input size="lg" {...field} type="email" placeholder="name@company.com" className="w-full"/>
                                </FormItem>
                            )}
                        />

                        <Controller
                            name="fullName"
                            control={control}
                            render={({field}) => (
                                <FormItem
                                    label="Full Name"
                                    errorMessage={errors.fullName?.message}
                                    invalid={!!errors.fullName}
                                >
                                    <Input size="lg" {...field} placeholder="Jane Doe" className="w-full"/>
                                </FormItem>
                            )}
                        />

                        <Controller
                            name="role"
                            control={control}
                            render={({field}) => (
                                <FormItem
                                    label="Role"
                                    required
                                    errorMessage={errors.role?.message}
                                    invalid={!!errors.role}
                                >
                                    <Select
                                        options={roleOptions}
                                        value={field.value}
                                        onChange={field.onChange}
                                        placeholder="Select role"
                                    />
                                </FormItem>
                            )}
                        />

                        <Controller
                            name="temporaryPassword"
                            control={control}
                            render={({field}) => (
                                <FormItem
                                    label="Temporary Password"
                                    required
                                    errorMessage={errors.temporaryPassword?.message}
                                    invalid={!!errors.temporaryPassword}
                                >
                                    <Input size="lg" {...field} type="password" placeholder="Set temporary password" className="w-full"/>
                                </FormItem>
                            )}
                        />

                        <Controller
                            name="active"
                            control={control}
                            render={({field}) => (
                                <FormItem label="Active">
                                    <div className="flex items-center justify-between rounded-md border border-admin-border px-3 py-2">
                                        <span className="text-sm text-admin-text">Allow this staff user to sign in</span>
                                        <Switcher checked={field.value} onChange={field.onChange}/>
                                    </div>
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
                        Create Staff
                    </Button>
                </DialogFooter>
            </Form>
        </Dialog>
    );
};

export default StaffCreate;