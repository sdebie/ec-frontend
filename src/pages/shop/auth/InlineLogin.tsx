import React, { useState } from 'react';
import { loginCustomer, CustomerProfile } from '../../../services/CustomerService.ts';

interface InlineLoginProps {
  email: string;
  onLoginSuccess: (profile: CustomerProfile) => void;
  compact?: boolean;
  showLabel?: boolean;
}

const InlineLogin: React.FC<InlineLoginProps> = ({
  email,
  onLoginSuccess,
  compact = true,
  showLabel = true,
}) => {
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) return;
    setError(null);
    setLoading(true);

    try {
      const profile = await loginCustomer(email.trim(), password);
      setPassword('');
      onLoginSuccess(profile);
    } catch (err: any) {
      const errorMsg = typeof err?.message === 'string' ? err.message : 'Login failed. Please check your password.';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {showLabel && <label className="block text-sm font-medium text-gray-700">Password</label>}
        <div className="flex gap-2">
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors disabled:bg-gray-100"
          />
          <button
            onClick={handleLogin}
            disabled={loading || !password}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  // Full-width version
  return (
    <div className="space-y-3">
      {showLabel && <label className="block text-sm font-medium text-gray-700">Password</label>}
      <input
        type="password"
        placeholder="Enter your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors disabled:bg-gray-100"
      />
      <button
        onClick={handleLogin}
        disabled={loading || !password}
        className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default InlineLogin;




