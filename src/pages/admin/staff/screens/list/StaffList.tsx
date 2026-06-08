import {ColumnDef} from "@tanstack/react-table";
import {PenLine, Plus} from "lucide-react";
import {useMemo, useState} from "react";


import {Button} from "@/components";
import {DataTable} from "@/components/shared/datatable/DataTable.tsx";
import useStaffList from "@/pages/admin/staff/hooks/useStaffList.ts";
import StaffCreate from "@/pages/admin/staff/screens/create/StaffCreate.tsx";
import StaffEdit from "@/pages/admin/staff/screens/edit/StaffEdit.tsx";
import type {Staff} from "@/types/admin/StaffTypes.ts";

const formatCreatedAt = (value?: string | null) => {
    if (!value) return "-";

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
};

const StaffList = () => {
    const {
        staff,
        isLoading,
        errorMsg,
        pageIndex,
        pageSize,
        totalRows,
        pageCount,
        onPageChange,
        onPageSizeChange,
        onSearchChange,
        mutate,
    } = useStaffList();

    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [staffToEdit, setStaffToEdit] = useState<Staff>();
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

    const handleEdit = (staffUser: Staff) => {
        setStaffToEdit(staffUser);
        setIsEditDialogOpen(true);
    }

    const columns: ColumnDef<Staff>[] = useMemo(() => [
        {
            id: "email",
            accessorKey: "email",
            header: "Email",
            enableSorting: true,
        },
        {
            id: "fullName",
            accessorKey: "fullName",
            header: "Full Name",
            enableSorting: true,
            cell: ({row}) => row.original.fullName || "-",
        },
        {
            id: "role",
            accessorKey: "role",
            header: "Role",
            enableSorting: true,
        },
        {
            id: "active",
            accessorKey: "active",
            header: "Status",
            enableSorting: true,
            cell: ({row}) => (row.original.active ? "Active" : "Inactive"),
        },
        {
            id: "createdAt",
            accessorKey: "createdAt",
            header: "Created",
            enableSorting: true,
            cell: ({row}) => formatCreatedAt(row.original.createdAt),
        },
        {
            id: 'actions',
            header: 'Actions',
            enableSorting: false,
            cell: (props) => (
                <div className={"flex items-start justify-center gap-2"}>
                    <Button variant="solid" size={"sm"} onClick={() => handleEdit(props.row.original)}>
                        <PenLine size={12}/>
                    </Button>
                </div>
            )
        }
    ], []);

    function handleCreate() {
        setIsCreateDialogOpen(true);
    }

    return (
        <>
            <h1 className="text-2xl font-bold mb-4">Staff</h1>
            <DataTable<Staff>
                data={staff}
                columns={columns}
                isLoading={isLoading}
                errorMsg={errorMsg}
                globalSearchPlaceholder="Search staff by email or name..."
                manualPagination
                serverPageIndex={pageIndex}
                serverPageSize={pageSize}
                serverTotalRows={totalRows}
                serverPageCount={pageCount}
                onServerPageChange={onPageChange}
                onServerPageSizeChange={onPageSizeChange}
                onServerSearchChange={onSearchChange}
                toolbarAction={
                    <div className={"flex items-center gap-2"}>
                        <Button onClick={handleCreate} leftIcon={<Plus size={16}/>}>Create Staff</Button>
                    </div>
                }
            />

            <StaffCreate
                isDialogOpen={isCreateDialogOpen}
                setIsDialogOpen={setIsCreateDialogOpen}
                onSuccess={mutate}
            />

            <StaffEdit
                staff={staffToEdit}
                isDialogOpen={isEditDialogOpen}
                setIsDialogOpen={setIsEditDialogOpen}
                onSuccess={mutate}
            />
        </>
    );
}

export default StaffList;