import React from 'react';

type Address = {
    street: string;
    city: string;
    postalCode: string;
    province: string;
};

type Props = {
    show: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void> | void;
    email: string;
    address: Address;
    needsShippingAddress: boolean;
    isProcessing: boolean;
};

const SaveConfirmModal: React.FC<Props> = ({
    show,
    onClose,
    onConfirm,
    email,
    address,
    needsShippingAddress,
    isProcessing,
}) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => !isProcessing && onClose()}/>
            <div className="relative z-10 w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-xl">
                <h4 className="text-lg font-semibold text-gray-900">Confirm your details</h4>
                <p className="mt-1 text-sm text-gray-600">
                    We will create an account using these details for quicker checkout next time.
                </p>

                <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                        <span className="w-20 text-gray-500">Email</span>
                        <span className="font-medium break-all text-gray-900">{email || '-'}</span>
                    </div>
                    {needsShippingAddress && (
                        <>
                            <div className="flex items-start gap-2"><span className="w-20 text-gray-500">Street</span><span className="font-medium text-gray-900">{address.street || '-'}</span></div>
                            <div className="flex items-start gap-2"><span className="w-20 text-gray-500">City</span><span className="font-medium text-gray-900">{address.city || '-'}</span></div>
                            <div className="flex items-start gap-2"><span className="w-20 text-gray-500">Postal</span><span className="font-medium text-gray-900">{address.postalCode || '-'}</span></div>
                            <div className="flex items-start gap-2"><span className="w-20 text-gray-500">Province</span><span className="font-medium text-gray-900">{address.province || '-'}</span></div>
                        </>
                    )}
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => !isProcessing && onClose()}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
                    >
                        Edit details
                    </button>
                    <button
                        type="button"
                        disabled={isProcessing}
                        onClick={async () => {
                            if (isProcessing) return;
                            onClose();
                            await onConfirm();
                        }}
                        className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                    >
                        Confirm & Create Account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SaveConfirmModal;

