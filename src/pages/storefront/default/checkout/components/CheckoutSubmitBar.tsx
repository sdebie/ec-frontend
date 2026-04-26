import React from 'react';

type Props = {
    disabled: boolean;
    selectedPayment: string | null;
    onInStoreCheckout: () => void;
    onPayFastCheckout: () => void;
};

const CheckoutSubmitBar: React.FC<Props> = ({
    disabled,
    selectedPayment,
    onInStoreCheckout,
    onPayFastCheckout,
}) => {
    const isInStore = selectedPayment === 'IN_STORE';

    return (
        <div className="rounded-2xl border border-(--sf-border) bg-(--sf-panel) p-4 shadow-sm">
            <button
                type="button"
                onClick={isInStore ? onInStoreCheckout : onPayFastCheckout}
                disabled={disabled}
                className="w-full rounded-xl bg-(--sf-accent) px-4 py-3 text-sm font-semibold text-(--sf-accent-text) transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isInStore ? 'Reserve & Pay In-Store' : 'Complete purchase'}
            </button>
        </div>
    );
};

export default CheckoutSubmitBar;

