import React, { useState } from 'react';
import {useNavigate} from 'react-router-dom';

import StaffService from '../../services/StaffService.ts';

interface AdminLoginProps {
    onLoginSuccess: () => void;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const data = await StaffService.adminLogin(credentials);
            // Save the token and call the callback
            localStorage.setItem('admin_token', data.token);
            const userWithAuthority = {
                ...data,
                authority: [data.role] // Wraps 'SUPER_ADMIN' into ['SUPER_ADMIN']
            };
            localStorage.setItem('admin_user', JSON.stringify(userWithAuthority));

            if (data.resetPassword) {
                console.log('Password reset required. Redirecting to reset password page.');
                navigate('/admin/reset-password', {replace: true});
                return;
            }

            // 3. Trigger the callback to update global app state
            onLoginSuccess();
        } catch (err: any) {
            const message = err?.response?.data;
            setError(typeof message === 'string' ? message : 'Invalid credentials or unauthorized access');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
            <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg w-96 border border-gray-200">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Staff Portal</h2>

                <input
                    type="email"
                    placeholder="Email"
                    value={credentials.email}
                    className="w-full p-3 mb-4 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={credentials.password}
                    className="w-full p-3 mb-6 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                />

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors">
                    Log In
                </button>
                <div>
                    Hint: admin@gmail.com (Admin@123)
                </div>
            </form>
        </div>
    );
};

export default AdminLogin;