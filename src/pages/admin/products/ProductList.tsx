import {ColumnDef, createColumnHelper} from "@tanstack/react-table";
import {DataTable} from "@/components/shared/datatable/DataTable.tsx";
import {fetchProducts, ProductListItem} from "@/services/ProductService.ts";
import {useEffect, useState} from "react";

const ProductList = () => {
    const [products, setProducts] = useState<ProductListItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

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
            <h1 className="text-2xl font-bold mb-4">Products</h1>
            <DataTable
                data={products}
                columns={columns}
                isLoading={isLoading}
                globalSearchPlaceholder="Search products..."
            />
        </div>
    );
}

export default ProductList;
