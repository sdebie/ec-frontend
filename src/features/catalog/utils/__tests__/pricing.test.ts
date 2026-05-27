import { describe, expect, it } from 'vitest';

import { getDisplayPrice } from '@/features/catalog/utils/pricing.ts';

import type { ProductShoppingListItem } from '@/types/admin/ProductTypes.ts';


function vp(price: number) {
    return { id: 'p', price };
}

describe('getDisplayPrice', () => {
    it('retail + sale price → sale price + retail as originalPrice', () => {
        const product: ProductShoppingListItem = {
            id: '1',
            name: 'Test',
            retailPrice: vp(100),
            retailSalePrice: vp(80),
            wholesalePrice: vp(50),
            wholesaleSalePrice: vp(45),
        };
        const result = getDisplayPrice(product, 'retail');
        expect(result.price).toBe(80);
        expect(result.originalPrice).toBe(100);
    });

    it('wholesale + no sale → wholesale, no originalPrice', () => {
        const product: ProductShoppingListItem = {
            id: '1',
            name: 'Test',
            retailPrice: vp(100),
            wholesalePrice: vp(50),
        };
        const result = getDisplayPrice(product, 'wholesaler');
        expect(result.price).toBe(50);
        expect(result.originalPrice).toBeUndefined();
    });

    it('wholesale customer with no wholesale price set → returns 0', () => {
        const product: ProductShoppingListItem = {
            id: '1',
            name: 'Test',
            retailPrice: vp(100),
            retailSalePrice: vp(90),
        };
        const result = getDisplayPrice(product, 'wholesaler');
        expect(result.price).toBe(0);
    });
});
