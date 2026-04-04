import {ColumnDef, createColumnHelper} from "@tanstack/react-table";
import {DataTable} from "@/components/shared/datatable/DataTable.tsx";
import {fetchProducts, ProductListItem} from "@/services/ProductService.ts";
import {useEffect, useState} from "react";
import {Button} from "@/components";
import {exportAllProducts} from "@/services/rest/admin/ProductService.ts";

const ProductList = () => {
    const [products, setProducts] = useState<ProductListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        const fetchProductsData = async () => {
            try {
                setIsLoading(true);
                const data = await fetchProducts();
                console.log("DEBUG:: ProductList" + data);
                setProducts(data);
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProductsData();
    }, []);

    const handleExportProducts = async () => {
        try {
            setIsExporting(true);
            await exportAllProducts();
        } catch (error) {
            console.error("Failed to export products:", error);
            window.alert("Failed to export products. Please try again.");
        } finally {
            setIsExporting(false);
        }
    };

    const columnHelper = createColumnHelper<ProductListItem>();

    const columns: ColumnDef<ProductListItem, any>[] = [
        columnHelper.accessor("name",
            {
                header: "Product Name",
                cell: (info) => {
                    const row = info.row.original;
                    return (
                        <div className={"flex flex-col"}>
                            <span>{row.name}</span>
                            <span className={"text-xs"}>{row.description}</span>
                        </div>
                    );
                },
            }),

        columnHelper.accessor("categoryName",
            {
                header: "Category",
                cell: (info) => info.getValue() || "-",
            }),
        columnHelper.accessor("retailPrice",
            {
                header: "Retail Price",
                cell: (info) => {
                    const price = info.getValue();
                    return price ? `R ${price.toFixed(2)}` : "-";
                },
            }),
        columnHelper.accessor("retailSalesPrice",
            {
                header: "Retail Sale Price",
                cell: (info) => {
                    const price = info.getValue();
                    return price ? `R ${price.toFixed(2)}` : "-";
                },
            }),
        columnHelper.accessor("wholesalePrice",
            {
                header: "Wholesale Price",
                cell: (info) => {
                    const price = info.getValue();
                    return price ? `R ${price.toFixed(2)}` : "-";
                },
            }),
        columnHelper.accessor("wholesaleSalesPrice",
            {
                header: "Wholesale Sale Price",
                cell: (info) => {
                    const price = info.getValue();
                    return price ? `R ${price.toFixed(2)}` : "-";
                },
            }),
    ];

    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Products</h1>
            </div>
            <DataTable
                data={products}
                columns={columns}
                isLoading={isLoading}
                globalSearchPlaceholder="Search products..."
                toolbarAction={
                    <Button
                        type="button"
                        onClick={handleExportProducts}
                        disabled={isExporting}
                        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                        {isExporting ? "Exporting..." : "Export Products"}
                    </Button>
                }
            />
        </div>
    );
}

export default ProductList;
