import React from 'react';
import {ShoppingBag} from 'lucide-react';

type EmptyCartProps = {
    onBrowse: () => void;
};

const EmptyCart: React.FC<EmptyCartProps> = ({onBrowse}) => {
    return (
        <div className="mt-12 rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-16 text-center">
            <div
                className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-gray-200">
                <ShoppingBag className="h-8 w-8 text-gray-400"/>
            </div>

            <h2 className="mt-6 text-xl font-semibold text-gray-900">
                Your cart is empty
            </h2>

            <p className="mt-2 text-sm text-gray-500">
                Browse the catalogue and add products to start a new order.
            </p>

            <div className="mt-8">
                <button
                    type="button"
                    className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-3 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                    onClick={onBrowse}
                >
                    Browse Products
                </button>
            </div>
        </div>
    );
};

export default EmptyCart;