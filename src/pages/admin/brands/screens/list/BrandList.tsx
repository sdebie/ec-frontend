import {ColumnDef} from "@tanstack/react-table";
import {DataTable} from "@/components/shared/datatable/DataTable.tsx";
import useBrandList from "@/pages/admin/brands/hooks/useBrandList.ts";
import {Brand} from "@/types/admin/brand.types.ts";
import {useMemo, useState} from "react";
import {Button} from "@/components";
import {PenLine, Plus} from "lucide-react";
import BrandEditor from "@/pages/admin/brands/screens/edit";
import BrandCreate from "@/pages/admin/brands/screens/create";

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
        mutate,
    } = useBrandList();

    const [brand, setBrand] = useState<Brand>();
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

    const columns: ColumnDef<Brand>[] = useMemo(() => [
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
                <div className={"flex items-start justify-center"}>
                    <Button variant="solid" size={"sm"} onClick={() => handleEdit(props.row.original)}>
                        <PenLine size={12}/>
                    </Button>
                </div>
            )
        }
    ], []);


    function handleEdit(brand: Brand) {
        // navigate(`/admin/brands/${brand.id}/edit`);
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
                toolbarAction={
                    <Button onClick={handleCreate} leftIcon={<Plus size={16}/>}>
                        Create Brand
                    </Button>
                }
            />
            <BrandEditor brand={brand} isDialogOpen={isEditDialogOpen} setIsDialogOpen={setIsEditDialogOpen} onSuccess={mutate}/>
            <BrandCreate isDialogOpen={isCreateDialogOpen} setIsDialogOpen={setIsCreateDialogOpen} onSuccess={mutate}/>
        </>
    );
};

export default BrandList;