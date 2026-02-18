import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Success from './pages/Success';
import CheckoutPayFast from './pages/CheckoutPayFast';
import AddToCart from './pages/AddToCart.js';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<AddToCart />} />
                <Route path="/checkout" element={<CheckoutPayFast />} />
                <Route path="/payment-success" element={<Success />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;