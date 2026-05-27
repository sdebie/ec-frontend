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
            <div className="absolute inset-0 bg-black/40" onClick={() => !isProcessing && onClose()} />
            <div className="relative z-10 w-full max-w-md rounded-2xl border border-(--sf-border) bg-(--sf-panel) p-6 shadow-xl">
                <h4 className="text-lg font-semibold text-(--sf-text)">Confirm your details</h4>
                <p className="mt-1 text-sm text-(--sf-muted-text)">
                    We will create an account using these details for quicker checkout next time.
                </p>

                <div className="mt-4 space-y-2 text-sm">
                    <div className="flex items-start gap-2">
                        <span className="w-20 text-(--sf-muted-text)">Email</span>
                        <span className="font-medium break-all text-(--sf-text)">{email || '-'}</span>
                    </div>
                    {needsShippingAddress && (
                        <>
                            <div className="flex items-start gap-2">
                                <span className="w-20 text-(--sf-muted-text)">Street</span>
                                <span className="font-medium text-(--sf-text)">{address.street || '-'}</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="w-20 text-(--sf-muted-text)">City</span>
                                <span className="font-medium text-(--sf-text)">{address.city || '-'}</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="w-20 text-(--sf-muted-text)">Postal</span>
                                <span className="font-medium text-(--sf-text)">{address.postalCode || '-'}</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="w-20 text-(--sf-muted-text)">Province</span>
                                <span className="font-medium text-(--sf-text)">{address.province || '-'}</span>
                            </div>
                        </>
                    )}
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <button
                        type="button"
                        disabled={isProcessing}
                        onClick={() => !isProcessing && onClose()}
                        className="rounded-lg border border-(--sf-border) px-4 py-2 text-sm font-medium text-(--sf-text)"
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
                        className="rounded-lg bg-(--sf-accent) px-4 py-2 text-sm font-semibold text-(--sf-accent-text) hover:opacity-90 disabled:opacity-60"
                    >
                        Confirm & Create Account
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SaveConfirmModal;
