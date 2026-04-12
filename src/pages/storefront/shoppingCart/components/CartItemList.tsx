import CartItemRow from './CartItemRow';
import {OrderItemsData} from "@/pages/shop/default/cart/types.ts";

type CartItemListProps = {
    items: OrderItemsData[];
    onQuantityChange: (index: number, quantity: number) => void;
    onRemove: (index: number) => void;
};

function CartItemList({items, onQuantityChange, onRemove}: CartItemListProps) {

    return (
        <section aria-labelledby="cart-heading" className="lg:col-span-7">
            <h2 id="cart-heading" className="sr-only">
                Items in your shopping cart
            </h2>

            <ul role="list" className="divide-y divide-gray-200 border-t border-b border-gray-200">
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

export default CartItemList;