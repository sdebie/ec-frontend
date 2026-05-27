import {CheckCircle2, PenLine, Plus, TrashIcon, XCircle} from "lucide-react";
import {useCallback, useState} from 'react';

import {Button, DataTable, toast} from "@/components";
import useGetShippingMethods from "@/pages/admin/settings/hooks/useGetShippingMethods.ts";
import ShippingMethodCreate from "@/pages/admin/settings/screens/create";
import ShippingMethodEdit from "@/pages/admin/settings/screens/edit";
import {ShippingMethod} from "@/types/admin/SettingsTypes.ts";

type ShippingSettingsProps = {
    onEdit?: (method: ShippingMethod) => void;
    onDelete?: (method: ShippingMethod) => void;
    onCreate?: () => void;
};

const ShippingSettings = ({onEdit, onDelete: _onDelete, onCreate}: ShippingSettingsProps) => {
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<ShippingMethod>();

    const handleFetchError = useCallback(() => {
        toast.error("Failed to load shipping methods");
    }, []);

    const {shippingMethods, isLoading, fetchShippingMethods} = useGetShippingMethods({
        onError: handleFetchError,
    });

    function handleCreate() {
        setIsCreateDialogOpen(true);
    }

    function handleEdit(method: ShippingMethod) {
        setSelectedMethod(method);
        setIsEditDialogOpen(true);
    }

    function handleDelete(_method: ShippingMethod) {
        toast.error("Cannot delete, first check if used in a order");
    }

    const shippingColumns = [
        {
            id: 'name',
            accessorKey: 'name',
            header: 'Name',
            enableSorting: true,
        },
        {
            id: 'baseFee',
            accessorKey: 'baseFee',
            header: 'Base Fee',
            enableSorting: true,
            cell: ({row}: { row: { original: ShippingMethod } }) => (
                <span>${row.original.baseFee?.toFixed(2)}</span>
            ),
        },
        {
            id: 'estimatedDays',
            accessorKey: 'estimatedDays',
            header: 'Estimated Delivery',
            enableSorting: true,
        },
        {
            id: 'active',
            accessorKey: 'active',
            header: 'Status',
            enableSorting: true,
            cell: ({row}: { row: { original: ShippingMethod } }) => (
                <div className="flex items-center gap-2">
                    {row.original.active ? (
                        <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500"/>
                            <span className="text-sm text-admin-text">Active</span>
                        </>
                    ) : (
                        <>
                            <XCircle className="w-4 h-4 text-red-500"/>
                            <span className="text-sm text-admin-text">Inactive</span>
                        </>
                    )}
                </div>
            ),
        },
        {
            id: 'actions',
            header: 'Actions',
            enableSorting: false,
            cell: (props: { row: { original: ShippingMethod } }) => (
                <div className="flex items-start justify-center gap-2">
                    <Button variant="solid" size="sm" onClick={() => {
                        onEdit?.(props.row.original);
                        handleEdit(props.row.original);
                    }}>
                        <PenLine size={12}/>
                    </Button>
                    <Button variant="solid" size={"sm"} onClick={() => handleDelete(props.row.original)}>
                        <TrashIcon size={12}/>
                    </Button>
                </div>
            ),
        },
    ];

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-admin-border pb-2">
                <h2 className="text-xl font-semibold text-admin-text">Shipping Methods</h2>
                {onCreate && (
                    <Button variant="solid" size="sm" onClick={onCreate}>
                        Add Shipping Method
                    </Button>
                )}
            </div>
            <DataTable
                columns={shippingColumns}
                data={shippingMethods}
                isLoading={isLoading}
                initialPageSize={5}
                toolbarAction={
                    <div className={"flex items-center gap-2"}>
                        <Button onClick={handleCreate} leftIcon={<Plus size={16}/>}>
                            Create Shipping Method
                        </Button>
                    </div>
                }
            />
            <ShippingMethodEdit method={selectedMethod}
                         isDialogOpen={isEditDialogOpen}
                         setIsDialogOpen={setIsEditDialogOpen}
                         onSuccess={fetchShippingMethods}/>
            <ShippingMethodCreate isDialogOpen={isCreateDialogOpen}
                         setIsDialogOpen={setIsCreateDialogOpen}
                         onSuccess={fetchShippingMethods}/>
        </section>
    );
};

export default ShippingSettings;

