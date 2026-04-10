import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/datatable/DataTable.tsx";
import { Button } from "@/components";
import { apiGetProductOnSaleList } from "@/services/graphql/product/product.service.ts";
import type { ProductOnSaleListItem } from "@/types/admin/ProductTypes.ts";
import { PenLine } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

type SaleVariantRow = {
    product?: ProductOnSaleListItem["product"] | null;
    productImages?: NonNullable<NonNullable<ProductOnSaleListItem["variants"]>[number]["images"]>;
    variant: {
        id: string;
        sku?: string | null;
        stockQuantity?: number | null;
        weightKg?: string | null;
        attributesJson?: string | null;
        retailSalesPrice?: number | null;
        retailSaleDaysRemaining?: number | null;
        wholesaleSalesPrice?: number | null;
        wholesaleSaleDaysRemaining?: number | null;
    };
};

const formatPrice = (price?: number | null) =>
    price != null ? `R ${price.toFixed(2)}` : "-";

const ProductSaleList = () => {
    const navigate = useNavigate();

    const [products, setProducts] = useState<SaleVariantRow[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        let isActive = true;

        const fetchSaleProducts = async () => {
            try {
                setIsLoading(true);
                setErrorMsg("");

                const result = await apiGetProductOnSaleList();
                const flattened = flattenSalesProducts(result);
                if (!isActive) return;
                setProducts(flattened);
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

      function flattenSalesProducts(items: ProductOnSaleListItem[]): SaleVariantRow[] {
        return (items ?? []).flatMap((item) => {
          const variants = item.variants ?? [];
          return variants.map((variant) => {
            const retailSalePrice = variant.prices?.find((p) => p.priceType === "RETAIL_SALE_PRICE")?.price ?? null;
            const retailSaleDaysRemaining = variant.prices?.find((p) => p.priceType === "RETAIL_SALE_PRICE")?.saleDaysRemaining ?? null;
            const wholesaleSalePrice = variant.prices?.find((p) => p.priceType === "WHOLESALE_SALE_PRICE")?.price ?? null;
            const wholesaleSaleDaysRemaining = variant.prices?.find((p) => p.priceType === "WHOLESALE_SALE_PRICE")?.saleDaysRemaining ?? null;

            return {
              product: item.product,
              productImages: variant.images ?? [],
              variant: {
                id: variant.id,
                sku: variant.sku,
                stockQuantity: variant.stockQuantity,
                weightKg: variant.weightKg,
                attributesJson: variant.attributesJson,
                retailSalesPrice: retailSalePrice,
                retailSaleDaysRemaining,
                wholesaleSalesPrice: wholesaleSalePrice,
                wholesaleSaleDaysRemaining,
                retailPrice: null,
                wholesalePrice: null,
              },
            };
          });
        });
      }

    function handleEdit(productItem: SaleVariantRow) {
        const productId = productItem.product?.id;
        if (!productId) return;
        navigate(`/admin/product/detail/${productId}`);
    }

    const columns: ColumnDef<SaleVariantRow>[] = useMemo(
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
                id: "wholesaleSalesPrice",
                accessorFn: (row) => row.variant?.wholesaleSalesPrice ?? null,
                header: () => (
                    <div>
                        Wholesale
                        <br />
                        <div className="text-[10px]">Sale Price</div>
                    </div>
                ),
                enableSorting: true,
                cell: ({ row }) => formatPrice(row.original.variant?.wholesaleSalesPrice),
            },
            {
                id: "wholesaleSaleDaysRemaining",
                accessorFn: (row) => row.variant?.wholesaleSaleDaysRemaining ?? null,
                header: () => (
                    <div>
                        Wholesale
                        <br />
                        <div className="text-[10px]">Days Left</div>
                    </div>
                ),
                enableSorting: true,
                cell: ({ row }) => row.original.variant?.wholesaleSaleDaysRemaining ?? "-",
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
                id: "retailSaleDaysRemaining",
                accessorFn: (row) => row.variant?.retailSaleDaysRemaining ?? null,
                header: () => (
                    <div>
                        Retail
                        <br />
                        <div className="text-[10px]">Days Left</div>
                    </div>
                ),
                enableSorting: true,
                cell: ({ row }) => row.original.variant?.retailSaleDaysRemaining ?? "-",
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

