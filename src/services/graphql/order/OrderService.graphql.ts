import getServiceEndpoint from "@/utils/HostnameResolver.ts";
import { GraphQLService } from "@/services/graphql/GraphQLService.ts";
import {
    ALL_ORDERS,
    CREATE_ORDER,
    GET_ORDER_DETAIL,
    ORDER_BY_ID,
    ORDER_BY_SESSION_ID,
    UPDATE_CUSTOMER_INFORMATION,
    UPDATE_ORDER_STATUS,
} from "./order.queries.ts";
import { CustomerInformation, OrderData, OrderDetailData, OrderInput, OrderItemData } from "@/types/order.types.ts";
import { FilterRequest, PageRequest } from "@/types/graphql/query.types.ts";
import { CartStore } from "@/store/CartStore.ts";
import { OrderStatus } from "@/constants/enums/OrderStatus.ts";
import {getCartItemsStorageKey} from '@/utils/storefront/tenantStorageKeys'

const graphQLEndpoint = getServiceEndpoint(8080) + '/api/graphql';

export async function apiGetAllOrders(pageRequest: PageRequest, filterRequest: FilterRequest): Promise<OrderData[]> {
    const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);
    const result = await client.request<{ allOrders: OrderData[] }>(ALL_ORDERS, {
        pageRequest,
        filterRequest,
    });
    return result.allOrders ?? [];
}

export async function apiCreateOrder(order: OrderInput): Promise<OrderData> {
    const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);
    const result = await client.request<{ createOrder: OrderData }>(CREATE_ORDER, { order });
    return result.createOrder;
}

export async function apiUpdateCustomerInformation(
    sessionId: string,
    customer: CustomerInformation
): Promise<CustomerInformation> {
    const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);
    const result = await client.request<{ updateCustomerInformation: CustomerInformation }>(
        UPDATE_CUSTOMER_INFORMATION,
        { sessionId, customer }
    );
    return result.updateCustomerInformation;
}

export async function apiUpdateOrderStatus(
    status: OrderStatus,
    sessionId?: string
): Promise<{ id: string; status: string } | null> {
    const sid = sessionId ?? CartStore.getOrderSessionId();
    if (!sid) {
        throw new Error('Missing sessionId to update order status');
    }
    const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);
    const result = await client.request<{ updateOrderStatus: { id: string; status: string } }>(
        UPDATE_ORDER_STATUS,
        { sessionId: sid, status }
    );
    return result.updateOrderStatus ?? null;
}

export async function apiOrderById(id: string): Promise<OrderData> {
    const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);
    const result = await client.request<{ orderById: OrderData }>(ORDER_BY_ID, { id });
    return result.orderById;
}

export async function apiOrderBySessionId(sessionId: string): Promise<OrderData> {
    const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);
    const result = await client.request<{ orderBySessionId: OrderData }>(ORDER_BY_SESSION_ID, { sessionId });
    return result.orderBySessionId;
}

export async function apiGetOrderDetail(orderid: string): Promise<OrderDetailData> {
    const client = await GraphQLService.getGraphQLClient(graphQLEndpoint);
    const result = await client.request<{ getOrderDetail: OrderDetailData }>(GET_ORDER_DETAIL, { orderid });
    return result.getOrderDetail;
}

// ---------------------------------------------------------------------------
// Local-only cart helper (no network call — merges items into localStorage)
// ---------------------------------------------------------------------------
export async function addToCart(order: OrderData): Promise<OrderData> {
    const cartItemsKey = getCartItemsStorageKey();
    const incoming: OrderItemData[] = Array.isArray(order?.items) ? order.items : [];

    let existing: OrderItemData[] = [];
    try {
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem(cartItemsKey) : null;
        const parsed = raw ? JSON.parse(raw) : [];
        existing = Array.isArray(parsed) ? parsed : [];
    } catch {
        existing = [];
    }

    const merged: OrderItemData[] = [...existing];
    for (const inc of incoming) {
        const vid = typeof inc.variant === 'string'
            ? inc.variant
            : (inc.variant as any)?.id;

        if (vid == null) {
            merged.push({ ...inc });
            continue;
        }

        const idx = merged.findIndex((m) => {
            const mVid = typeof m.variant === 'string' ? m.variant : (m.variant as any)?.id;
            return mVid === vid;
        });

        if (idx >= 0) {
            const prev = merged[idx] ?? {};
            merged[idx] = {
                ...prev,
                ...inc,
                quantity: Number(prev.quantity ?? 0) + Number(inc.quantity ?? 0),
                unitPrice: typeof inc.unitPrice === 'number' ? inc.unitPrice : prev.unitPrice,
                variant: (typeof inc.variant === 'object' && inc.variant !== null)
                    ? inc.variant
                    : prev.variant,
            };
        } else {
            merged.push({ ...inc });
        }
    }

    try {
        if (typeof window !== 'undefined') {
            window.localStorage.setItem(cartItemsKey, JSON.stringify(merged));
        }
    } catch {
        // ignore
    }

    const localOrder: OrderData = { ...(order ?? {}), items: merged };
    CartStore.setFromOrder(localOrder);
    return localOrder;
}
