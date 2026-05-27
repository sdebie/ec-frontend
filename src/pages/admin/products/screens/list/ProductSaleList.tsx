import { ColumnDef } from "@tanstack/react-table";
import { PenLine } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";


import { Button } from "@/components";
import { DataTable } from "@/components/shared/datatable/DataTable.tsx";
import { apiGetProductOnSaleList } from "@/services/graphql/product/product.service.ts";

import type { ProductShoppingListItem } from "@/types/admin/ProductTypes.ts";

type SaleProductRow = ProductShoppingListItem;

const formatPrice = (price?: number | null) =>
    price != null ? `R ${price.toFixed(2)}` : "-";

const ProductSaleList = () => {
    const navigate = useNavigate();

    const [products, setProducts] = useState<SaleProductRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        let isActive = true;

        const fetchSaleProducts = async () => {
            try {
                setIsLoading(true);
                setErrorMsg("");

                const result = await apiGetProductOnSaleList();
                if (!isActive) return;
                setProducts(result ?? []);
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

    function handleEdit(productItem: SaleProductRow) {
        if (!productItem.id) return;
        navigate(`/admin/product/detail/${productItem.id}`);
    }

    const columns: ColumnDef<SaleProductRow>[] = useMemo(
        () => [
            {
                id: "name",
                accessorFn: (row) => row.name ?? "",
                header: "Product Name",
                enableSorting: true,
                cell: ({ row }) => (
                    <div className="w-100 truncate flex flex-col">
                        <span>{row.original.name ?? "-"}</span>
                        <span className="text-xs text-gray-500">{row.original.shortDescription ?? "-"}</span>
                    </div>
                ),
            },
            {
                id: "productType",
                accessorFn: (row) => row.productType ?? "",
                header: "Type",
                enableSorting: true,
                cell: ({ row }) => row.original.productType ?? "-",
            },
            {
                id: "variantCount",
                accessorFn: (row) => row.variantCount ?? 0,
                header: "Variants",
                enableSorting: true,
                cell: ({ row }) => row.original.variantCount ?? "-",
            },
            {
                id: "wholesaleSalesPrice",
                accessorFn: (row) => row.wholesaleSalePrice?.price ?? null,
                header: () => (
                    <div>
                        Wholesale
                        <br />
                        <div className="text-[10px]">Sale Price</div>
                    </div>
                ),
                enableSorting: true,
                cell: ({ row }) => formatPrice(row.original.wholesaleSalePrice?.price ?? null),
            },
            {
                id: "wholesaleSaleDaysRemaining",
                accessorFn: (row) => row.wholesaleSalePrice?.saleDaysRemaining ?? null,
                header: () => (
                    <div>
                        Wholesale
                        <br />
                        <div className="text-[10px]">Days Left</div>
                    </div>
                ),
                enableSorting: true,
                cell: ({ row }) => row.original.wholesaleSalePrice?.saleDaysRemaining ?? "-",
            },
            {
                id: "retailSalesPrice",
                accessorFn: (row) => row.retailSalePrice?.price ?? null,
                header: () => (
                    <div>
                        Retail
                        <br />
                        <div className="text-[10px]">Sale Price</div>
                    </div>
                ),
                enableSorting: true,
                cell: ({ row }) => formatPrice(row.original.retailSalePrice?.price ?? null),
            },
            {
                id: "retailSaleDaysRemaining",
                accessorFn: (row) => row.retailSalePrice?.saleDaysRemaining ?? null,
                header: () => (
                    <div>
                        Retail
                        <br />
                        <div className="text-[10px]">Days Left</div>
                    </div>
                ),
                enableSorting: true,
                cell: ({ row }) => row.original.retailSalePrice?.saleDaysRemaining ?? "-",
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
                            disabled={!props.row.original.id}
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
                <h1 className="text-2xl font-bold">Product Sale List</h1>
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

export default ProductSaleList;

