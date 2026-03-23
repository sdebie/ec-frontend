import { useEffect, useState } from "react";
import { ColumnDef, createColumnHelper } from "@tanstack/react-table";
import { DataTable } from "@/components/shared/datatable/DataTable";
import { getAllCategories, CategoryData } from "@/services/CatagoryService";

const CategoryList = () => {

    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setIsLoading(true);
                const data = await getAllCategories();
                setCategories(data);
            } catch (error) {
                console.error("Failed to fetch categories:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchCategories();
    }, []);

    const columnHelper = createColumnHelper<CategoryData>();

    const columns: ColumnDef<CategoryData, any>[] = [
        columnHelper.accessor("id", {
            header: "ID",
            cell: (info) => info.getValue(),
        }),
        columnHelper.accessor("name", {
            header: "Name",
            cell: (info) => info.getValue(),
        }),
        columnHelper.accessor("description", {
            header: "Description",
            cell: (info) => info.getValue() || "-",
        }),
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Categories</h1>
            <DataTable
                data={categories}
                columns={columns}
                isLoading={isLoading}
                globalSearchPlaceholder="Search categories..."
            />
        </div>
    );
}

export default CategoryList;