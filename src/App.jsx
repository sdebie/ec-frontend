import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Checkout from './pages/Checkout';
import Success from './pages/Success';
import CheckoutPayFast from "@/pages/CheckoutPayFast.js";
import CreateOrder from './pages/CreateOrder';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<CheckoutPayFast />} />
                <Route path="/create-order" element={<CreateOrder />} />
                <Route path="/payment-success" element={<Success />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;