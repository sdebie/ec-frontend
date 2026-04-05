import { type ReactNode } from "react";
import { Button } from "@/components";
import { Dialog, DialogContent, DialogFooter, DialogHeader } from "@/components/shared/dialog/Dialog.tsx";
import { ProductUploadStaged } from "@/types/admin/ProductTypes.ts";

interface ProductImportRowDetailDialogProps {
    selectedRow: ProductUploadStaged | null;
    onClose: () => void;
}

const ProductImportRowDetailDialog = ({ selectedRow, onClose }: ProductImportRowDetailDialogProps) => {
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
        return <span className="whitespace-pre-wrap wrap-break-word text-xs leading-5">{value}</span>;
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

    return (
        <Dialog open={!!selectedRow} onClose={onClose} size="full">
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
                <Button variant="ghost" onClick={onClose}>Close</Button>
            </DialogFooter>
        </Dialog>
    );
};

export default ProductImportRowDetailDialog;

