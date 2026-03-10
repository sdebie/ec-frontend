import {useNavigate} from "react-router-dom";
import {Button, DataTable} from "@/components";
import {useEffect, useMemo, useState} from "react";
import {ColumnDef} from "@tanstack/react-table";
import {getProductUploadBatches, ProductUploadBatch} from "@/services/ProductService.ts";
import {PenLine, Plus} from "lucide-react";

const BulkProductUploadList = () => {

    const [productUploadList, setProductUploadList] = useState<ProductUploadBatch[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProductUploadList = async () => {
            try {
                setIsLoading(true);
                const data = await getProductUploadBatches();
                setProductUploadList(data);
            } catch (error) {
                console.error("Failed to fetch product upload List:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProductUploadList();
    }, []);

    const handleDetail = (row: ProductUploadBatch) => {
        navigate(`/admin/imports/products/bulk-upload/review/${row.id}`);
    }

    const columns: ColumnDef<ProductUploadBatch>[] = useMemo(() => [
        {
            id: 'id',
            accessorKey: 'id',
            header: 'id',
            enableSorting: true,
        },
        {
            id: 'filename',
            accessorKey: 'filename',
            header: 'Filename',
            enableSorting: true,
        },
        {
            id: 'status',
            accessorKey: 'status',
            header: 'Status',
            enableSorting: true,
        },
        {
            id: 'totalRows',
            accessorKey: 'totalRows',
            header: 'Rows',
            enableSorting: true,
        },
        {
            id: 'createdAt',
            accessorKey: 'createdAt',
            header: 'Created At',
            enableSorting: true,
        },
        {
            id: 'uploadedByUsername',
            accessorKey: 'uploadedByUsername',
            header: 'Uploaded By',
            enableSorting: true,
        },
        {
            id: 'actions',
            header: 'Actions',
            enableSorting: false,
            cell: (props) => (
                <div className={"flex items-start justify-center"}>
                    <Button variant="solid" size={"sm"} onClick={() => handleDetail(props.row.original)}>
                        <PenLine size={12}/>
                    </Button>
                </div>
            )
        }
    ], []);

     const bulkUpload = async () => {
         navigate("/admin/imports/products/bulk-upload");
     };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Product Upload List</h1>
            <DataTable
                data={productUploadList}
                columns={columns}
                isLoading={isLoading}
                toolbarAction={
                    <Button onClick={bulkUpload} leftIcon={<Plus size={16}/>}>
                        Upload Products
                    </Button>
                }
            />
        </div>
    );
}

export default BulkProductUploadList;
