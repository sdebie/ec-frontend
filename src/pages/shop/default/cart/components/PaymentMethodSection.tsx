import React from 'react';
import { CreditCard } from 'lucide-react';
import { PaymentMethodKey, PaymentMethodsConfig, PaymentMethodInfo } from '../../../../../services/StoreSettings.ts';

interface Props {
  enabledPayments: PaymentMethodKey[];
  paymentConfig: PaymentMethodsConfig;
  selectedPayment: PaymentMethodKey | null;
  setSelectedPayment: (pm: PaymentMethodKey) => void;
}

const PaymentMethodSection: React.FC<Props> = ({
  enabledPayments,
  paymentConfig,
  selectedPayment,
  setSelectedPayment,
}) => {
  return (
    <section className="bg-white p-6 rounded-2xl shadow-sm border">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span className="bg-blue-600 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center">3</span>
        Payment Method
      </h3>
      {enabledPayments.length === 0 ? (
        <div className="p-4 border-2 border-yellow-400 bg-yellow-50 rounded-xl text-sm text-yellow-800">
          No payment methods are currently available. Please contact the store.
        </div>
      ) : (
        <div className="grid gap-3">
          {enabledPayments.map((pm) => {
            const info = paymentConfig[pm as PaymentMethodKey] as PaymentMethodInfo | undefined;
            const title = info?.displayName || (pm === 'IN_STORE' ? 'Pay in store' : 'FastPay');
            const desc = info?.description || (pm === 'IN_STORE' ? 'Cash/Card at Pickup' : 'Card / Instant EFT / Scan to Pay');
            return (
              <label key={pm} className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${selectedPayment === pm ? 'border-blue-600 bg-blue-50' : 'border-gray-100'}`}>
                <div className="flex justify-between items-center w-full">
                  <input
                    type="radio"
                    name="payment"
                    className="hidden"
                    checked={selectedPayment === pm}
                    onChange={() => setSelectedPayment(pm)}
                  />
                  <div className="flex items-center gap-3">
                    <CreditCard className="text-blue-600" />
                    <div>
                      <p className="font-bold">{title}</p>
                      {desc ? <p className="text-xs text-gray-500">{desc}</p> : null}
                    </div>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default PaymentMethodSection;
