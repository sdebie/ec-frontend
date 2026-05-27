import { useNavigate } from 'react-router-dom';

import { Checkout } from '@/features/checkout';
import { SurfaceProvider } from '@/primitives/surface';

export default function CheckoutScreen() {
    const navigate = useNavigate();

    return (
        <SurfaceProvider surface="storefront">
            <Checkout onInStoreOrder={() => navigate('/')} />
        </SurfaceProvider>
    );
}
