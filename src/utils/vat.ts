export type VatCalculation = {
    baseAmount: number;
    vatRatePercent: number;
    vatAmount: number;
    totalIncludingVat: number;
};

function roundCurrency(value: number): number {
    return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function parseVatRate(value?: string | number | null): number {
    const numeric = typeof value === "string" ? Number.parseFloat(value) : Number(value ?? 0);
    if (!Number.isFinite(numeric) || numeric < 0) {
        return 0;
    }
    return numeric;
}

export function calculateVatFromExclusive(baseAmount: number, vatRatePercent: number): VatCalculation {
    const safeBaseAmount = Number.isFinite(baseAmount) && baseAmount > 0 ? baseAmount : 0;
    const safeVatRate = parseVatRate(vatRatePercent);
    const vatAmount = roundCurrency((safeBaseAmount * safeVatRate) / 100);

    return {
        baseAmount: roundCurrency(safeBaseAmount),
        vatRatePercent: safeVatRate,
        vatAmount,
        totalIncludingVat: roundCurrency(safeBaseAmount + vatAmount),
    };
}

