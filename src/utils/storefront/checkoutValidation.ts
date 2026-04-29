import {CustomerProfile} from '@/services/CustomerService';
import {PaymentMethodKey} from '@/services/StoreSettings';

interface Address {
    street: string;
    city: string;
    postalCode: string;
    province: string;
}

interface Params {
    emailValid: boolean;
    selectedMethodId: string | null;
    needsShippingAddress: boolean;
    address: Address;
    selectedPayment: PaymentMethodKey | null;
    customer: CustomerProfile | null;
    returningChoice: 'login' | 'guest' | null;
    isAuthenticated: boolean;
    saveDetails: boolean;
    registerPassword: string;
    registerPasswordConfirm: string;
}

export const canSubmitCheckout = ({
                                      emailValid,
                                      selectedMethodId,
                                      needsShippingAddress,
                                      address,
                                      selectedPayment,
                                      customer,
                                      returningChoice,
                                      isAuthenticated,
                                      saveDetails,
                                      registerPassword,
                                      registerPasswordConfirm,
                                  }: Params) => {
    if (!emailValid) return false;
    if (!selectedMethodId) return false;
    if (!selectedPayment) return false;

    if (needsShippingAddress && !address.street) return false;

    const requiresLogin =
        needsShippingAddress &&
        !!customer &&
        customer.hasPassword &&
        returningChoice === 'login' &&
        !isAuthenticated;

    if (requiresLogin) return false;

    const invalidPasswordSetup =
        needsShippingAddress &&
        saveDetails &&
        (!registerPassword ||
            registerPassword.length < 6 ||
            registerPassword !== registerPasswordConfirm);

    if (invalidPasswordSetup) return false;

    return true;
};