import {ColumnDef} from "@tanstack/react-table";
import {PenLine} from "lucide-react";
import {useEffect, useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";


import {Button, Checkbox, Select} from "@/components";
import {DataTable} from "@/components/shared/datatable/DataTable.tsx";
import {IMAGE_THUMBNAIL_URL} from "@/constants/api.constant.ts";
import {apiGetAllCategories} from "@/services/graphql/admin/category/CategoryService.graphql.ts";
import {apiGetProductList} from "@/services/graphql/product/product.service.ts";

import type {Category} from "@/types/admin/CategoryTypes.ts";
import type {ProductListItem} from "@/types/admin/ProductTypes.ts";


const CATEGORY_PAGE_SIZE = 500;
const PRODUCTS_PAGE_SIZE = 500;

const ProductCategoryList = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [includeSubCategories, setIncludeSubCategories] = useState(true);
    const [products, setProducts] = useState<ProductListItem[]>([]);
    const [isLoadingCategories, setIsLoadingCategories] = useState(false);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        let isActive = true;

        const fetchCategories = async () => {
            try {
                setIsLoadingCategories(true);
                const data = await apiGetAllCategories(
                    {pageIndex: 0, pageSize: CATEGORY_PAGE_SIZE},
                    {
                        filters: [],
                        filterGroups: [],
                        sort: [{field: "name", direction: "ASC"}],
                    },
                    false
                );

                if (!isActive) return;
                setCategories(data);
            } catch (error) {
                console.error("Failed to load categories:", error);
                if (isActive) {
                    setErrorMsg("Failed to load categories.");
                }
            } finally {
                if (isActive) {
                    setIsLoadingCategories(false);
                }
            }
        };

        void fetchCategories();

        return () => {
            isActive = false;
        };
    }, []);

    useEffect(() => {
        let isActive = true;

        if (!selectedCategoryId) {
            setProducts([]);
            return () => {
                isActive = false;
            };
        }

        const fetchProducts = async () => {
            try {
                setIsLoadingProducts(true);
                setErrorMsg("");

                const data = await apiGetProductList(
                    selectedCategoryId,
                    {pageIndex: 0, pageSize: PRODUCTS_PAGE_SIZE},
                    {
                        filters: [],
                        filterGroups: [],
                        sort: [{field: "name", direction: "ASC"}],
                    },
                    includeSubCategories,
                );

                if (!isActive) return;
                setProducts(data);
            } catch (error) {
                console.error("Failed to load products by category:", error);
                if (isActive) {
                    setErrorMsg("Failed to load products for the selected category.");
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
    }, [selectedCategoryId, includeSubCategories]);

    const categoryOptions = useMemo(
        () => categories.map((category) => ({value: category.id, label: category.name})),
        [categories]
    );

    const columns: ColumnDef<ProductListItem>[] = useMemo(() => [
        {
            id: "imageName",
            accessorKey: "",
            header: "",
            cell: ({row}) => (
                <img
                    src={`${IMAGE_THUMBNAIL_URL}${row.original.imageName}`}
                    alt="Preview"
                    className="h-10 w-10 rounded object-cover"
                />
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
                <h1 className="text-2xl font-bold">Products By Category</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <Select
                    label="Category"
                    options={categoryOptions}
                    value={selectedCategoryId}
                    onChange={setSelectedCategoryId}
                    placeholder={isLoadingCategories ? "Loading categories..." : "Select category"}
                    disabled={isLoadingCategories}
                />
                <div className="md:col-span-2 pb-2">
                    <Checkbox
                        checked={includeSubCategories}
                        onChange={setIncludeSubCategories}
                        label="Include subcategories"
                        disabled={!selectedCategoryId}
                    />
                </div>
            </div>

            <DataTable
                data={products}
                columns={columns}
                isLoading={isLoadingProducts || isLoadingCategories}
                errorMsg={errorMsg}
                globalSearchPlaceholder="Search within loaded category products..."
                emptyMessage={selectedCategoryId ? "No products found for this category." : "Select a category to view products."}
            />
        </div>
    );
};

export default ProductCategoryList;

