import {ColumnDef} from "@tanstack/react-table";
import {DataTable} from "@/components/shared/datatable/DataTable.tsx";
import useBrandList from "@/pages/admin/brands/hooks/useBrandList.ts";
import {Brand} from "@/types/admin/brand.types.ts";
import {useMemo, useState} from "react";
import {Button, Dialog, DialogContent, DialogFooter, DialogHeader, Thumbnail, toast} from "@/components";
import {PenLine, Plus, TrashIcon} from "lucide-react";
import BrandEditor from "@/pages/admin/brands/screens/edit";
import BrandCreate from "@/pages/admin/brands/screens/create";
import useDeleteBrand from "@/pages/admin/brands/hooks/useDeleteBrand.ts";

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
            deleteBrand(brandToDelete.id);
        }
    }

    const columns: ColumnDef<Brand>[] = useMemo(() => [
        {
            id: 'logo',
            header: 'Logo',
            enableSorting: false,
            size: 72,
            cell: ({row}) => (
                <Thumbnail logoUrl={row.original.logoUrl} name={row.original.name}/>
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
                    <Button onClick={handleCreate} leftIcon={<Plus size={16}/>}>
                        Create Brand
                    </Button>
                }
            />
            <BrandEditor brand={brand}
                         isDialogOpen={isEditDialogOpen}
                         setIsDialogOpen={setIsEditDialogOpen}
                         onSuccess={mutate}/>
            <BrandCreate isDialogOpen={isCreateDialogOpen}
                         setIsDialogOpen={setIsCreateDialogOpen}
                         onSuccess={mutate}/>
            <Dialog open={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)}>
                <DialogHeader title="Delete Brand" />
                <DialogContent>
                    <p>Are you sure you want to delete <strong>{brandToDelete?.name}</strong>? This action cannot be undone.</p>
                </DialogContent>
                <DialogFooter>
                    <Button variant="plain" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
                        Cancel
                    </Button>
                    <Button variant="solid" onClick={confirmDelete} loading={isDeleting}>
                        Delete
                    </Button>
                </DialogFooter>
            </Dialog>
        </>
    );
};

export default BrandList;