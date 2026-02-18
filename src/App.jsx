import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Success from './pages/Success';
import CheckoutPayFast from './pages/CheckoutPayFast';
import AddToCart from './pages/AddToCart.js';
import PageHeader from './components/PageHeader';

function App() {
    return (
        <BrowserRouter>
            <PageHeader />
            <Routes>
                <Route path="/" element={<AddToCart />} />
                <Route path="/checkout" element={<CheckoutPayFast />} />
                <Route path="/payment-success" element={<Success />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;