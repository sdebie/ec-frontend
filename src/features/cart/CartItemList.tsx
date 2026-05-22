import CartItemRow from '@/features/cart/CartItemRow.tsx';

import type { CartItem } from '@/features/cart/types.ts';


type CartItemListProps = {
    items: CartItem[];
    onQuantityChange: (index: number, quantity: number) => void;
    onRemove: (index: number) => void;
};

export default function CartItemList({ items, onQuantityChange, onRemove }: CartItemListProps) {
    return (
        <section aria-labelledby="cart-heading">
            <h2 id="cart-heading" className="sr-only">
                Items in your shopping cart
            </h2>

            <ul role="list" className="divide-y divide-(--sf-border)">
                {items.map((item, index) => (
                    <CartItemRow
                        key={typeof item.variant === 'string' ? `${item.variant}-${index}` : item.variant?.id ?? index}
                        item={item}
                        index={index}
                        onQuantityChange={onQuantityChange}
                        onRemove={onRemove}
                    />
                ))}
            </ul>
        </section>
    );
}
