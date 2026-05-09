import {ColumnDef} from "@tanstack/react-table";
import {Eye, LoaderCircle, Plus, RefreshCw, Upload} from "lucide-react";
import {useCallback, useEffect, useMemo, useState} from "react";
import {useNavigate} from "react-router-dom";


import {Button, DataTable} from "@/components";
import {apiGetProductPriceUploadBatches} from "@/services/graphql/admin/product/ProductPriceImportService.graphql.ts";
import {exportProductsPrice} from "@/services/rest/admin/ProductExportService.rest.ts";
import {getProductPriceUploadBatchProcessStatus} from "@/services/rest/admin/ProductPriceUploadService.rest.ts";

import type {ProductUploadBatch} from "@/types/admin/ProductTypes.ts";

const BulkProductUploadList = () => {

    const [productPriceUploadList, setProductPriceUploadList] = useState<ProductUploadBatch[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isExporting, setIsExporting] = useState(false);
    const [refreshingBatchIds, setRefreshingBatchIds] = useState<string[]>([]);
    const navigate = useNavigate();

    const onExportProductsPrice = useCallback(async () => {
        try {
            setIsExporting(true);
            await exportProductsPrice();
        } finally {
            setIsExporting(false);
        }
    }, []);

    useEffect(() => {
        const fetchProductPriceUploadList = async () => {
            try {
                setIsLoading(true);
                const data = await apiGetProductPriceUploadBatches();
                setProductPriceUploadList(data);
            } catch (error) {
                console.error("Failed to fetch product price upload List:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchProductPriceUploadList();
    }, []);

    const handleDetail = (row: ProductUploadBatch) => {
        navigate(`/admin/imports/products/price/bulk-upload/review/${row.id}`);
    };

    const handleRefreshStatus = async (row: ProductUploadBatch) => {
        if (!row.id || refreshingBatchIds.includes(row.id)) {
            return;
        }

        try {
            setRefreshingBatchIds((current) => [...current, row.id]);
            const status = await getProductPriceUploadBatchProcessStatus(row.id);

            setProductPriceUploadList((current) => current.map((batch) => (
                batch.id === row.id
                    ? {
                        ...batch,
                        status: status.status,
                        totalRows: status.totalRows,
                        stagedRows: status.stagedRows,
                        processedRows: status.processedRows,
                        skippedRows: status.skippedRows,
                        validationErrorCount: status.validationErrorCount,
                        completed: status.completed,
                    }
                    : batch
            )));
        } catch (error) {
            console.error(`Failed to refresh product price upload batch status for ${row.id}:`, error);
        } finally {
            setRefreshingBatchIds((current) => current.filter((id) => id !== row.id));
        }
    };

    const columns: ColumnDef<ProductUploadBatch>[] = useMemo(() => [
        {
            id: 'createdAt',
            accessorKey: 'createdAt',
            header: 'Created At',
            enableSorting: true,
        },
        {
            id: 'filename',
            accessorKey: 'filename',
            header: 'Filename',
            enableSorting: true,
        },
        {
            id: 'totalRows',
            accessorKey: 'totalRows',
            header: 'Rows',
            enableSorting: true,
        },
        {
            id: 'processedRows',
            accessorKey: 'processedRows',
            header: 'Processed',
            enableSorting: true,
            cell: (props) => props.row.original.processedRows ?? 0,
        },
        {
            id: 'skippedRows',
            accessorKey: 'skippedRows',
            header: 'Skipped',
            enableSorting: true,
            cell: (props) => props.row.original.skippedRows ?? 0,
        },
        {
            id: 'validationErrorCount',
            accessorKey: 'validationErrorCount',
            header: () => <div>Validation<br /><div className={"text-[10px]"}>Errors</div></div>,
            enableSorting: true,
            cell: (props) => props.row.original.validationErrorCount ?? 0,
        },
        {
            id: 'uploadedByUsername',
            accessorKey: 'uploadedByUsername',
            header: 'Uploaded By',
            enableSorting: true,
        },
        {
            id: 'status',
            accessorKey: 'status',
            header: 'Status',
            enableSorting: true,
            cell: (props) => {
                const row = props.row.original;
                const isProcessing = row.status === 'PROCESSING';
                const processedRows = row.processedRows ?? 0;
                const skippedRows = row.skippedRows ?? 0;
                const totalRows = row.totalRows ?? 0;

                return (
                    <div className="flex flex-col">
                        <span>{row.status}</span>
                        {isProcessing && totalRows > 0 && (
                            <span className="text-xs text-admin-text-muted">
                                {processedRows} processed / {skippedRows} skipped / {totalRows} total
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            id: 'actions',
            header: 'Actions',
            enableSorting: false,
            cell: (props) => {
                const row = props.row.original;
                const isRefreshing = refreshingBatchIds.includes(row.id);

                return (
                    <div className={"flex items-start justify-center gap-2"}>
                        <Button variant="solid" size={"sm"} onClick={() => handleDetail(row)}>
                            <Eye size={12}/>
                        </Button>
                        <Button variant="solid" size={"sm"} onClick={() => handleRefreshStatus(row)} disabled={isRefreshing}>
                            {isRefreshing ? <LoaderCircle size={12} className="animate-spin"/> : <RefreshCw size={12}/>}
                        </Button>
                    </div>
                );
            }
        }
    ], [refreshingBatchIds]);

     const bulkUpload = async () => {
         navigate("/admin/imports/products/price/bulk-upload");
     };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Product Price Upload List</h1>
            <DataTable
                data={productPriceUploadList}
                columns={columns}
                isLoading={isLoading}
                toolbarAction={
                    <div className={"flex items-center gap-2"}>
                        <Button
                            variant={"outline"}
                            leftIcon={<Upload size={16}/>}
                            onClick={() => onExportProductsPrice().catch(() => {
                                console.error("Failed to export products prices.");
                                window.alert("Failed to export products prices. Please try again.");
                            })}
                            disabled={isExporting}
                        >
                            {isExporting ? "Exporting..." : "Export Prices"}
                        </Button>
                        <Button onClick={bulkUpload} leftIcon={<Plus size={16}/>}>
                            Upload Products Prices
                        </Button>
                    </div>
                }
            />
        </div>
    );
}

export default BulkProductUploadList;
