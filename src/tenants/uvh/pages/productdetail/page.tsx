import { useParams } from 'react-router-dom';

import { useAddToCart } from '@/features/cart/hooks/useAddToCart.ts';
import { UvhProductDetail } from '@/tenants/uvh/pages/productdetail/UvhProductDetail.tsx';

export default function UvhProductDetailPage() {
    const { productId } = useParams();
    const { createOrder } = useAddToCart();

    if (!productId) {
        return <div className="min-h-screen bg-(--sf-bg) p-8">Product not found.</div>;
    }

    return (
        <UvhProductDetail
            productId={String(productId)}
            onAddToCart={async (variantId, unitPrice, quantity) => {
                await createOrder({
                    items: [{ quantity, unitPrice, variant: variantId }],
                });
            }}
        />
    );
}
