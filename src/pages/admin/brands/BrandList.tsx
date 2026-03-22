import {ColumnDef} from "@tanstack/react-table";
import {DataTable} from "@/components/shared/datatable/DataTable";
import useBrandList from "@/pages/admin/brands/hooks/useBrandList";
import {Brand} from "@/services/graphql/admin/brand/brand.types.ts";
import {useMemo} from "react";
import {useNavigate} from "react-router-dom";
import {Button} from "@/components";
import {PenLine, Plus} from "lucide-react";

const BrandList = () => {

    const navigate = useNavigate();
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
    } = useBrandList();

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
        navigate(`/admin/brands/${brand.id}/edit`);
    }

    function handleCreate() {
        navigate('/admin/brands/create');
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
        </>
    );
};

export default BrandList;