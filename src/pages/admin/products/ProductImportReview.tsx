import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ColumnDef } from "@tanstack/react-table";
import { Button, DataTable } from "@/components";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@/components/shared/dialog/Dialog.tsx";
import { getProductImportRows, ProductUploadStaged } from "@/services/ProductService.ts";
import {PenLine} from "lucide-react";
import {
    getProductImportValidationStatus
} from "@/constants/enums/ProductImportValidationStatus.ts";

const ProductImportReview = () => {
    const { batchId } = useParams();
    const navigate = useNavigate();

    const [stagedData, setStagedData] = useState<ProductUploadStaged[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRow, setSelectedRow] = useState<ProductUploadStaged | null>(null);

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

    const formatText = (value?: string | null) => {
        if (!value || !value.trim()) return "-";
        return value;
    };

    const formatValidity = (value?: boolean | null) => {
        if (value === null || value === undefined) return "-";
        return value ? "Valid" : "Invalid";
    };

    const renderValidityWithValue = (isValid?: boolean | null, value?: string | null): ReactNode => {
        const status = formatValidity(isValid);
        if (status === "-") return "-";

        if (isValid === false) {
            const formattedValue = formatText(value);
            return (
                <span className="text-red-400">
                    {formattedValue === "-" ? status : `${status} - ${formattedValue}`}
                </span>
            );
        }

        return formatText(value);
    };

    const valuesMatch = (current?: string | number | null, proposed?: string | number | null) => {
        const currentValue = typeof current === "string" ? current.trim() : current;
        const proposedValue = typeof proposed === "string" ? proposed.trim() : proposed;
        return currentValue === proposedValue;
    };

    const renderMultiline = (value?: string | null) => {
        if (!value || !value.trim()) return "-";
        return <span className="whitespace-pre-wrap break-words text-xs leading-5">{value}</span>;
    };

    const renderChangeTable = (
        title: string,
        rows: Array<{
            field: string;
            current: ReactNode;
            proposed: ReactNode;
            changed: boolean;
        }>,
        showCurrentValues: boolean,
    ) => (
        <div className="space-y-2">
            <h3 className="text-sm font-semibold text-admin-text">{title}</h3>
            <div className="overflow-x-auto rounded border border-admin-border">
                <table className="w-full text-sm">
                    <thead className="bg-admin-bg border-b border-admin-border">
                        <tr>
                            <th className="text-left p-2 w-1/4">Field</th>
                            {showCurrentValues && <th className="text-left p-2 w-3/8">Current</th>}
                            <th className="text-left p-2 w-3/8">Proposed</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row) => (
                            <tr key={row.field} className={showCurrentValues && row.changed ? "bg-slate-500/40" : ""}>
                                <td className="p-2 font-medium text-admin-text-muted">{row.field}</td>
                                {showCurrentValues && <td className="p-2 text-admin-text align-top">{row.current}</td>}
                                <td className="p-2 text-admin-text align-top">{row.proposed}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

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
        // {
        //     id: "categorySlug",
        //     accessorKey: "categorySlug",
        //     header: "Category",
        //     enableSorting: true,
        //     cell: (props) => <span className="text-admin-text">{props.row.original.categorySlug || "-"}</span>,
        // },
        // {
        //     id: "brandSlug",
        //     accessorKey: "brandSlug",
        //     header: "Brand",
        //     enableSorting: true,
        //     cell: (props) => <span className="text-admin-text">{props.row.original.brandSlug || "-"}</span>,
        // },
        {
            id: "retailPrice",
            header: "Retail Price",
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
            header: "Retail Sale Price",
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
            header: "Wholesale Price",
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
            header: "Wholesale Sale Price",
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
                const validStatus = getProductImportValidationStatus(row.validationStatus);
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
                        <Button onClick={handleApprove} className="bg-green-600 font-bold">
                            Apply All Changes
                        </Button>
                    </div>
                }
            />

            <Dialog open={!!selectedRow} onClose={() => setSelectedRow(null)} size="full">
                <DialogHeader
                    title={`Import Row Detail${selectedRow?.sku ? ` - ${selectedRow.sku}` : ""}`}
                    description="Review current and proposed values for product and variant updates."
                />
                <DialogContent className="space-y-4">
                    {selectedRow && (
                        <>
                            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-start">
                                <div className="space-y-4">
                                    {renderChangeTable(`Product Changes - ${selectedRow?.isNewProduct ? ` NEW` : "Update"}`, [
                                        {
                                            field: "Name",
                                            current: formatText(selectedRow.currentName),
                                            proposed: formatText(selectedRow.proposedName),
                                            changed: !valuesMatch(selectedRow.currentName, selectedRow.proposedName),
                                        },
                                        {
                                            field: "Category",
                                            current: renderValidityWithValue(selectedRow.isValidCategory, selectedRow.categorySlug),
                                            proposed: renderValidityWithValue(selectedRow.isValidCategory, selectedRow.categorySlug),
                                            changed: false,
                                        },
                                        {
                                            field: "Brand",
                                            current: renderValidityWithValue(selectedRow.isValidBrand, selectedRow.brandSlug),
                                            proposed: renderValidityWithValue(selectedRow.isValidBrand, selectedRow.brandSlug),
                                            changed: false,
                                        },
                                    ], !selectedRow.isNewProduct)}

                                    <div className="space-y-2">
                                        <h3 className="text-sm font-semibold text-admin-text">Images</h3>
                                        <div className="overflow-x-auto rounded border border-admin-border">
                                            <table className="w-full text-sm">
                                                <thead className="bg-admin-bg border-b border-admin-border">
                                                    <tr>
                                                        <th className="text-left p-2">Image</th>
                                                        <th className="text-left p-2 w-28">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {(() => {
                                                        const images = (selectedRow.proposedImages ?? "")
                                                            .split(/[\n,]/)
                                                            .map(s => s.trim())
                                                            .filter(Boolean);
                                                        const errors = (selectedRow.imageErrors ?? "")
                                                            .split(/[\n,]/)
                                                            .map(s => s.trim())
                                                            .filter(Boolean);

                                                        if (images.length === 0) {
                                                            return (
                                                                <tr>
                                                                    <td colSpan={2} className="p-2 text-admin-text-muted text-xs italic">No images</td>
                                                                </tr>
                                                            );
                                                        }

                                                        return images.map((img, i) => {
                                                            const name = img.split("/").pop() ?? img;
                                                            const hasError = errors.some(e => e.toLowerCase().includes(img.toLowerCase()) || img.toLowerCase().includes(e.toLowerCase()));
                                                            const isInvalid = hasError || (errors.length > 0 && images.length === 1);
                                                            return (
                                                                <tr key={i} className={isInvalid ? "bg-red-500/10" : ""}>
                                                                    <td className="p-2 text-admin-text text-xs truncate max-w-xs" title={img}>{name}</td>
                                                                    <td className="p-2">
                                                                        {isInvalid
                                                                            ? <span className="text-red-400 text-xs font-medium">Invalid</span>
                                                                            : <span className="text-green-400 text-xs font-medium">Valid</span>
                                                                        }
                                                                    </td>
                                                                </tr>
                                                            );
                                                        });
                                                    })()}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>

                                {renderChangeTable(`Variant Changes - ${selectedRow?.isNewVariant ? ` NEW` : "Update"}`, [
                                    {
                                        field: "SKU",
                                        current: formatText(selectedRow.sku),
                                        proposed: formatText(selectedRow.sku),
                                        changed: false,
                                    },
                                    {
                                        field: "Retail Price",
                                        current: formatCurrency(selectedRow.currentRetailPrice),
                                        proposed: formatCurrency(selectedRow.proposedRetailPrice),
                                        changed: !valuesMatch(selectedRow.currentRetailPrice, selectedRow.proposedRetailPrice),
                                    },
                                    {
                                        field: "Retail Sale Price",
                                        current: formatCurrency(selectedRow.currentRetailSalePrice),
                                        proposed: formatCurrency(selectedRow.proposedRetailSalePrice),
                                        changed: !valuesMatch(selectedRow.currentRetailSalePrice, selectedRow.proposedRetailSalePrice),
                                    },
                                    {
                                        field: "Wholesale Price",
                                        current: formatCurrency(selectedRow.currentWholesalePrice),
                                        proposed: formatCurrency(selectedRow.proposedWholesalePrice),
                                        changed: !valuesMatch(selectedRow.currentWholesalePrice, selectedRow.proposedWholesalePrice),
                                    },
                                    {
                                        field: "Wholesale Sale Price",
                                        current: formatCurrency(selectedRow.currentWholesaleSalePrice),
                                        proposed: formatCurrency(selectedRow.proposedWholesaleSalePrice),
                                        changed: !valuesMatch(selectedRow.currentWholesaleSalePrice, selectedRow.proposedWholesaleSalePrice),
                                    },
                                    {
                                        field: "Stock",
                                        current: selectedRow.currentStock ?? "-",
                                        proposed: selectedRow.proposedStock ?? "-",
                                        changed: !valuesMatch(selectedRow.currentStock, selectedRow.proposedStock),
                                    },
                                    {
                                        field: "Attributes",
                                        current: renderMultiline(selectedRow.currentAttributes),
                                        proposed: renderMultiline(selectedRow.proposedAttributes),
                                        changed: !valuesMatch(selectedRow.currentAttributes, selectedRow.proposedAttributes),
                                    },
                                ], !selectedRow.isNewVariant)}
                            </div>

                            <div>
                                <p className="text-admin-text-muted text-xs mb-1">Validation Status</p>
                                <div className="bg-admin-bg border border-admin-border rounded p-2 text-sm">
                                    {selectedRow.validationStatus || "PENDING"}
                                </div>
                            </div>

                            <div>
                                <p className="text-admin-text-muted text-xs mb-1">Validation Errors</p>
                                <div className="bg-admin-bg border border-admin-border rounded p-2 text-red-300">
                                    {renderMultiline(selectedRow.validationErrors)}
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setSelectedRow(null)}>Close</Button>
                </DialogFooter>
            </Dialog>
        </div>
    );
};

export default ProductImportReview;
