import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { Button, DataTable } from "@/components";
import { getProductImportRows, processProductUploadBatch, ProductUploadStaged } from "@/services/ProductService.ts";
import { PenLine } from "lucide-react";
import { getProductImportValidationStatus } from "@/constants/enums/ProductImportValidationStatus.ts";
import ProductImportRowDetailDialog from "./comonents/ProductImportRowDetailDialog.tsx";

const ProductImportReview = () => {
    const { batchId } = useParams();
    const navigate = useNavigate();

    const [stagedData, setStagedData] = useState<ProductUploadStaged[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRow, setSelectedRow] = useState<ProductUploadStaged | null>(null);
    const [isApproving, setIsApproving] = useState(false);

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
        if (!batchId || isApproving) {
            return;
        }

        try {
            setIsApproving(true);
            await processProductUploadBatch(batchId);
            navigate("/admin/imports/products/list", { replace: true });
        } catch (error) {
            console.error("Failed to start product upload batch processing:", error);
        } finally {
            setIsApproving(false);
        }
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
            cell: (props) => {
                const row = props.row.original;

                return (
                    <div className="flex flex-col">
                        <span className="text-admin-text">{row.sku || "-"}</span>
                        {row.isNewVariant && (
                            <span className="ext-xs text-admin-text-muted line-through">
                                NEW
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            id: "name",
            header: "Product",
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
                        {row.isNewProduct && (
                            <span className="ext-xs text-admin-text-muted line-through">
                                NEW
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            id: "retailPrice",
            header: () => <div>Retail<br /><div className={"text-[10px]"}>Price</div></div>,
            enableSorting: false,
            cell: (props) => {
                const row = props.row.original;
                const showCurrent = !row.isNewVariant && row.currentRetailPrice !== row.proposedRetailPrice;

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
            id: "retailSalesPrice",
            header: () => <div>Retail<br /><div className={"text-[10px]"}>Sale Price</div></div>,
            enableSorting: false,
            cell: (props) => {
                const row = props.row.original;
                const showCurrent = !row.isNewVariant && row.currentRetailSalePrice !== row.proposedRetailSalePrice;

                return (
                    <div className="flex flex-col">
                        <span>{formatCurrency(row.proposedRetailSalePrice)}</span>
                        {showCurrent && (
                            <span className="text-xs text-yellow-500 line-through">
                                {formatCurrency(row.currentRetailSalePrice)}
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            id: "wholesalePrice",
            header: () => <div>Wholesale<br /><div className={"text-[10px]"}>Price</div></div>,
            enableSorting: false,
            cell: (props) => {
                const row = props.row.original;
                const showCurrent = !row.isNewVariant && row.currentWholesalePrice !== row.proposedWholesalePrice;

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
            id: "wholesaleSalesPrice",
            header: () => <div>Wholesale<br /><div className={"text-[10px]"}>Sale Price</div></div>,
            enableSorting: false,
            cell: (props) => {
                const row = props.row.original;
                const showCurrent = !row.isNewVariant && row.currentWholesaleSalePrice !== row.proposedWholesaleSalePrice;

                return (
                    <div className="flex flex-col">
                        <span>{formatCurrency(row.proposedWholesaleSalePrice)}</span>
                        {showCurrent && (
                            <span className="text-xs text-yellow-500 line-through">
                                {formatCurrency(row.currentWholesaleSalePrice)}
                            </span>
                        )}
                    </div>
                );
            },
        },
        {
            id: "status",
            header: "Status",
            accessorFn: (row) => ((row.isNewProduct || row.isNewVariant) ? "NEW" : row.hasChanges ? "UPDATE" : "NO_CHANGE"),
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
        {
            id: 'actions',
            header: 'Actions',
            enableSorting: false,
            cell: (props) => (
                <div className={"flex items-start justify-center"}>
                    <Button variant="solid" size={"sm"} onClick={() => setSelectedRow(props.row.original)}>
                        <PenLine size={12}/>
                    </Button>
                </div>
            )
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
                globalSearchPlaceholder="Search by SKU, name, category, brand, or validation status..."
                toolbarAction={
                    <div className="flex gap-2">
                        <Button onClick={() => navigate(-1)} className="bg-slate-700">
                            Cancel
                        </Button>
                        <Button onClick={handleApprove} className="bg-green-600 font-bold" disabled={isApproving || !batchId}>
                            {isApproving ? "Starting..." : "Apply All Changes"}
                        </Button>
                    </div>
                }
            />

            <ProductImportRowDetailDialog
                selectedRow={selectedRow}
                onClose={() => setSelectedRow(null)}
            />
        </div>
    );
};

export default ProductImportReview;
