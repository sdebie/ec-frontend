
import CheckoutSubmitBar from '@/features/checkout/components/CheckoutSubmitBar.tsx';
import SaveConfirmModal from '@/features/checkout/components/SaveConfirmModal.tsx';
import { useCheckoutFlow } from '@/features/checkout/hooks/useCheckoutFlow.ts';
import ContactInfoSection from '@/features/checkout/sections/ContactInfoSection.tsx';
import OrderSummarySection from '@/features/checkout/sections/OrderSummarySection.tsx';
import PaymentMethodSection from '@/features/checkout/sections/PaymentMethodSection.tsx';
import ShippingMethodSection from '@/features/checkout/sections/ShippingMethodSection.tsx';

import type { CheckoutTenantCallbacks } from '@/features/checkout/types.ts';


export type CheckoutProps = CheckoutTenantCallbacks;

export function Checkout({ onInStoreOrder, onPaymentSuccess }: CheckoutProps) {
    const flow = useCheckoutFlow({ onInStoreOrder, onPaymentSuccess });

    return (
        <>
            <div className="min-h-screen bg-(--sf-bg)">
                <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-8 px-4 py-8 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-8">
                    <main className="space-y-6 lg:col-span-7">
                        <ContactInfoSection
                            email={flow.email}
                            setEmail={flow.setEmail}
                            emailValid={flow.emailValid}
                            emailTouched={flow.emailTouched}
                            setEmailTouched={flow.setEmailTouched}
                            lookupState={flow.lookupState}
                            customer={flow.customer}
                            isAuthenticated={flow.isAuthenticated}
                            returningChoice={flow.returningChoice}
                            setReturningChoice={flow.setReturningChoice}
                            handleLogin={flow.handleLogin}
                        />

                        <ShippingMethodSection
                            shippingMethods={flow.shippingMethods}
                            selectedMethodId={flow.selectedMethodId}
                            setSelectedMethodId={flow.setSelectedMethodId}
                            needsShippingAddress={flow.needsShippingAddress}
                            customer={flow.customer}
                            isAuthenticated={flow.isAuthenticated}
                            address={flow.address}
                            setAddress={flow.setAddress}
                            saveDetails={flow.saveDetails}
                            setSaveDetails={flow.setSaveDetails}
                            registerPassword={flow.registerPassword}
                            setRegisterPassword={flow.setRegisterPassword}
                            registerPasswordConfirm={flow.registerPasswordConfirm}
                            setRegisterPasswordConfirm={flow.setRegisterPasswordConfirm}
                            isAccountAddressEdited={flow.isAccountAddressEdited}
                            updateAccountAddress={flow.updateAccountAddress}
                            setUpdateAccountAddress={flow.setUpdateAccountAddress}
                        />

                        <PaymentMethodSection
                            enabledPayments={flow.enabledPayments}
                            paymentConfig={flow.paymentConfig}
                            selectedPayment={flow.selectedPayment}
                            setSelectedPayment={flow.setSelectedPayment}
                        />
                    </main>
                    <aside className="space-y-4 lg:col-span-5 lg:sticky lg:top-8 lg:self-start">
                        <OrderSummarySection
                            order={flow.order}
                            loading={flow.loading}
                            error={flow.error}
                            itemsTotal={flow.itemsTotal}
                            selectedShipping={flow.selectedShipping}
                            shippingFee={flow.shippingFee}
                            grandTotal={flow.grandTotal}
                        />
                        <CheckoutSubmitBar
                            disabled={flow.submitDisabled}
                            selectedPayment={flow.selectedPayment}
                            onInStoreCheckout={flow.handleInStoreCheckout}
                            onPayFastCheckout={flow.handlePayFastCheckout}
                        />
                    </aside>
                </div>
            </div>

            <SaveConfirmModal
                show={flow.showSaveConfirm}
                onClose={() => flow.setShowSaveConfirm(false)}
                onConfirm={flow.proceedInStoreCheckout}
                email={flow.email}
                address={flow.address}
                needsShippingAddress={flow.needsShippingAddress}
                isProcessing={flow.isProcessing}
            />
        </>
    );
}
