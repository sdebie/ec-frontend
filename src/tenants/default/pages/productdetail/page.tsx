import {useParams} from 'react-router-dom';

import {useAddToCart} from '@/features/cart/hooks/useAddToCart.ts';
import {ProductDetail} from '@/features/catalog';

export default function DefaultProductDetailPage() {
    const {productId} = useParams();
    const {createOrder} = useAddToCart();

    if (!productId) {
        return <div className="min-h-screen bg-(--sf-bg) p-8">Product not found.</div>;
    }

    return (
        <ProductDetail
            productId={String(productId)}
            onAddToCart={async (variantId, unitPrice, productName) => {
                await createOrder({
                    items: [{quantity: 1, unitPrice, variant: variantId, productName}],
                });
            }}
        />
    );
}
