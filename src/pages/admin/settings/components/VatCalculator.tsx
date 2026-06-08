import {useMemo, useState} from "react";
import {InputField} from "@/components";
import {formatAmount} from "@/utils/formatAmount.ts";
import {calculateVatFromExclusive} from "@/utils/vat.ts";

type VatCalculatorProps = {
    vatRatePercent: number;
};

const VatCalculator = ({vatRatePercent}: VatCalculatorProps) => {
    const [baseAmountInput, setBaseAmountInput] = useState("");

    const baseAmount = useMemo(() => {
        const parsed = Number.parseFloat(baseAmountInput);
        return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
    }, [baseAmountInput]);

    const result = useMemo(
        () => calculateVatFromExclusive(baseAmount, vatRatePercent),
        [baseAmount, vatRatePercent]
    );

    return (
        <div className="rounded-lg border border-admin-border bg-admin-sidebar p-4 space-y-3">
            <p className="text-sm font-medium text-admin-text">VAT Calculator</p>
            <InputField
                type="number"
                min="0"
                step="0.01"
                label="Excluding VAT amount"
                placeholder="0.00"
                value={baseAmountInput}
                onChange={(event) => setBaseAmountInput(event.target.value)}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                <div className="rounded-md border border-admin-border p-3">
                    <p className="text-admin-text-muted">VAT ({result.vatRatePercent}%)</p>
                    <p className="font-semibold text-admin-text">{formatAmount(result.vatAmount)}</p>
                </div>
                <div className="rounded-md border border-admin-border p-3">
                    <p className="text-admin-text-muted">Excluding VAT</p>
                    <p className="font-semibold text-admin-text">{formatAmount(result.baseAmount)}</p>
                </div>
                <div className="rounded-md border border-admin-border p-3">
                    <p className="text-admin-text-muted">Including VAT</p>
                    <p className="font-semibold text-admin-text">{formatAmount(result.totalIncludingVat)}</p>
                </div>
            </div>
        </div>
    );
};

export default VatCalculator;

