import {ColumnDef} from "@tanstack/react-table";
import {Download, PenLine, Plus, TrashIcon, Upload} from "lucide-react";
import {useMemo, useState} from "react";

import {Button, ConfirmationDialog, Thumbnail, toast} from "@/components";
import {DataTable} from "@/components/shared/datatable/DataTable.tsx";
import useBrandList from "@/pages/admin/brands/hooks/useBrandList.ts";
import useDeleteBrand from "@/pages/admin/brands/hooks/useDeleteBrand.ts";
import BrandCreate from "@/pages/admin/brands/screens/create";
import BrandEditor from "@/pages/admin/brands/screens/edit";
import {Brand} from "@/types/admin/BrandTypes.ts";
import {IMAGE_THUMBNAIL_URL} from "@/constants/api.constant.ts";



const BrandList = () => {

    const {
        brands,
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
    } = useBrandList();

    const [brand, setBrand] = useState<Brand>();
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [brandToDelete, setBrandToDelete] = useState<Brand>();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const {deleteBrand, isLoading: isDeleting} = useDeleteBrand({
        onSuccess: () => {
            toast.success(`"${brandToDelete?.name}" deleted successfully.`);
            setIsDeleteDialogOpen(false);
            setBrandToDelete(undefined);
            mutate();
        },
        onError: () => {
            toast.error('Failed to delete brand. Please try again.');
        },
    });

    function handleDelete(original: Brand) {
        setBrandToDelete(original);
        setIsDeleteDialogOpen(true);
    }

    function confirmDelete() {
        if (brandToDelete) {
            deleteBrand(brandToDelete.id).catch(() => {
                toast.error('Failed to delete brand. Please try again.');
            });
        }
    }

    const columns: ColumnDef<Brand>[] = useMemo(() => [
        {
            id: 'logo',
            header: 'Logo',
            enableSorting: false,
            size: 72,
            cell: ({row}) => (
                <Thumbnail logoUrl={`${IMAGE_THUMBNAIL_URL}${row.original.logoUrl}`} name={row.original.name}/>
            ),
        },
        {
            id: 'name',
            accessorKey: 'name',
            header: 'Name',
            enableSorting: true,
        },
        {
            id: 'description',
            accessorKey: 'description',
            header: 'Description',
            enableSorting: true,
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
                    <Button variant="solid" size={"sm"} onClick={() => handleDelete(props.row.original)}>
                        <TrashIcon size={12}/>
                    </Button>
                </div>
            )
        }
    ], []);


    function handleEdit(brand: Brand) {
        setBrand(brand);
        setIsEditDialogOpen(true);
    }

    function handleImport() {
        //TODO:: Import file
    }

    function handleExport() {
        //TODO:: Export file
    }

    function handleCreate() {
        setBrand(undefined);
        setIsCreateDialogOpen(true);
    }

    return (
        <>
            <h1 className="text-2xl font-bold mb-4">Brands</h1>
            <DataTable<Brand>
                data={brands}
                columns={columns}
                isLoading={isLoading}
                errorMsg={errorMsg}
                globalSearchPlaceholder="Search brands..."
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
                        <Button variant={"secondary"} onClick={handleImport} leftIcon={<Download size={16}/>}>
                            Import
                        </Button>
                        <Button variant={"outline"} onClick={handleExport} leftIcon={<Upload size={16}/>}>
                            Export
                        </Button>
                        <Button onClick={handleCreate} leftIcon={<Plus size={16}/>}>
                            Create Brand
                        </Button>
                    </div>
                }
            />

            <BrandEditor brand={brand}
                         isDialogOpen={isEditDialogOpen}
                         setIsDialogOpen={setIsEditDialogOpen}
                         onSuccess={mutate}
            />

            <BrandCreate isDialogOpen={isCreateDialogOpen}
                         setIsDialogOpen={setIsCreateDialogOpen}
                         onSuccess={mutate}
            />

            <ConfirmationDialog
                open={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Brand"
                message={<>Are you sure you want to delete <strong
                    className="text-admin-text">{brandToDelete?.name}</strong>? This action cannot be undone.</>}
                confirmText="Delete"
                variant="error"
                loading={isDeleting}
            />
        </>
    );
};

export default BrandList;