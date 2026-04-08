import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import StaffService from '../../services/StaffService.ts';

const AdminResetPassword: React.FC = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const rawUser = localStorage.getItem('admin_user');
        if (!rawUser) {
            setError('Session expired. Please login again.');
            navigate('/admin/login', {replace: true});
            return;
        }

        const user = JSON.parse(rawUser) as { email?: string; role?: string; token?: string; authority?: string[] };

        if (!user.email) {
            setError('Missing user email for password reset.');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        try {
            setIsSaving(true);
            await StaffService.resetPassword({
                email: user.email,
                password,
                confirmPassword,
            });

            const updatedUser = {...user, resetPassword: false};
            localStorage.setItem('admin_user', JSON.stringify(updatedUser));
            navigate('/admin', {replace: true});
        } catch (_err) {
            setError('Could not reset password. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 font-sans">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg w-96 border border-gray-200">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Reset Password</h2>

                <input
                    type="password"
                    placeholder="New password"
                    value={password}
                    className="w-full p-3 mb-4 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    onChange={(e) => setPassword(e.target.value)}
                />

                <input
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    className="w-full p-3 mb-6 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 rounded-lg transition-colors"
                >
                    {isSaving ? 'Saving...' : 'Update Password'}
                </button>
            </form>
        </div>
    );
};

export default AdminResetPassword;

