import {ColumnDef} from "@tanstack/react-table";
import {PenLine} from "lucide-react";
import {useEffect, useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Button, Select} from "@/components";
import {DataTable} from "@/components/shared/datatable/DataTable.tsx";
import {IMAGE_THUMBNAIL_URL} from "@/constants/api.constant.ts";
import {apiGetAllBrands} from "@/services/graphql/admin/brand/BrandService.graphql.ts";
import {apiGetProductListByBrand} from "@/services/graphql/product/product.service.ts";
import type {Brand} from "@/types/admin/BrandTypes.ts";
import type {ProductListItem} from "@/types/admin/ProductTypes.ts";

const BRAND_PAGE_SIZE = 500;
const PRODUCTS_PAGE_SIZE = 500;

const ProductBrandList = () => {
    const navigate = useNavigate();
    const [brands, setBrands] = useState<Brand[]>([]);
    const [selectedBrandId, setSelectedBrandId] = useState("");
    const [products, setProducts] = useState<ProductListItem[]>([]);
    const [isLoadingBrands, setIsLoadingBrands] = useState(false);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        let isActive = true;

        const fetchBrands = async () => {
            try {
                setIsLoadingBrands(true);
                const data = await apiGetAllBrands(
                    {pageIndex: 0, pageSize: BRAND_PAGE_SIZE},
                    {
                        filters: [],
                        filterGroups: [],
                        sort: [{field: "name", direction: "ASC"}],
                    }
                );

                if (!isActive) return;
                setBrands(data);
            } catch (error) {
                console.error("Failed to load brands:", error);
                if (isActive) {
                    setErrorMsg("Failed to load brands.");
                }
            } finally {
                if (isActive) {
                    setIsLoadingBrands(false);
                }
            }
        };

        void fetchBrands();

        return () => {
            isActive = false;
        };
    }, []);

    useEffect(() => {
        let isActive = true;

        if (!selectedBrandId) {
            setProducts([]);
            return () => {
                isActive = false;
            };
        }

        const fetchProducts = async () => {
            try {
                setIsLoadingProducts(true);
                setErrorMsg("");

                const data = await apiGetProductListByBrand(
                    selectedBrandId,
                    {pageIndex: 0, pageSize: PRODUCTS_PAGE_SIZE},
                    {
                        filters: [],
                        filterGroups: [],
                        sort: [{field: "name", direction: "ASC"}],
                    }
                );

                if (!isActive) return;
                setProducts(data);
            } catch (error) {
                console.error("Failed to load products by brand:", error);
                if (isActive) {
                    setErrorMsg("Failed to load products for the selected brand.");
                }
            } finally {
                if (isActive) {
                    setIsLoadingProducts(false);
                }
            }
        };

        void fetchProducts();

        return () => {
            isActive = false;
        };
    }, [selectedBrandId]);

    const brandOptions = useMemo(
        () => brands.map((brand) => ({value: brand.id, label: brand.name})),
        [brands]
    );

    const columns: ColumnDef<ProductListItem>[] = useMemo(() => [
        {
            id: "imageName",
            accessorKey: "",
            header: "",
            cell: ({row}) =>
                row.original.imageName ? (
                    <img
                        src={`${IMAGE_THUMBNAIL_URL}${row.original.imageName}`}
                        alt="Preview"
                        className="h-10 w-10 rounded object-cover"
                    />
                ) : (
                    <div className="h-10 w-10 rounded bg-gray-100"/>
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
            header: "Variations",
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
            id: "actions",
            header: "Actions",
            enableSorting: false,
            cell: ({row}) => (
                <div className="flex items-start justify-center gap-2">
                    <Button
                        variant="solid"
                        size="sm"
                        onClick={() => navigate(`/admin/product/detail/${row.original.id}`)}
                    >
                        <PenLine size={12}/>
                    </Button>
                </div>
            ),
        },
    ], [navigate]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Products By Brand</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <Select
                    label="Brand"
                    options={brandOptions}
                    value={selectedBrandId}
                    onChange={setSelectedBrandId}
                    placeholder={isLoadingBrands ? "Loading brands..." : "Select brand"}
                    disabled={isLoadingBrands}
                />
            </div>

            <DataTable
                data={products}
                columns={columns}
                isLoading={isLoadingProducts || isLoadingBrands}
                errorMsg={errorMsg}
                globalSearchPlaceholder="Search within loaded brand products..."
                emptyMessage={selectedBrandId ? "No products found for this brand." : "Select a brand to view products."}
            />
        </div>
    );
};

export default ProductBrandList;

