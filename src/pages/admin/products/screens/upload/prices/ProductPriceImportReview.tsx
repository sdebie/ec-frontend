import {ColumnDef} from "@tanstack/react-table";
import {useEffect, useMemo, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";


import {Button, DataTable} from "@/components";
import {getProductImportValidationStatus} from "@/constants/enums/ProductImportValidationStatus.ts";
import {apiGetProductPriceImportRows} from "@/services/graphql/admin/product/ProductPriceImportService.graphql.ts";
import {processProductPriceUploadBatch} from "@/services/rest/admin/ProductPriceUploadService.rest.ts";
import type {ProductPriceUploadStaged} from "@/types/admin/ProductTypes.ts";

const ProductImportReview = () => {
    const {batchId} = useParams();
    const navigate = useNavigate();

    const [stagedData, setStagedData] = useState<ProductPriceUploadStaged[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isApproving, setIsApproving] = useState(false);

    useEffect(() => {
        const fetchImportRows = async () => {
            try {
                setIsLoading(true);

                if (!batchId) {
                    setStagedData([]);
                    return;
                }

                console.log("Received data...");
                const data = await apiGetProductPriceImportRows(batchId);
                setStagedData(data);
                console.log("Got Data data...");
            } catch (error) {
                console.error("Failed to fetch product price import rows:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchImportRows();
    }, [batchId]);

    const formatCurrency = (value?: number | null) => {
        if (value === null || value === undefined) return "-";
        return `R${Number(value).toFixed(2)}`;
    };

    const handleApprove = async () => {
        if (!batchId || isApproving) {
            return;
        }

        try {
            setIsApproving(true);
            await processProductPriceUploadBatch(batchId);
            navigate("/admin/imports/products/price/list", {replace: true});
        } catch (error) {
            console.error("Failed to start product upload batch processing:", error);
        } finally {
            setIsApproving(false);
        }
    };

    console.log("Received data:", stagedData);

    const columns: ColumnDef<ProductPriceUploadStaged>[] = useMemo(() => [
        {
            id: "sku",
            accessorKey: "sku",
            header: "SKU",
            enableSorting: true,
            cell: (props) => {
                const row = props.row.original;

                return (
                    <div className="flex flex-col">
                        <span className="text-admin-text">{row.sku || "-"}</span>
                    </div>
                );
            },
        },
        {
            id: "retailPrice",
            header: () => <div>Retail<br/>
                <div className={"text-[10px]"}>Price</div>
            </div>,
            enableSorting: false,
            cell: (props) => {
                const row = props.row.original;
                const showCurrent = row.currentRetailPrice !== row.proposedRetailPrice;

                return (
                    <div className="flex flex-col">
                        <span>{formatCurrency(row.proposedRetailPrice)}</span>
                        {showCurrent && (
                            <span className="text-xs text-yellow-500 line-through">
                                {formatCurrency(row.currentRetailPrice)}
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            id: "wholesalePrice",
            header: () => <div>Wholesale<br/>
                <div className={"text-[10px]"}>Price</div>
            </div>,
            enableSorting: false,
            cell: (props) => {
                const row = props.row.original;
                const showCurrent = row.currentWholesalePrice !== row.proposedWholesalePrice;

                return (
                    <div className="flex flex-col">
                        <span>{formatCurrency(row.proposedWholesalePrice)}</span>
                        {showCurrent && (
                            <span className="text-xs text-yellow-500 line-through">
                                {formatCurrency(row.currentWholesalePrice)}
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            id: "status",
            header: "Status",
            accessorFn: (row) => (row.hasChanges ? "UPDATE" : "NO_CHANGE"),
            enableSorting: true,
            cell: (props) => {
                const row = props.row.original;

                if (row.hasChanges) {
                    return (
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-[10px] font-bold">
                            UPDATE
                        </span>
                    );
                }

                return <span className="text-admin-text-muted">No Change</span>;
            },
        },
        {
            id: "validationStatus",
            header: "Valid",
            enableSorting: true,
            cell: (props) => {
                const row = props.row.original;

                if (!row.validationStatus) {
                    return <span className="text-admin-text-muted">N/A</span>;
                }

                const validStatus = getProductImportValidationStatus(String(row.validationStatus));
                return (
                    <span className={validStatus?.colorClass}>
                        {validStatus?.label}
                    </span>
                );
            },
        },
    ], []);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">
                Review Price Changes (Batch: {batchId?.slice(0, 8) || "N/A"})
            </h1>

            <DataTable
                data={stagedData}
                columns={columns}
                isLoading={isLoading}
                highlightRows={true}
                globalSearchPlaceholder="Search by SKU or validation status..."
                toolbarAction={
                    <div className="flex gap-2">
                        <Button onClick={() => navigate(-1)} className="bg-slate-700">
                            Cancel
                        </Button>
                        <Button onClick={handleApprove} className="bg-green-600 font-bold"
                                disabled={isApproving || !batchId}>
                            {isApproving ? "Starting..." : "Apply All Changes"}
                        </Button>
                    </div>
                }
            />

            {/*<ProductPriceImportRowDetailDialog*/}
            {/*    selectedRow={selectedRow}*/}
            {/*    onClose={() => setSelectedRow(null)}*/}
            {/*/>*/}
        </div>
    );
};

export default ProductImportReview;
