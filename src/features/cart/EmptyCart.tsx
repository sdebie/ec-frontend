import { ShoppingBag } from 'lucide-react';

import { Button } from '@/primitives/button';

type EmptyCartProps = {
    onBrowse: () => void;
};

export default function EmptyCart({ onBrowse }: EmptyCartProps) {
    return (
        <div className="mt-12 rounded-2xl border border-dashed border-(--sf-border) bg-(--sf-panel) px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-(--sf-bg) shadow-sm ring-1 ring-(--sf-border)">
                <ShoppingBag className="h-8 w-8 text-(--sf-muted-text)" />
            </div>

            <h2 className="mt-6 text-xl font-semibold text-(--sf-text)">Your cart is empty</h2>

            <p className="mt-2 text-sm text-(--sf-muted-text)">
                Browse the catalogue and add products to start a new order.
            </p>

            <div className="mt-8">
                <Button
                    type="button"
                    className="inline-flex items-center rounded-md px-4 py-3 text-sm font-medium shadow-sm"
                    onClick={onBrowse}
                >
                    Browse Products
                </Button>
            </div>
        </div>
    );
}
