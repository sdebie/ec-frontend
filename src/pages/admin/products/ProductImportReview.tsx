import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { Button, DataTable } from "@/components";
import { getProductImportRows, ProductUploadStaged } from "@/services/ProductService.ts";

const ProductImportReview = () => {
    const { batchId } = useParams();
    const navigate = useNavigate();

    const [stagedData, setStagedData] = useState<ProductUploadStaged[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchImportRows = async () => {
            try {
                setIsLoading(true);

                if (!batchId) {
                    setStagedData([]);
                    return;
                }

                const data = await getProductImportRows(batchId);
                setStagedData(data);
            } catch (error) {
                console.error("Failed to fetch product import rows:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchImportRows();
    }, [batchId]);

    const handleApprove = async () => {
        // TODO: wire up approve mutation/API when backend endpoint is available.
    };

    const formatCurrency = (value?: number | null) => {
        if (value === null || value === undefined) return "-";
        return `R${Number(value).toFixed(2)}`;
    };

    const columns: ColumnDef<ProductUploadStaged>[] = useMemo(() => [
        {
            id: "sku",
            accessorKey: "sku",
            header: "SKU",
            enableSorting: true,
            cell: (props) => <span className="font-mono text-blue-400">{props.row.original.sku}</span>,
        },
        {
            id: "name",
            header: "Name",
            enableSorting: false,
            cell: (props) => {
                const row = props.row.original;
                const showCurrent = !row.isNewProduct && row.currentName && row.currentName !== row.proposedName;

                return (
                    <div className="flex flex-col">
                        <span className="text-admin-text">{row.proposedName || "-"}</span>
                        {showCurrent && (
                            <span className="text-xs text-admin-text-muted line-through">{row.currentName}</span>
                        )}
                    </div>
                );
            },
        },
        {
            id: "retailPrice",
            header: "Retail Price",
            enableSorting: false,
            cell: (props) => {
                const row = props.row.original;
                const showCurrent = !row.isNewProduct && row.currentRetailPrice !== row.proposedRetailPrice;

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
            header: "Wholesale Price",
            enableSorting: false,
            cell: (props) => {
                const row = props.row.original;
                const showCurrent = !row.isNewProduct && row.currentWholesalePrice !== row.proposedWholesalePrice;

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
            accessorFn: (row) => (row.isNewProduct ? "NEW" : row.hasChanges ? "UPDATE" : "NO_CHANGE"),
            enableSorting: true,
            cell: (props) => {
                const row = props.row.original;

                if (row.isNewProduct) {
                    return (
                        <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-[10px] font-bold">
                            NEW
                        </span>
                    );
                }

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
    ], []);

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">
                Review Changes (Batch: {batchId?.slice(0, 8) || "N/A"})
            </h1>

            <DataTable
                data={stagedData}
                columns={columns}
                isLoading={isLoading}
                highlightRows={true}
                globalSearchPlaceholder="Search by SKU or name..."
                toolbarAction={
                    <div className="flex gap-2">
                        <Button onClick={() => navigate(-1)} className="bg-slate-700">
                            Cancel
                        </Button>
                        <Button onClick={handleApprove} className="bg-green-600 font-bold">
                            Apply All Changes
                        </Button>
                    </div>
                }
            />
        </div>
    );
};

export default ProductImportReview;
