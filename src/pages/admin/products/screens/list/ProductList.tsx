import {ColumnDef} from "@tanstack/react-table";
import {DataTable} from "@/components/shared/datatable/DataTable.tsx";
import {ProductListItem} from "@/services/graphql/product/product.service.ts";
import {Button} from "@/components";
import useProductList from "@/pages/admin/products/hooks/useProductList.ts";
import {PenLine, Plus, Upload} from "lucide-react";
import {useMemo} from "react";

const formatPrice = (price?: number | null) =>
    price != null ? `R ${price.toFixed(2)}` : "-";

const ProductList = () => {
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
    } = useProductList();

    function handleCreate() {
    }
    function handleEdit(productItem: ProductListItem) {
        console.log("Edit product:", productItem)
    }

    const columns: ColumnDef<ProductListItem>[] = useMemo(() => [
        {
            id: "name",
            accessorKey: "name",
            header: "Product Name",
            enableSorting: true,
            cell: ({row}) => (
                <div className="flex flex-col">
                    <span>{row.original.name}</span>
                    <span className="text-xs text-gray-500">{row.original.description}</span>
                </div>
            ),
        },
        {
            id: "categoryName",
            accessorKey: "categoryName",
            header: "Category",
            enableSorting: true,
            cell: ({row}) => row.original.categoryName || "-",
        },
        {
            id: "retailPrice",
            accessorKey: "retailPrice",
            header: () => <div>Retail<br /><div className={"text-[10px]"}>Price</div></div>,
            enableSorting: true,
            cell: ({row}) => formatPrice(row.original.retailPrice),
        },
        {
            id: "retailSalesPrice",
            accessorKey: "retailSalesPrice",
            header: () => <div>Retail<br /><div className={"text-[10px]"}>Sale Price</div></div>,
            enableSorting: true,
            cell: ({row}) => formatPrice(row.original.retailSalesPrice),
        },
        {
            id: "wholesalePrice",
            accessorKey: "wholesalePrice",
            header: () => <div>Wholesale<br /><div className={"text-[10px]"}>Price</div></div>,
            enableSorting: true,
            cell: ({row}) => formatPrice(row.original.wholesalePrice),
        },
        {
            id: "wholesaleSalesPrice",
            accessorKey: "wholesaleSalesPrice",
            header: () => <div>Wholesale<br /><div className={"text-[10px]"}>Sale Price</div></div>,
            enableSorting: true,
            cell: ({row}) => formatPrice(row.original.wholesaleSalesPrice),
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

export default ProductList;
