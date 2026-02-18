import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Success from './pages/Success';
import CheckoutPayFast from './pages/CheckoutPayFast';
import CreateOrder from './pages/CreateOrder';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<CreateOrder />} />
                <Route path="/checkout" element={<CheckoutPayFast />} />
                <Route path="/payment-success" element={<Success />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;