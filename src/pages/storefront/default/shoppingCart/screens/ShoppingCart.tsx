import {useNavigate} from 'react-router-dom';
import EmptyCart from '../components/EmptyCart.tsx';
import CartItemList from '../components/CartItemList.tsx';
import CartSummary from '../components/CartSummary.tsx';
import {useShoppingCart} from "@/pages/storefront/default/shoppingCart/hooks/useShoppingCart.ts";

function ShoppingCart() {

    const navigate = useNavigate();

    const {
        items,
        hasItems,
        itemCount,
        subtotal,
        placingOrder,
        updateQuantity,
        removeItem,
        clearCart,
        checkout,
    } = useShoppingCart();

    return (
        <div className="bg-white min-h-screen">
            <div className="mx-auto max-w-2xl px-4 pt-16 pb-24 sm:px-6 lg:max-w-7xl lg:px-8">
                <div className="flex items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-(--sf-text) sm:text-4xl">
                            Shopping Cart
                        </h1>

                        <p className="mt-2 text-sm text-(--sf-muted-text)">
                            {hasItems
                                ? `${itemCount} item${itemCount === 1 ? '' : 's'} ready for checkout.`
                                : 'Review your selected items before checkout.'}
                        </p>
                    </div>
                </div>

                {!hasItems ? (
                    <EmptyCart onBrowse={() => navigate('/products')}/>
                ) : (
                    <form
                        className="mt-12 lg:grid lg:grid-cols-12 lg:items-start lg:gap-x-12 xl:gap-x-16"
                        onSubmit={(event) => {
                            event.preventDefault();
                            void checkout();
                        }}
                    >
                        <CartItemList
                            items={items}
                            onQuantityChange={updateQuantity}
                            onRemove={removeItem}
                        />

                        <CartSummary
                            subtotal={subtotal}
                            hasItems={hasItems}
                            placingOrder={placingOrder}
                            onCheckout={() => void checkout()}
                            onContinueShopping={() => navigate('/products')}
                            onClearCart={clearCart}
                        />
                    </form>
                )}
            </div>
        </div>
    );
}

export default ShoppingCart;