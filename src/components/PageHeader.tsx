import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CartIcon from './CartIcon';

const PageHeader: React.FC = () => {
  const navigate = useNavigate();
  return (
    <header className="w-full bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-lg font-bold text-gray-900 hover:text-blue-600">
            E-Comm Demo
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <CartIcon
            className="hover:text-blue-600"
            size={22}
            onClick={() => navigate('/checkout')}
          />
        </div>
      </div>
    </header>
  );
};

export default PageHeader;
