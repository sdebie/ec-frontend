import {
    Button,
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    Form,
    FormItem,
    Input,
    Select,
    Switcher,
} from "@/components";
import type {Staff, StaffRole} from "@/types/admin/StaffTypes.ts";
import {z} from "zod";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import useUpdateStaff from "@/pages/admin/staff/hooks/useUpdateStaff.ts";
import {useEffect, useState} from "react";
import {AlertCircle, ChevronDown, ChevronUp} from "lucide-react";
import {toast} from "@/components/shared/toast";
import useGetStaff from "@/pages/admin/staff/hooks/useGetStaff.ts";

type StaffEditProps = {
    staff?: Staff;
    isDialogOpen: boolean;
    setIsDialogOpen: (open: boolean) => void;
    onSuccess?: () => void;
}

const roleOptions: { value: StaffRole; label: string }[] = [
    {value: "SUPER_ADMIN", label: "Super Admin"},
    {value: "CATALOG_MANAGER", label: "Catalog Manager"},
    {value: "ORDER_MANAGER", label: "Order Manager"},
    {value: "VIEWER", label: "Viewer"},
];

const formSchema = z.object({
    id: z.string().optional(),
    email: z.string().email("A valid email is required"),
    fullName: z.string().optional(),
    role: z.enum(["SUPER_ADMIN", "CATALOG_MANAGER", "ORDER_MANAGER", "VIEWER"]),
    active: z.boolean(),
    resetPassword: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

const StaffEdit = ({staff, isDialogOpen, setIsDialogOpen, onSuccess}: StaffEditProps) => {
    const {
        staff: freshStaff,
        isLoading: isFetchingStaff,
    } = useGetStaff(staff?.id, isDialogOpen && !!staff);

    const [showDetails, setShowDetails] = useState(false);

    const {updateStaff, isLoading, errorMsg, technicalDetails} = useUpdateStaff({
        onSuccess: () => {
            toast.success("Staff updated successfully!");
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
            id: "",
            email: "",
            fullName: "",
            role: "VIEWER",
            active: true,
            resetPassword: false,
        },
    });

    useEffect(() => {
        if (!isDialogOpen) return;

        if (freshStaff) {
            reset({
                id: freshStaff.id,
                email: freshStaff.email,
                fullName: freshStaff.fullName ?? "",
                role: freshStaff.role,
                active: freshStaff.active,
                resetPassword: !!freshStaff.resetPassword,
            });
        }
    }, [freshStaff, isDialogOpen, reset]);

    const handleClose = () => {
        reset();
        setShowDetails(false);
        setIsDialogOpen(false);
    };

    async function onSubmit(data: FormValues) {
        if (!staff?.id) {
            toast.error("Unable to update this staff user.");
            return;
        }

        await updateStaff({
            id: staff.id,
            email: data.email.trim(),
            fullName: data.fullName?.trim() || null,
            role: data.role,
            active: data.active,
            resetPassword: data.resetPassword,
        });
    }

    return (
        <Dialog open={isDialogOpen} onClose={handleClose} size="lg">
            <DialogHeader title={"Edit Staff"}/>
            <DialogContent>
                <Form onSubmit={handleSubmit(onSubmit)}>
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
                                    <Input {...field} type="email" placeholder="name@company.com" className="w-full"/>
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
                                    <Input {...field} placeholder="Jane Doe" className="w-full"/>
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

                        <Controller
                            name="resetPassword"
                            control={control}
                            render={({field}) => (
                                <FormItem label="Force Password Reset">
                                    <div className="flex items-center justify-between rounded-md border border-admin-border px-3 py-2">
                                        <span className="text-sm text-admin-text">Require user to change password on next login</span>
                                        <Switcher checked={field.value} onChange={field.onChange}/>
                                    </div>
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
                    disabled={isLoading || isSubmitting || isFetchingStaff || !isDirty}
                >
                    Save Changes
                </Button>
            </DialogFooter>
        </Dialog>
    );
}

export default StaffEdit;

