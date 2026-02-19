import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Success from './pages/cart/Success.js';
import CheckoutPayFast from './pages/cart/CheckoutPayFast.js';
import AddToCart from './pages/cart/AddToCart.tsx';
import Products from './pages/products/Products';
import PageHeader from './components/PageHeader';

function App() {
    return (
        <BrowserRouter>
            <PageHeader />
            <Routes>
                <Route path="/" element={<Products />} />
                <Route path="/products" element={<Products />} />
                <Route path="/checkout" element={<CheckoutPayFast />} />
                <Route path="/payment-success" element={<Success />} />
                <Route path="/add-to-cart" element={<AddToCart />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;