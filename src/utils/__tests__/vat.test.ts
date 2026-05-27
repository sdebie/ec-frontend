import { describe, expect, it } from "vitest";

import { calculateVatFromExclusive, parseVatRate } from "@/utils/vat.ts";

describe("VAT utilities", () => {
    it("parses numeric VAT rates safely", () => {
        expect(parseVatRate("15")).toBe(15);
        expect(parseVatRate("-4")).toBe(0);
        expect(parseVatRate("bad")).toBe(0);
    });

    it("calculates VAT and total from an ex-VAT base amount", () => {
        const result = calculateVatFromExclusive(100, 15);

        expect(result.baseAmount).toBe(100);
        expect(result.vatAmount).toBe(15);
        expect(result.totalIncludingVat).toBe(115);
    });

    it("rounds VAT values to 2 decimals", () => {
        const result = calculateVatFromExclusive(99.99, 15);

        expect(result.vatAmount).toBe(15);
        expect(result.totalIncludingVat).toBe(114.99);
    });
});

