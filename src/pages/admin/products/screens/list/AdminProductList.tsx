import {ColumnDef} from "@tanstack/react-table";
import {PenLine, Plus, Upload} from "lucide-react";
import {useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Button, Select, Thumbnail} from "@/components";
import {DataTable} from "@/components/shared/datatable/DataTable.tsx";
import {IMAGE_THUMBNAIL_URL} from "@/constants/api.constant.ts";
import {ProductStatusOptions} from "@/constants/enums/ProductStatus.ts";
import {ProductStatusDisplay} from "@/constants/enums/ProductStatusDisplay.tsx";
import useProductList from "@/pages/admin/products/hooks/useProductList.ts";

import type {ProductListItem} from "@/types/admin/ProductTypes.ts";

const AdminProductList = () => {
    const navigate = useNavigate();
    const [selectedStatus, setSelectedStatus] = useState("");

    const {
        products,
        isLoading,
        isExporting,
        errorMsg,
        pageIndex,
        pageSize,
        totalRows,
        pageCount,
        onPageChange,
        onPageSizeChange,
        onSearchChange,
        onExportProducts,
    } = useProductList(selectedStatus);

    const statusOptions = useMemo(
        () => ProductStatusOptions.map((status) => ({value: status.value, label: status.label})),
        []
    );

    function handleCreate() {
    }

    function handleEdit(productItem: ProductListItem) {
        console.log("Edit product:", productItem)
        navigate('/admin/product/detail/' + productItem.id)
    }

    const columns: ColumnDef<ProductListItem>[] = useMemo(() => [
        {
            id: "imageName",
            accessorKey: "",
            header: "",
            cell: ({row}) => (
                <Thumbnail className="h-10 w-10 rounded object-cover" logoUrl={`${IMAGE_THUMBNAIL_URL}${row.original.imageName}`} name={row.original.name}/>
            ),
        },
        {
            id: "name",
            accessorKey: "name",
            header: "Product Name",
            enableSorting: true,
            cell: ({row}) => (
                <div className="w-100 truncate flex flex-col">
                    <span>{row.original.name}</span>
                    <span className="text-xs text-gray-500">{row.original.description}</span>
                </div>
            ),
        },
        {
            id: "variantIds",
            accessorKey: "variantIds",
            header: "variations",
            enableSorting: true,
            cell: ({row}) => row.original.variantIds?.length || "-",
        },
        {
            id: "categoryNames",
            accessorKey: "categoryNames",
            header: "Category",
            enableSorting: true,
            cell: ({row}) => row.original.categoryNames?.length ? row.original.categoryNames.join(", ") : "-",
        },
        {
            id: "brandName",
            accessorKey: "brandName",
            header: "Brand",
            enableSorting: true,
            cell: ({row}) => row.original.brandName || "-",
        },
        {
            id: "status",
            accessorKey: "status",
            header: "Status",
            enableSorting: true,
            cell: ({row}) => row.original.status ? <ProductStatusDisplay status={row.original.status} /> : "-",
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

    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Products</h1>
            </div>

            <div className="mb-4">
                <Select
                    label="Status"
                    options={statusOptions}
                    value={selectedStatus}
                    onChange={setSelectedStatus}
                    placeholder="Select status"
                    isClearable
                />
            </div>

            <DataTable
                data={products}
                columns={columns}
                isLoading={isLoading}
                errorMsg={errorMsg}
                globalSearchPlaceholder="Search products..."
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
                        <Button
                            variant={"outline"}
                            leftIcon={<Upload size={16}/>}
                            onClick={() => onExportProducts().catch(() => {
                                console.error("Failed to export products.");
                                window.alert("Failed to export products. Please try again.");
                            })}
                            disabled={isExporting}
                        >
                            {isExporting ? "Exporting..." : "Export Products"}

                        </Button>
                        <Button onClick={handleCreate} leftIcon={<Plus size={16}/>}>
                            Create Product
                        </Button>
                    </div>
                }
            />
        </div>
    );
}

export default AdminProductList;
