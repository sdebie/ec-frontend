import {useNavigate} from 'react-router-dom';
import {Checkout} from '@/features/checkout';

export default function DefaultCheckoutPage() {
    const navigate = useNavigate();

    return <Checkout onInStoreOrder={() => navigate('/')}/>;
}
