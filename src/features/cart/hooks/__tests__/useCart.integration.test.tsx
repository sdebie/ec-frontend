import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';


import { cartStore } from '@/features/cart/cartStore.ts';
import { useCart } from '@/features/cart/hooks/useCart.ts';

import type { CartItem } from '@/features/cart/types.ts';

vi.mock('@/services/graphql/product/product.service.ts', () => ({
    fetchVariantsByIds: vi.fn(async () => []),
}));

describe('useCart', () => {
    it('updates hook state when cartStore mutates cart lines', async () => {
        cartStore.clear();

        const { result } = renderHook(() => useCart());

        await waitFor(() => {
            expect(result.current.items.length).toBe(0);
        });

        const nextItems: CartItem[] = [
            {
                quantity: 2,
                unitPrice: 15,
                variant: 'variant-1',
            },
        ];

        cartStore.setItems(nextItems);

        await waitFor(() => {
            expect(result.current.itemCount).toBe(2);
            expect(result.current.hasItems).toBe(true);
            expect(result.current.items.length).toBeGreaterThan(0);
        });
    });
});
