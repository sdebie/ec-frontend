import CartItemRow from '@/features/cart/CartItemRow.tsx';
import type {CartItem} from '@/features/cart/types.ts';

type CartItemListProps = {
    items: CartItem[];
    onQuantityChange: (index: number, quantity: number) => void;
    onRemove: (index: number) => void;
};

export default function CartItemList({items, onQuantityChange, onRemove}: CartItemListProps) {
    return (
        <section
            aria-labelledby="cart-heading"
            className="rounded-2xl border border-(--sf-border) bg-(--sf-panel) shadow-sm p-6 lg:flex lg:h-full lg:flex-col lg:min-h-0"
        >
            <ul role="list" className="cart-item-list divide-y divide-(--sf-border) lg:flex-1 lg:min-h-0 lg:overflow-y-scroll lg:pr-4 lg:-mr-3">
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
