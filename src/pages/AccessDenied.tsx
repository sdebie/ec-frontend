import React from 'react';
import { useNavigate } from 'react-router-dom';

const AccessDenied: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-gray-50 to-gray-100">
            <div className="text-center px-4">
                <div className="mb-8">
                    <h1 className="text-6xl font-bold text-gray-900 mb-2">403</h1>
                    <h2 className="text-3xl font-semibold text-gray-700 mb-4">Access Denied</h2>
                </div>
                <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
                    You don't have permission to access this page. Your current role does not grant you access to this resource.
                </p>
                <div className="flex gap-4 justify-center">
                    <button
                        onClick={() => navigate('/admin')}
                        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Go to Dashboard
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-gray-300 text-gray-800 font-medium rounded-lg hover:bg-gray-400 transition-colors"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccessDenied;

