import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/datatable/DataTable.tsx";
import { Button } from "@/components";
import { apiGetSaleProductList } from "@/services/graphql/product/product.service.ts";
import type { SaleVariantItem } from "@/types/admin/ProductTypes.ts";
import { PenLine } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const formatPrice = (price?: number | null) =>
    price != null ? `R ${price.toFixed(2)}` : "-";

const ProductSalesList = () => {
    const navigate = useNavigate();

    const [products, setProducts] = useState<SaleVariantItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        let isActive = true;

        const fetchSaleProducts = async () => {
            try {
                setIsLoading(true);
                setErrorMsg("");

                const result = await apiGetSaleProductList();
                if (!isActive) return;
                setProducts(result);
            } catch (error) {
                console.error("Failed to fetch sale products:", error);
                if (isActive) {
                    setErrorMsg("Failed to load sale products.");
                }
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
        };

        void fetchSaleProducts();

        return () => {
            isActive = false;
        };
    }, []);

    function handleEdit(productItem: SaleVariantItem) {
        const productId = productItem.product?.id;
        if (!productId) return;
        navigate(`/admin/product/detail/${productId}`);
    }

    const columns: ColumnDef<SaleVariantItem>[] = useMemo(
        () => [
            {
                id: "name",
                accessorFn: (row) => row.product?.name ?? "",
                header: "Product Name",
                enableSorting: true,
                cell: ({ row }) => (
                    <div className="w-100 truncate flex flex-col">
                        <span>{row.original.product?.name ?? "-"}</span>
                        <span className="text-xs text-gray-500">{row.original.product?.description ?? "-"}</span>
                    </div>
                ),
            },
            {
                id: "sku",
                accessorFn: (row) => row.variant?.sku ?? "",
                header: "SKU",
                enableSorting: true,
                cell: ({ row }) => row.original.variant?.sku ?? "-",
            },
            {
                id: "categoryName",
                accessorFn: (row) => row.product?.category?.name ?? "",
                header: "Category",
                enableSorting: true,
                cell: ({ row }) => row.original.product?.category?.name ?? "-",
            },
            {
                id: "retailPrice",
                accessorFn: (row) => row.variant?.retailPrice ?? null,
                header: () => (
                    <div>
                        Retail
                        <br />
                        <div className="text-[10px]">Price</div>
                    </div>
                ),
                enableSorting: true,
                cell: ({ row }) => formatPrice(row.original.variant?.retailPrice),
            },
            {
                id: "retailSalesPrice",
                accessorFn: (row) => row.variant?.retailSalesPrice ?? null,
                header: () => (
                    <div>
                        Retail
                        <br />
                        <div className="text-[10px]">Sale Price</div>
                    </div>
                ),
                enableSorting: true,
                cell: ({ row }) => formatPrice(row.original.variant?.retailSalesPrice),
            },
            {
                id: "stockQuantity",
                accessorFn: (row) => row.variant?.stockQuantity ?? null,
                header: "Stock",
                enableSorting: true,
                cell: ({ row }) => row.original.variant?.stockQuantity ?? "-",
            },
            {
                id: "actions",
                header: "Actions",
                enableSorting: false,
                cell: (props) => (
                    <div className="flex items-start justify-center gap-2">
                        <Button
                            variant="solid"
                            size="sm"
                            onClick={() => handleEdit(props.row.original)}
                            disabled={!props.row.original.product?.id}
                        >
                            <PenLine size={12} />
                        </Button>
                    </div>
                ),
            },
        ],
        []
    );

    return (
        <div>
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-2xl font-bold">Product Sales List</h1>
            </div>
            <DataTable
                data={products}
                columns={columns}
                isLoading={isLoading}
                errorMsg={errorMsg}
                globalSearchPlaceholder="Search sale products..."
            />
        </div>
    );
};

export default ProductSalesList;

