export type CheckoutTenantCallbacks = {
    /** Called after in-store checkout completes (clear cart, navigate home, etc.). */
    onInStoreOrder: () => void;
    /** Optional hook when PayFast fields are returned (before hosted redirect); wire when tenant flow needs it. */
    onPaymentSuccess?: () => void;
};
