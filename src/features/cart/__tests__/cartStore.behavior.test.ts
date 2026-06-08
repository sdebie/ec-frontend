import {beforeEach, describe, expect, it, vi} from 'vitest';
import {cartStore} from '@/features/cart/cartStore.ts';
import type {OrderData, OrderItemData} from '@/types/order.types.ts';

beforeEach(() => {
    localStorage.clear();
    cartStore.clear();
});

describe('cartStore', () => {
    it('subscribe + setItems round-trip notifies listeners and updates getItemCount()', () => {
        const listener = vi.fn();
        const unsub = cartStore.subscribe(listener);
        const items: OrderItemData[] = [
            {quantity: 2, unitPrice: 10, variant: 'variant-a'},
            {quantity: 1, unitPrice: 5, variant: 'variant-b'},
        ];

        cartStore.setItems(items);

        expect(listener).toHaveBeenCalled();
        expect(cartStore.getItemCount()).toBe(3);
        unsub();
    });

    it('mergeItems merges duplicate variants by id and sums quantities', () => {
        cartStore.setItems([{quantity: 1, unitPrice: 10, variant: 'v1'}]);

        const merged = cartStore.mergeItems({
            items: [
                {quantity: 2, unitPrice: 10, variant: 'v1'},
                {quantity: 1, unitPrice: 22, variant: 'v2'},
            ],
        } as OrderData);

        expect(merged.items?.length).toBe(2);
        const q1 = merged.items?.find((i) => i.variant === 'v1')?.quantity;
        const q2 = merged.items?.find((i) => i.variant === 'v2')?.quantity;
        expect(q1).toBe(3);
        expect(q2).toBe(1);
        expect(cartStore.getItemCount()).toBe(4);
    });

    it('unsubscribe removes listener so later mutations do not notify', () => {
        const listener = vi.fn();
        const unsub = cartStore.subscribe(listener);
        unsub();

        cartStore.setItems([{quantity: 1, unitPrice: 1, variant: 'x'}]);

        expect(listener).not.toHaveBeenCalled();
    });
});
