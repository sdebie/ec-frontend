import {ColumnDef} from "@tanstack/react-table";
import {DataTable} from "@/components/shared/datatable/DataTable.tsx";
import useCategoryList from "@/pages/admin/category/hooks/useCategoryList.ts";
import {Category} from "@/types/admin/CategoryTypes.ts";
import {useMemo, useState} from "react";
import {Button, ConfirmationDialog, Thumbnail, toast} from "@/components";
import {PenLine, Plus, TrashIcon} from "lucide-react";
import CategoryCreate from "@/pages/admin/category/screens/create/CategoryCreate.tsx";
import useDeleteCategory from "@/pages/admin/category/hooks/useDeleteCategory.ts";
import CategoryEditor from "@/pages/admin/category/screens/edit";


const CategoryList = () => {

    const {
        categories,
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
    } = useCategoryList();

    const [category, setCategory] = useState<Category>();
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] = useState<Category>();
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    function handleEdit(original: Category) {
        setCategory(original);
        setIsEditDialogOpen(true);
    }

    function handleDelete(original: Category) {
        setCategoryToDelete(original);
        setIsDeleteDialogOpen(true);
    }

    const columns: ColumnDef<Category>[] = useMemo(() => [
        {
            id: 'imageUrl',
            header: 'Logo',
            enableSorting: false,
            size: 72,
            cell: ({row}) => (
                <Thumbnail logoUrl={row.original.imageUrl} name={row.original.name}/>
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
            id: 'parent',
            header: 'Parent Category',
            enableSorting: false,
            cell: ({row}) => (
                <div>{row.original.parent?.name || '-'}</div>
            ),
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

    function handleCreate() {
        setCategory(undefined);
        setIsCreateDialogOpen(true);
    }

    const {deleteCategory, isLoading: isDeleting} = useDeleteCategory({
        onSuccess: () => {
            toast.success(`"${categoryToDelete?.name}" deleted successfully.`);
            setIsDeleteDialogOpen(false);
            setCategoryToDelete(undefined);
            mutate();
        },
        onError: () => {
            toast.error('Failed to delete brand. Please try again.');
        },
    });

    function confirmDelete() {
        if (categoryToDelete) {
            deleteCategory(categoryToDelete.id).catch(() => {
                toast.error('Failed to delete category. Please try again.');
            });
        }
    }

    return (
        <>
            <h1 className="text-2xl font-bold mb-4">Categories</h1>
            <DataTable<Category>
                data={categories}
                columns={columns}
                isLoading={isLoading}
                errorMsg={errorMsg}
                globalSearchPlaceholder="Search categories..."
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
                        <Button onClick={handleCreate} leftIcon={<Plus size={16}/>}>
                            Create Brand
                        </Button>
                    </div>
                }
            />

            <CategoryEditor category={category}
                            isDialogOpen={isEditDialogOpen}
                            setIsDialogOpen={setIsEditDialogOpen}
                            onSuccess={mutate}
            />

            <CategoryCreate isDialogOpen={isCreateDialogOpen}
                            setIsDialogOpen={setIsCreateDialogOpen}
                            onSuccess={mutate}
            />

            <ConfirmationDialog
                open={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                title="Delete Category"
                message={<>Are you sure you want to delete <strong
                    className="text-admin-text">{categoryToDelete?.name}</strong>? This action cannot be undone.</>}
                confirmText="Delete"
                variant="error"
                loading={isDeleting}
            />
        </>
    );
}

export default CategoryList;