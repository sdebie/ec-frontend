import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Success from './pages/cart/Success';
import CheckoutPayFast from './pages/cart/CheckoutPayFast';
import Cart from './pages/cart/Cart';
import Products from './pages/products/Products';
import PageHeader from './components/PageHeader';

function App() {
    return (
        <BrowserRouter>
            <PageHeader />
            <Routes>
                <Route path="/" element={<Products />} />
                <Route path="/products" element={<Products />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<CheckoutPayFast />} />
                <Route path="/payment-success" element={<Success />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;