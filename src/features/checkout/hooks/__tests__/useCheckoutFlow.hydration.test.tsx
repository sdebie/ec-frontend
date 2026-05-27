import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { apiOrderBySessionId } = vi.hoisted(() => ({
    apiOrderBySessionId: vi.fn(),
}));

vi.mock('@/services/graphql/order/OrderService.graphql.ts', () => ({
    apiOrderBySessionId,
    apiOrderById: vi.fn(),
    apiUpdateOrderStatus: vi.fn(),
}));

vi.mock('@/features/checkout/hooks/useShippingMethods.ts', () => ({
    useShippingMethods: () => ({
        shippingMethods: [{ id: 'pickup', name: 'In-store pickup', active: true, baseFee: 0 }],
    }),
}));

vi.mock('@/features/checkout/hooks/usePaymentMethodsConfig.ts', () => ({
    usePaymentMethodsConfig: () => ({
        paymentConfig: {
            IN_STORE: { displayName: 'Pay in store', enabled: true },
            FASTPAY: { displayName: 'PayFast', enabled: true },
        },
        enabledPayments: ['IN_STORE', 'FASTPAY'],
        selectedPayment: 'IN_STORE',
        setSelectedPayment: vi.fn(),
    }),
}));

vi.mock('@/services/CustomerService.ts', () => ({
    lookupCustomer: vi.fn(async () => null),
    registerOrUpdateCustomer: vi.fn(),
    updateCustomerInformation: vi.fn(),
}));

describe('useCheckoutFlow — session hydration', () => {
    beforeEach(() => {
        localStorage.clear();
        apiOrderBySessionId.mockReset();
        window.history.pushState({}, '', '/checkout?sessionId=test-session');
    });

    it('loads order + customer email from apiOrderBySessionId when sessionId is present', async () => {
        apiOrderBySessionId.mockResolvedValue({
            id: 'order-1',
            sessionId: 'test-session',
            totalAmount: 50,
            customer: { email: 'buyer@example.com' },
            items: [{ quantity: 2, unitPrice: 25, variant: 'variant-1' }],
        });

        const { useCheckoutFlow } = await import('@/features/checkout/hooks/useCheckoutFlow.ts');

        const { result } = renderHook(() =>
            useCheckoutFlow({
                onInStoreOrder: vi.fn(),
            }),
        );

        await waitFor(() => expect(result.current.loading).toBe(false));

        expect(apiOrderBySessionId).toHaveBeenCalledWith('test-session');
        expect(result.current.email).toBe('buyer@example.com');
        expect(result.current.order?.items?.length).toBe(1);
        expect(result.current.itemsTotal).toBe(50);
    });
});
