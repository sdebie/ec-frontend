import React from 'react';

interface Address {
  street: string;
  city: string;
  postalCode: string;
  province: string;
}

interface Props {
  show: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  email: string;
  address: Address;
  needsShippingAddress: boolean;
  isProcessing: boolean;
}

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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={() => !isProcessing && onClose()} />
      <div className="relative z-10 w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl border p-6">
        <h4 className="text-lg font-bold text-gray-900">Confirm your details</h4>
        <p className="text-sm text-gray-600 mt-1">We will create an account using the info below for quicker checkout next time.</p>

        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-start gap-3">
            <span className="w-20 text-gray-500">Email</span>
            <span className="font-medium break-all">{email || '—'}</span>
          </div>
          {needsShippingAddress && (
            <>
              <div className="flex items-start gap-3">
                <span className="w-20 text-gray-500">Street</span>
                <span className="font-medium">{address.street || '—'}</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-20 text-gray-500">City</span>
                <span className="font-medium">{address.city || '—'}</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-20 text-gray-500">Postal</span>
                <span className="font-medium">{address.postalCode || '—'}</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="w-20 text-gray-500">Province</span>
                <span className="font-medium">{address.province || '—'}</span>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white"
            onClick={() => !isProcessing && onClose()}
            disabled={isProcessing}
          >
            Edit details
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold disabled:opacity-60"
            onClick={async () => { if (isProcessing) return; onClose(); await onConfirm(); }}
            disabled={isProcessing}
          >
            Confirm & Create Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default SaveConfirmModal;
